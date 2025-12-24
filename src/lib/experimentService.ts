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
 * Fetches all experiment results grouped by session
 */
export const fetchAllResults = async () => {
  const { data, error } = await supabase
    .from('experiment_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch results:', error);
    return [];
  }

  return data || [];
};

/**
 * Fetches aggregated session data for the admin dashboard
 */
export const fetchSessionSummaries = async (phaseFilter?: string) => {
  let query = supabase
    .from('experiment_results')
    .select('*')
    .order('created_at', { ascending: false });

  if (phaseFilter && phaseFilter !== 'all') {
    query = query.eq('phase', phaseFilter);
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
    created_at: string;
    attention_check_click: boolean | null;
  }>();

  (data || []).forEach((result) => {
    const existing = sessionMap.get(result.session_id);
    if (existing) {
      existing.phases.add(result.phase);
      existing.total_correct += result.is_correct ? 1 : 0;
      existing.total_questions += 1;
      existing.total_reaction_time += result.reaction_time_ms;
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
        created_at: result.created_at,
        attention_check_click: result.attention_check_click,
      });
    }
  });

  return Array.from(sessionMap.values()).map((session) => ({
    session_id: session.session_id,
    phases: Array.from(session.phases).join(', '),
    total_correct: session.total_correct,
    total_questions: session.total_questions,
    avg_reaction_time: Math.round(session.total_reaction_time / session.total_questions),
    created_at: session.created_at,
    attention_check_click: session.attention_check_click,
  }));
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
