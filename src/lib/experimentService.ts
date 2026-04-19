import { supabase } from "@/integrations/supabase/client";

export interface ExperimentResult {
  session_id: string;
  phase: 'practice' | 'phase1' | 'phase2';
  question_index: number;
  is_correct: boolean;
  reaction_time_ms: number;
  timed_out: boolean;
  attention_check_click?: boolean | null;
}

/**
 * Generates a unique session ID for the experiment
 */
export const generateSessionId = (): string => {
  return crypto.randomUUID();
};

/**
 * Saves a single experiment result to the database
 * Runs asynchronously without blocking UI
 */
export const saveExperimentResult = async (result: ExperimentResult): Promise<void> => {
  try {
    const { error } = await supabase
      .from('experiment_results')
      .insert({
        session_id: result.session_id,
        phase: result.phase,
        question_index: result.question_index,
        is_correct: result.is_correct,
        reaction_time_ms: result.reaction_time_ms,
        timed_out: result.timed_out,
        attention_check_click: result.attention_check_click ?? null,
      });

    if (error) {
      console.error('Failed to save experiment result:', error);
    } else {
      console.log(`Saved result for ${result.phase} Q${result.question_index + 1}`);
    }
  } catch (err) {
    console.error('Error saving experiment result:', err);
  }
};

/**
 * Logs a click on a fake sidebar element (Yeni Sohbet / chat history item)
 */
export const logSidebarInteraction = async (
  sessionId: string,
  phase: string,
  element: string
): Promise<void> => {
  try {
    const { error } = await (supabase.from as any)('sidebar_interactions').insert({
      session_id: sessionId,
      phase,
      element,
    });
    if (error) console.error('Failed to log sidebar interaction:', error);
  } catch (err) {
    console.error('Error logging sidebar interaction:', err);
  }
};

/**
 * Fetches all experiment results grouped by session
 */
export const fetchAllResults = async (startDate?: Date, endDate?: Date, phaseFilter?: string) => {
  let query = supabase
    .from('experiment_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (phaseFilter && phaseFilter !== 'all') {
    if (phaseFilter === 'phase1_2') {
      query = query.in('phase', ['phase1', 'phase2']);
    } else {
      query = query.eq('phase', phaseFilter);
    }
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch results:', error);
    return [];
  }

  return data || [];
};

/**
 * Fetches aggregated session data for the admin dashboard
 */
export const fetchSessionSummaries = async (phaseFilter?: string, startDate?: Date, endDate?: Date) => {
  let query = supabase
    .from('experiment_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (phaseFilter && phaseFilter !== 'all') {
    if (phaseFilter === 'phase1_2') {
      query = query.in('phase', ['phase1', 'phase2']);
    } else {
      query = query.eq('phase', phaseFilter);
    }
  }

  if (startDate) {
    query = query.gte('created_at', startDate.toISOString());
  }
  if (endDate) {
    const endOfDay = new Date(endDate);
    endOfDay.setHours(23, 59, 59, 999);
    query = query.lte('created_at', endOfDay.toISOString());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch session summaries:', error);
    return [];
  }

  // Group by session_id and calculate aggregates
  const sessionMap = new Map<string, {
    session_id: string;
    phases: Set<string>;
    total_correct: number;
    total_questions: number;
    total_reaction_time: number;
    fast_response_count: number;
    created_at: string;
    attention_check_click: boolean | null;
  }>();

  (data || []).forEach((result) => {
    const isRealQuestion = result.phase !== 'practice' && result.question_index >= 0;
    const isFast = isRealQuestion && !result.timed_out && result.reaction_time_ms < 3000;
    const existing = sessionMap.get(result.session_id);
    if (existing) {
      existing.phases.add(result.phase);
      existing.total_correct += result.is_correct ? 1 : 0;
      existing.total_questions += 1;
      existing.total_reaction_time += result.reaction_time_ms;
      if (isFast) existing.fast_response_count += 1;
      if (result.attention_check_click !== null) {
        existing.attention_check_click = result.attention_check_click;
      }
    } else {
      sessionMap.set(result.session_id, {
        session_id: result.session_id,
        phases: new Set([result.phase]),
        total_correct: result.is_correct ? 1 : 0,
        total_questions: 1,
        total_reaction_time: result.reaction_time_ms,
        fast_response_count: isFast ? 1 : 0,
        created_at: result.created_at,
        attention_check_click: result.attention_check_click,
      });
    }
  });

  // Fetch participant assignments for these sessions
  const sessionIds = Array.from(sessionMap.keys());
  const assignmentMap = new Map<string, { assigned_group: string; participant_code: string }>();
  const focusMap = new Map<string, { blur_count: number; total_blur_ms: number }>();
  const sidebarMap = new Map<string, number>();

  if (sessionIds.length > 0) {
    const [assignmentsRes, focusRes, sidebarRes] = await Promise.all([
      supabase
        .from('participant_assignments')
        .select('session_id, assigned_group, participant_code')
        .in('session_id', sessionIds),
      (supabase.from as any)('session_focus_events')
        .select('session_id, event_type, duration_ms')
        .in('session_id', sessionIds),
      (supabase.from as any)('sidebar_interactions')
        .select('session_id')
        .in('session_id', sessionIds),
    ]);

    if (assignmentsRes.error) {
      console.error('Failed to fetch participant assignments:', assignmentsRes.error);
    } else {
      (assignmentsRes.data || []).forEach((a: any) => {
        assignmentMap.set(a.session_id, {
          assigned_group: a.assigned_group,
          participant_code: a.participant_code,
        });
      });
    }

    if (focusRes.error) {
      console.error('Failed to fetch focus events:', focusRes.error);
    } else {
      (focusRes.data || []).forEach((f: any) => {
        const existing = focusMap.get(f.session_id) ?? { blur_count: 0, total_blur_ms: 0 };
        if (f.event_type === 'blur') {
          existing.blur_count += 1;
        } else if (f.event_type === 'focus' && typeof f.duration_ms === 'number') {
          existing.total_blur_ms += f.duration_ms;
        }
        focusMap.set(f.session_id, existing);
      });
    }

    if (sidebarRes.error) {
      console.error('Failed to fetch sidebar interactions:', sidebarRes.error);
    } else {
      (sidebarRes.data || []).forEach((s: any) => {
        sidebarMap.set(s.session_id, (sidebarMap.get(s.session_id) ?? 0) + 1);
      });
    }
  }

  return Array.from(sessionMap.values()).map((session) => {
    const assignment = assignmentMap.get(session.session_id);
    const focus = focusMap.get(session.session_id);
    return {
      session_id: session.session_id,
      phases: Array.from(session.phases).join(', '),
      total_correct: session.total_correct,
      total_questions: session.total_questions,
      avg_reaction_time: Math.round(session.total_reaction_time / session.total_questions),
      fast_response_count: session.fast_response_count,
      created_at: session.created_at,
      attention_check_click: session.attention_check_click,
      assigned_group: assignment?.assigned_group ?? null,
      participant_code: assignment?.participant_code ?? null,
      blur_count: focus?.blur_count ?? 0,
      total_blur_ms: focus?.total_blur_ms ?? 0,
      sidebar_click_count: sidebarMap.get(session.session_id) ?? 0,
    };
  });
};

/**
 * Fetches all tab focus/blur events for a specific session
 */
export const fetchSessionFocusEvents = async (sessionId: string) => {
  const { data, error } = await (supabase.from as any)('session_focus_events')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch focus events:', error);
    return [];
  }

  return data || [];
};

/**
 * Fetches all sidebar/prompt interactions for a specific session
 */
export const fetchSessionSidebarInteractions = async (sessionId: string) => {
  const { data, error } = await (supabase.from as any)('sidebar_interactions')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Failed to fetch sidebar interactions:', error);
    return [];
  }

  return data || [];
};

/**
 * Fetches detailed results for a specific session
 */
export const fetchSessionDetails = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('experiment_results')
    .select('*')
    .eq('session_id', sessionId)
    .order('phase', { ascending: true })
    .order('question_index', { ascending: true });

  if (error) {
    console.error('Failed to fetch session details:', error);
    return [];
  }

  return data || [];
};

/**
 * Deletes all results for a specific session
 */
export const deleteSession = async (sessionId: string): Promise<boolean> => {
  try {
    const [resultsRes, focusRes, assignmentRes, sidebarRes] = await Promise.all([
      supabase.from('experiment_results').delete().eq('session_id', sessionId),
      (supabase.from as any)('session_focus_events').delete().eq('session_id', sessionId),
      supabase.from('participant_assignments').delete().eq('session_id', sessionId),
      (supabase.from as any)('sidebar_interactions').delete().eq('session_id', sessionId),
    ]);

    if (resultsRes.error || focusRes.error || assignmentRes.error || sidebarRes.error) {
      console.error('Failed to delete session:', {
        results: resultsRes.error,
        focus: focusRes.error,
        assignment: assignmentRes.error,
        sidebar: sidebarRes.error,
      });
      return false;
    }

    console.log(`Deleted session: ${sessionId}`);
    return true;
  } catch (err) {
    console.error('Error deleting session:', err);
    return false;
  }
};
