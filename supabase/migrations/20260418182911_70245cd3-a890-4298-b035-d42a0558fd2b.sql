CREATE OR REPLACE FUNCTION public.assign_participant_group(p_session_id uuid)
 RETURNS TABLE(assigned_group public.assignment_group, participant_code text, slot_number integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_max_per_group constant integer := 27;
  v_pos_count integer;
  v_neg_count integer;
  v_ctrl_count integer;
  v_pos_remaining integer;
  v_neg_remaining integer;
  v_ctrl_remaining integer;
  v_total_remaining integer;
  v_existing_group public.assignment_group;
  v_existing_code text;
  v_existing_slot integer;
  v_random numeric;
  v_chosen public.assignment_group;
  v_prefix text;
  v_next_slot integer;
  v_code text;
BEGIN
  -- If session already assigned, return existing assignment (idempotent)
  SELECT pa.assigned_group, pa.participant_code, pa.slot_number
    INTO v_existing_group, v_existing_code, v_existing_slot
  FROM public.participant_assignments pa
  WHERE pa.session_id = p_session_id;

  IF FOUND THEN
    assigned_group := v_existing_group;
    participant_code := v_existing_code;
    slot_number := v_existing_slot;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Lock the table briefly to avoid race conditions on slot counting & code generation
  LOCK TABLE public.participant_assignments IN SHARE ROW EXCLUSIVE MODE;

  -- Count existing assignments per group (qualify column with table alias to avoid ambiguity with OUT param)
  SELECT COUNT(*) INTO v_pos_count FROM public.participant_assignments pa WHERE pa.assigned_group = 'positive';
  SELECT COUNT(*) INTO v_neg_count FROM public.participant_assignments pa WHERE pa.assigned_group = 'negative';
  SELECT COUNT(*) INTO v_ctrl_count FROM public.participant_assignments pa WHERE pa.assigned_group = 'control';

  v_pos_remaining := GREATEST(v_max_per_group - v_pos_count, 0);
  v_neg_remaining := GREATEST(v_max_per_group - v_neg_count, 0);
  v_ctrl_remaining := GREATEST(v_max_per_group - v_ctrl_count, 0);
  v_total_remaining := v_pos_remaining + v_neg_remaining + v_ctrl_remaining;

  IF v_total_remaining <= 0 THEN
    RAISE EXCEPTION 'All participant slots are full (81/81)';
  END IF;

  -- Weighted random pick based on remaining slots
  v_random := random() * v_total_remaining;

  IF v_random < v_pos_remaining THEN
    v_chosen := 'positive';
  ELSIF v_random < v_pos_remaining + v_neg_remaining THEN
    v_chosen := 'negative';
  ELSE
    v_chosen := 'control';
  END IF;

  -- Determine prefix and next slot
  IF v_chosen = 'positive' THEN
    v_prefix := 'P';
    v_next_slot := v_pos_count + 1;
  ELSIF v_chosen = 'negative' THEN
    v_prefix := 'N';
    v_next_slot := v_neg_count + 1;
  ELSE
    v_prefix := 'K';
    v_next_slot := v_ctrl_count + 1;
  END IF;

  v_code := v_prefix || LPAD(v_next_slot::text, 2, '0');

  -- Insert assignment
  INSERT INTO public.participant_assignments (session_id, assigned_group, participant_code, slot_number)
  VALUES (p_session_id, v_chosen, v_code, v_next_slot);

  assigned_group := v_chosen;
  participant_code := v_code;
  slot_number := v_next_slot;
  RETURN NEXT;
  RETURN;
END;
$function$;