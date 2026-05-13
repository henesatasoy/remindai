import { supabase } from "@/integrations/supabase/client";

export type AssignmentGroup = "positive" | "negative" | "control";

export interface ParticipantAssignment {
  assigned_group: AssignmentGroup;
  participant_code: string;
  slot_number: number;
}

export type AssignmentResult =
  | { status: "assigned"; assignment: ParticipantAssignment }
  | { status: "full" }
  | { status: "error" };

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
): Promise<AssignmentResult> => {
  try {
    // Cast to any because the generated types haven't been refreshed yet for the new RPC
    const { data, error } = await (supabase.rpc as any)("assign_participant_group", {
      p_session_id: sessionId,
    });

    if (error) {
      const msg = (error.message || "").toLowerCase();
      if (msg.includes("slots are full") || msg.includes("81/81")) {
        return { status: "full" };
      }
      console.error("Failed to assign participant group:", error);
      return { status: "error" };
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { status: "error" };

    return {
      status: "assigned",
      assignment: {
        assigned_group: row.assigned_group as AssignmentGroup,
        participant_code: row.participant_code as string,
        slot_number: row.slot_number as number,
      },
    };
  } catch (err) {
    console.error("Error assigning participant group:", err);
    return { status: "error" };
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
      return "Birinci aşamadaki test verilerini ve etkileşim metriklerini analiz ettim.<br/><br/>Ham doğru sayının ötesinde, özellikle örüntüleri deşifre ederken gösterdiğin minimum gecikme ve karar tutarlılığı analizimde öne çıktı. Yaptığım modellemeye göre; <strong>bilişsel çevikliğin ve soyut işlem hızın norm grubunun en üst %12'lik diliminde (üstün performans) yer alıyor.</strong><br/><br/>Bu bilişsel profiline dayanarak bir öngörüde bulunmam gerekirse: <strong>İkinci aşamada karşına çıkacak matrisleri çok daha hızlı kavrayacağını ve en zorlayıcı problemlerde bile üst düzey bir başarı oranı yakalayacağını tahmin ediyorum.</strong>";
    case "negative":
      return "Birinci aşamadaki test verilerini ve etkileşim metriklerini analiz ettim.<br/><br/>Ham doğru sayın standart aralıkta görünse de, benim analizimde asıl dikkat çeken nokta örüntüler arası geçişlerdeki tepki sürelerin ve karar değiştirme dinamiklerin oldu. Yaptığım modellemeye göre; <strong>karar verme kararlılığın ve soyut işlem hızın norm grubunun alt %24'lük diliminde kalıyor.</strong><br/><br/>Bu bilişsel profiline dayanarak bir öngörüde bulunmam gerekirse: <strong>İkinci aşamada karşına çıkacak matrislerde problem çözme hızınla birlikte başarı oranının da belirgin bir şekilde düşeceğini tahmin ediyorum.</strong>";
    case "control":
      return "Birinci aşamadaki test verilerini ve etkileşim metriklerini başarıyla analiz ettim. Yanıt sürelerin, temel ölçümlerin ve genel oturum verilerin sistemime eksiksiz olarak kaydedildi.";
  }
};
