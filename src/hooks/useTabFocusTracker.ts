import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks when a participant leaves the browser tab/window during the test.
 * Inserts a "blur" event when visibility is lost and a "focus" event
 * (with duration_ms) when the participant returns.
 *
 * The hook persists across phase transitions while `enabled` stays true,
 * so a blur that starts in one phase and ends in another is still captured.
 */
export const useTabFocusTracker = (
  sessionId: string,
  phase: string,
  enabled: boolean
) => {
  const blurTimeRef = useRef<number | null>(null);
  const phaseRef = useRef(phase);

  // Keep latest phase available inside the listeners without remounting them
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    console.log(`[TabFocus] Tracker enabled for session=${sessionId.slice(0, 8)}`);

    const logEvent = async (
      eventType: "blur" | "focus",
      durationMs: number | null
    ) => {
      const currentPhase = phaseRef.current;
      console.log(
        `[TabFocus] ${eventType} during ${currentPhase}` +
          (durationMs !== null ? ` (${durationMs}ms away)` : "")
      );
      try {
        const { error } = await (supabase as any)
          .from("session_focus_events")
          .insert({
            session_id: sessionId,
            phase: currentPhase,
            event_type: eventType,
            duration_ms: durationMs,
          });
        if (error) {
          console.error("[TabFocus] Insert error:", error);
        }
      } catch (err) {
        console.error("[TabFocus] Failed to log focus event:", err);
      }
    };

    const markBlur = () => {
      if (blurTimeRef.current === null) {
        blurTimeRef.current = Date.now();
        logEvent("blur", null);
      }
    };

    const markFocus = () => {
      if (blurTimeRef.current !== null) {
        const duration = Date.now() - blurTimeRef.current;
        blurTimeRef.current = null;
        logEvent("focus", duration);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        markBlur();
      } else {
        markFocus();
      }
    };

    const handleBlur = () => markBlur();
    const handleFocus = () => markFocus();

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handleBlur);
    window.addEventListener("pageshow", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handleBlur);
      window.removeEventListener("pageshow", handleFocus);
    };
    // Intentionally exclude `phase` so changing phases doesn't tear down listeners
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, enabled]);
};
