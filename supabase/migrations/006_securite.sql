-- ============================================================
-- Da Enzo Pizza — Correctifs de sécurité (audit du 27/11/2026)
-- ============================================================

-- --------------------------------------------------------
-- 1. CRITIQUE : élévation de privilèges à l'inscription.
-- Le rôle était lu depuis les métadonnées envoyées par le navigateur :
-- n'importe qui pouvait s'inscrire avec role = 'admin'.
-- Désormais, tout nouveau compte est 'user'.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    left(COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 120),
    'user'
  );
  RETURN NEW;
END;
$$;

-- search_path figé pour la fonction utilisée par toutes les règles RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$;

-- --------------------------------------------------------
-- 2. Un utilisateur ne peut modifier que son nom dans son profil
-- (ni son rôle, ni ses points, ni son e-mail). Les admins gardent la main.
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.id := OLD.id;
    NEW.role := OLD.role;
    NEW.points := OLD.points;
    NEW.email := OLD.email;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_columns ON public.profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_columns();

-- --------------------------------------------------------
-- 3. ÉLEVÉ : n'importe qui (même sans compte) pouvait réécrire
-- les notifications globales envoyées à tous les clients.
-- Désormais : chacun ne touche qu'à SES notifications, et seulement « lu ».
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'notifications' AND cmd = 'UPDATE'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.notifications', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can mark own notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Bug : le bouton « Supprimer » de l'admin ne marchait pas (aucune règle DELETE)
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.protect_notification_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    NEW.id := OLD.id;
    NEW.user_id := OLD.user_id;
    NEW.title := OLD.title;
    NEW.body := OLD.body;
    NEW.type := OLD.type;
    NEW.created_at := OLD.created_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_notification_columns ON public.notifications;
CREATE TRIGGER protect_notification_columns
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.protect_notification_columns();

-- --------------------------------------------------------
-- 4. Réservations en ligne retirées du site : on ferme aussi l'API
-- (sinon un compte pouvait encore créer / modifier des réservations).
-- Les données historiques restent lisibles par l'admin.
-- --------------------------------------------------------
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reservations'
      AND cmd IN ('INSERT', 'UPDATE')
      AND coalesce(qual, '') NOT LIKE '%is_admin()%'
      AND coalesce(with_check, '') NOT LIKE '%is_admin()%'
  LOOP
    EXECUTE format('DROP POLICY %I ON public.reservations', pol.policyname);
  END LOOP;
END $$;

-- --------------------------------------------------------
-- 5. Roue : au restaurant, tous les clients du Wi-Fi partagent la même IP.
-- 3 tours / IP / jour bloquait les vrais clients : on passe à 40.
-- (La limite principale reste 1 tour par téléphone.)
-- --------------------------------------------------------
UPDATE public.wheel_config SET max_spins_per_ip_per_day = 40, updated_at = NOW() WHERE id = 1;
