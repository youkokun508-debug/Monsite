-- ============================================================
-- Da Enzo Pizza — Roue : mode test pour les admins
-- Un admin connecté peut rejouer autant qu'il veut (démo, tests).
-- Ses tours sont marqués « test » : exclus des stats, supprimables.
-- ============================================================

ALTER TABLE public.wheel_spins ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT FALSE;

DROP POLICY IF EXISTS "Admins can delete test wheel spins" ON public.wheel_spins;
CREATE POLICY "Admins can delete test wheel spins"
  ON public.wheel_spins FOR DELETE
  TO authenticated
  USING (public.is_admin() AND is_test);

CREATE OR REPLACE FUNCTION public.wheel_spin(p_key TEXT, p_device TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg public.wheel_config%ROWTYPE;
  existing public.wheel_spins%ROWTYPE;
  v_is_admin BOOLEAN := public.is_admin();
  v_ip TEXT;
  v_ip_hash TEXT;
  v_total NUMERIC := 0;
  v_rand NUMERIC;
  v_acc NUMERIC := 0;
  v_prize JSONB;
  p JSONB;
  v_code TEXT;
  v_alphabet CONSTANT TEXT := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_tries INT := 0;
  v_row public.wheel_spins%ROWTYPE;
BEGIN
  SELECT * INTO cfg FROM public.wheel_config WHERE id = 1;
  IF NOT FOUND OR NOT cfg.active OR p_key IS NULL OR p_key <> cfg.access_key THEN
    RAISE EXCEPTION 'invalid_key' USING ERRCODE = 'P0001';
  END IF;

  IF p_device IS NULL OR length(p_device) < 16 OR length(p_device) > 64 THEN
    RAISE EXCEPTION 'invalid_device' USING ERRCODE = 'P0001';
  END IF;

  -- Déjà joué sur cet appareil : on renvoie le même gain
  SELECT * INTO existing FROM public.wheel_spins WHERE device_id = p_device;
  IF FOUND THEN
    RETURN jsonb_build_object(
      'code', existing.code,
      'prize_key', existing.prize_key,
      'prize_label', existing.prize_label,
      'expires_at', existing.expires_at,
      'redeemed', existing.redeemed_at IS NOT NULL,
      'already', TRUE,
      'is_test', existing.is_test
    );
  END IF;

  -- Limite par adresse IP (sauf pour les admins en mode test)
  IF NOT v_is_admin THEN
    BEGIN
      v_ip := split_part(
        coalesce(
          current_setting('request.headers', TRUE)::json ->> 'cf-connecting-ip',
          current_setting('request.headers', TRUE)::json ->> 'x-forwarded-for',
          ''
        ), ',', 1);
    EXCEPTION WHEN OTHERS THEN
      v_ip := '';
    END;
    IF v_ip <> '' THEN
      v_ip_hash := md5('daenzo-roue:' || trim(v_ip));
      IF (SELECT count(*) FROM public.wheel_spins
          WHERE ip_hash = v_ip_hash AND NOT is_test AND created_at > NOW() - INTERVAL '24 hours')
         >= cfg.max_spins_per_ip_per_day THEN
        RAISE EXCEPTION 'too_many' USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;

  -- Tirage pondéré
  SELECT coalesce(sum((x ->> 'weight')::NUMERIC), 0) INTO v_total
  FROM jsonb_array_elements(cfg.prizes) x;
  IF v_total <= 0 THEN
    RAISE EXCEPTION 'no_prizes' USING ERRCODE = 'P0001';
  END IF;

  v_rand := random()::NUMERIC * v_total;
  FOR p IN SELECT * FROM jsonb_array_elements(cfg.prizes) LOOP
    v_acc := v_acc + (p ->> 'weight')::NUMERIC;
    IF v_rand < v_acc THEN
      v_prize := p;
      EXIT;
    END IF;
  END LOOP;
  IF v_prize IS NULL THEN
    v_prize := cfg.prizes -> (jsonb_array_length(cfg.prizes) - 1);
  END IF;

  -- Code unique du type DE-7K3P
  LOOP
    v_code := 'DE-';
    FOR i IN 1..4 LOOP
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::INT, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.wheel_spins WHERE code = v_code);
    v_tries := v_tries + 1;
    IF v_tries > 20 THEN
      RAISE EXCEPTION 'code_generation_failed' USING ERRCODE = 'P0001';
    END IF;
  END LOOP;

  INSERT INTO public.wheel_spins (code, prize_key, prize_label, device_id, ip_hash, expires_at, is_test)
  VALUES (
    v_code,
    v_prize ->> 'key',
    v_prize ->> 'label',
    p_device,
    v_ip_hash,
    NOW() + make_interval(days => cfg.validity_days),
    v_is_admin
  )
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'code', v_row.code,
    'prize_key', v_row.prize_key,
    'prize_label', v_row.prize_label,
    'expires_at', v_row.expires_at,
    'redeemed', FALSE,
    'already', FALSE,
    'is_test', v_row.is_test
  );
END;
$$;

REVOKE ALL ON FUNCTION public.wheel_spin(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wheel_spin(TEXT, TEXT) TO anon, authenticated;
