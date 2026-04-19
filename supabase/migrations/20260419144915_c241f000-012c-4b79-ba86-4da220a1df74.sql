-- Track sidebar fake-button clicks (Yeni Sohbet / chat history items)
CREATE TABLE public.sidebar_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  phase TEXT NOT NULL,
  element TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.sidebar_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous sidebar interaction inserts"
  ON public.sidebar_interactions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow reading all sidebar interactions"
  ON public.sidebar_interactions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow anonymous sidebar interaction deletes"
  ON public.sidebar_interactions FOR DELETE
  TO public
  USING (true);

CREATE INDEX idx_sidebar_interactions_session_id ON public.sidebar_interactions(session_id);