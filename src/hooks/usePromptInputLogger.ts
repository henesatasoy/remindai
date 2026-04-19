import { useEffect, useRef, useState } from "react";
import { logSidebarInteraction } from "@/lib/experimentService";

/**
 * Returns an onChange handler for a fake prompt input that:
 * - tracks the typed value
 * - logs the final text 1.5s after the user stops typing
 * - also logs once on unmount if there is unsent text
 *
 * The element label distinguishes which fake input was used
 * (e.g. "home_prompt_input", "sidebar_prompt_input", "ai_terminal_prompt_input").
 */
export const usePromptInputLogger = (
  sessionId: string | undefined,
  phase: string,
  element: string,
  enabled: boolean = true
) => {
  const [value, setValue] = useState("");
  const lastLoggedRef = useRef<string>("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flush = (text: string) => {
    if (!sessionId || !enabled) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    if (trimmed === lastLoggedRef.current) return;
    lastLoggedRef.current = trimmed;
    void logSidebarInteraction(sessionId, phase, `${element}:${trimmed}`);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(next), 1500);
  };

  // Flush pending text on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      flush(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { value, onChange };
};
