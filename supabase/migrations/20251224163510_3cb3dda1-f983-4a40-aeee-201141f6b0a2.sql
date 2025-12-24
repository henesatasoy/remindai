-- Create experiment_results table for storing test data
CREATE TABLE public.experiment_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  phase TEXT NOT NULL CHECK (phase IN ('practice', 'phase1', 'phase2')),
  question_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  reaction_time_ms INTEGER NOT NULL,
  timed_out BOOLEAN NOT NULL DEFAULT false,
  attention_check_click BOOLEAN DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.experiment_results ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (experiment data collection)
CREATE POLICY "Allow anonymous inserts" 
ON public.experiment_results 
FOR INSERT 
WITH CHECK (true);

-- Allow reading all data (for admin dashboard)
CREATE POLICY "Allow reading all data" 
ON public.experiment_results 
FOR SELECT 
USING (true);

-- Create index on session_id for faster queries
CREATE INDEX idx_experiment_results_session_id ON public.experiment_results(session_id);

-- Create index on phase for filtering
CREATE INDEX idx_experiment_results_phase ON public.experiment_results(phase);