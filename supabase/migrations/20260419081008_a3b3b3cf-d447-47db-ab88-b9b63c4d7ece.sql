CREATE POLICY "Allow anonymous deletes" ON public.experiment_results FOR DELETE USING (true);
CREATE POLICY "Allow anonymous assignment deletes" ON public.participant_assignments FOR DELETE USING (true);
CREATE POLICY "Allow anonymous focus event deletes" ON public.session_focus_events FOR DELETE USING (true);