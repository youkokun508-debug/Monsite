-- ============================================================
-- Da Enzo Pizza — Roue de la chance (page secrète du flyer)
-- Accessible uniquement via le QR code (clé d'accès dans l'URL).
-- Le tirage se fait côté base : impossible de tricher depuis le navigateur.
-- ============================================================

-- --------------------------------------------------------
-- Configuration (une seule ligne)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wheel_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  access_key TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  validity_days INT NOT NULL DEFAULT 30,
  max_spins_per_ip_per_day INT NOT NULL DEFAULT 3,
  google_review_url TEXT,
  -- [{ "key": "...", "label": "...", "short": "...", "weight": 50 }]
  -- weight = chance en % (le total n'a pas besoin de faire 100, c'est proportionnel)
  prizes JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- --------------------------------------------------------
-- Tours joués / codes gagnants
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wheel_spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  prize_key TEXT NOT NULL,
  prize_label TEXT NOT NULL,
  device_id TEXT NOT NULL UNIQUE,
  ip_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS wheel_spins_ip_created_idx ON public.wheel_spins (ip_hash, created_at);
CREATE INDEX IF NOT EXISTS wheel_spins_created_idx ON public.wheel_spins (created_at DESC);

-- --------------------------------------------------------
-- RLS : seuls les admins lisent / modifient directement.
-- Le public passe uniquement par les fonctions ci-dessous.
-- --------------------------------------------------------
ALTER TABLE public.wheel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wheel_spins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view wheel config" ON public.wheel_config;
CREATE POLICY "Admins can view wheel config"
  ON public.wheel_config FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update wheel config" ON public.wheel_config;
CREATE POLICY "Admins can update wheel config"
  ON public.wheel_config FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view wheel spins" ON public.wheel_spins;
CREATE POLICY "Admins can view wheel spins"
  ON public.wheel_spins FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update wheel spins" ON public.wheel_spins;
CREATE POLICY "Admins can update wheel spins"
  ON public.wheel_spins FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- Infos publiques de la roue (si la clé est bonne)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.wheel_public_info(p_key TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg public.wheel_config%ROWTYPE;
BEGIN
  SELECT * INTO cfg FROM public.wheel_config WHERE id = 1;
  IF NOT FOUND OR NOT cfg.active OR p_key IS NULL OR p_key <> cfg.access_key THEN
    RETURN NULL;
  END IF;
  RETURN jsonb_build_object(
    'prizes', cfg.prizes,
    'validity_days', cfg.validity_days,
    'review_url', cfg.google_review_url
  );
END;
$$;

-- --------------------------------------------------------
-- Tourner la roue : 1 tour par appareil, 3 par IP / 24 h.
-- Si l'appareil a déjà joué, renvoie son gain existant.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.wheel_spin(p_key TEXT, p_device TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cfg public.wheel_config%ROWTYPE;
  existing public.wheel_spins%ROWTYPE;
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
      'already', TRUE
    );
  END IF;

  -- Limite par adresse IP (en-têtes transmis par l'API Supabase)
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
        WHERE ip_hash = v_ip_hash AND created_at > NOW() - INTERVAL '24 hours')
       >= cfg.max_spins_per_ip_per_day THEN
      RAISE EXCEPTION 'too_many' USING ERRCODE = 'P0001';
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

  INSERT INTO public.wheel_spins (code, prize_key, prize_label, device_id, ip_hash, expires_at)
  VALUES (
    v_code,
    v_prize ->> 'key',
    v_prize ->> 'label',
    p_device,
    v_ip_hash,
    NOW() + make_interval(days => cfg.validity_days)
  )
  RETURNING * INTO v_row;

  RETURN jsonb_build_object(
    'code', v_row.code,
    'prize_key', v_row.prize_key,
    'prize_label', v_row.prize_label,
    'expires_at', v_row.expires_at,
    'redeemed', FALSE,
    'already', FALSE
  );
END;
$$;

REVOKE ALL ON FUNCTION public.wheel_public_info(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.wheel_spin(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.wheel_public_info(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.wheel_spin(TEXT, TEXT) TO anon, authenticated;

-- --------------------------------------------------------
-- Configuration initiale (lots validés le 27/11/2026)
-- La clé d'accès est celle du QR code : la changer rend les anciens flyers inutilisables.
-- --------------------------------------------------------
INSERT INTO public.wheel_config (id, access_key, google_review_url, prizes)
VALUES (
  1,
  'ud7hzaw5rh',
  'https://www.google.com/maps/search/?api=1&query=Da+Enzo+Pizza+4+rue+de+Paris+Charenton-le-Pont',
  '[
    {"key": "cafe",     "label": "Un café offert",      "short": "Café offert",    "weight": 50},
    {"key": "moins10",  "label": "-10 % sur l''addition", "short": "-10 %",          "weight": 30},
    {"key": "boisson",  "label": "Une boisson offerte",  "short": "Boisson offerte", "weight": 12},
    {"key": "dessert",  "label": "Un dessert offert",    "short": "Dessert offert", "weight": 5},
    {"key": "moins20",  "label": "-20 % sur l''addition", "short": "-20 %",          "weight": 2.9},
    {"key": "pizza",    "label": "Une pizza offerte",    "short": "Pizza offerte",  "weight": 0.1}
  ]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
