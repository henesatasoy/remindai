import { supabase } from "@/integrations/supabase/client";

export type AssignmentGroup = "positive" | "negative" | "control";

export interface ParticipantAssignment {
  assigned_group: AssignmentGroup;
  participant_code: string;
  slot_number: number;
}

/**
 * Atomically assigns the current session to a group using the
 * "drawing without replacement" weighted-random strategy implemented
 * server-side in the `assign_participant_group` SQL function.
 *
 * The DB function:
 *  - Counts current participants in each group (max 27 each, total 81)
 *  - Picks a group with probability proportional to remaining slots
 *  - Generates a sequential code (P01..P27, N01..N27, K01..K27)
 *  - Inserts the assignment row atomically (idempotent per session)
 */
export const assignParticipantGroup = async (
  sessionId: string
): Promise<ParticipantAssignment | null> => {
  try {
    // Cast to any because the generated types haven't been refreshed yet for the new RPC
    const { data, error } = await (supabase.rpc as any)("assign_participant_group", {
      p_session_id: sessionId,
    });

    if (error) {
      console.error("Failed to assign participant group:", error);
      return null;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return null;

    return {
      assigned_group: row.assigned_group as AssignmentGroup,
      participant_code: row.participant_code as string,
      slot_number: row.slot_number as number,
    };
  } catch (err) {
    console.error("Error assigning participant group:", err);
    return null;
  }
};

/**
 * Returns the conditional message text for a given assignment group.
 * Plain text only — no group names or visual cues that would reveal
 * the assignment to an in-person observer.
 */
export const getInterventionMessage = (group: AssignmentGroup): string => {
  switch (group) {
    case "positive":
      return "Analiz tamamlandı! Bilişsel haritalamanıza göre, bu tür akıl yürütme görevlerinde %95'lik dilimde, yani <strong>'Üstün Potansiyel'</strong> seviyesindesiniz. <strong>Bir sonraki aşamada çok daha yüksek bir performans sergilemeniz öngörülüyor.</strong>";
    case "negative":
      return "Analiz tamamlandı. Bilişsel haritalamanıza göre, bu tür akıl yürütme görevlerinde %5'lik dilimde, yani 'Düşük Potansiyel' seviyesindesiniz.";
    case "control":
      return "Analiz tamamlandı ve cevaplarınız sisteme kaydedildi! İkinci test aşamasının verileri bekleniyor.";
  }
};
