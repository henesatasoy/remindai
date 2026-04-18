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

    const logEvent = async (
      eventType: "blur" | "focus",
      durationMs: number | null
    ) => {
      try {
        await (supabase.from as any)("session_focus_events").insert({
          session_id: sessionId,
          phase,
          event_type: eventType,
          duration_ms: durationMs,
        });
      } catch (err) {
        console.error("Failed to log focus event:", err);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        blurTimeRef.current = Date.now();
        logEvent("blur", null);
      } else if (blurTimeRef.current !== null) {
        const duration = Date.now() - blurTimeRef.current;
        blurTimeRef.current = null;
        logEvent("focus", duration);
      }
    };

    const handleBlur = () => {
      // Window lost focus (e.g. switched to another app) — only log if not
      // already logged via visibilitychange
      if (!document.hidden && blurTimeRef.current === null) {
        blurTimeRef.current = Date.now();
        logEvent("blur", null);
      }
    };

    const handleFocus = () => {
      if (!document.hidden && blurTimeRef.current !== null) {
        const duration = Date.now() - blurTimeRef.current;
        blurTimeRef.current = null;
        logEvent("focus", duration);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [sessionId, phase, enabled]);
};
