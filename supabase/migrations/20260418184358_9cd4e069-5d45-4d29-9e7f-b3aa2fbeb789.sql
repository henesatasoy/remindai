
-- Track tab/window visibility loss events per session
CREATE TABLE public.session_focus_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL,
  phase text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('blur', 'focus')),
  duration_ms integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_session_focus_events_session ON public.session_focus_events(session_id);

ALTER TABLE public.session_focus_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous focus event inserts"
  ON public.session_focus_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow reading all focus events"
  ON public.session_focus_events
  FOR SELECT
  USING (true);
