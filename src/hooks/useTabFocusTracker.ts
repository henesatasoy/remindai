import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Tracks when a participant leaves the browser tab/window during the test.
 * Inserts a "blur" event when visibility is lost and a "focus" event
 * (with duration_ms) when the participant returns.
 *
 * Pass `enabled = false` to disable tracking outside of test phases.
 */
export const useTabFocusTracker = (
  sessionId: string,
  phase: string,
  enabled: boolean
) => {
  const blurTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    console.log(`[TabFocus] Tracker enabled for session=${sessionId.slice(0, 8)} phase=${phase}`);

    const logEvent = async (
      eventType: "blur" | "focus",
      durationMs: number | null
    ) => {
      console.log(`[TabFocus] ${eventType}${durationMs !== null ? ` after ${durationMs}ms` : ""}`);
      try {
        const { error } = await (supabase as any)
          .from("session_focus_events")
          .insert({
            session_id: sessionId,
            phase,
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
  }, [sessionId, phase, enabled]);
};
