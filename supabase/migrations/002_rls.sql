-- ============================================================
-- Da Enzo Pizza — Row Level Security Policies
-- Execute this AFTER 001_schema.sql
-- ============================================================

-- --------------------------------------------------------
-- Helper function: Check if user is admin
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------
-- PROFILES
-- --------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- Admins can update any profile
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (public.is_admin());

-- --------------------------------------------------------
-- PIZZAS
-- --------------------------------------------------------
ALTER TABLE pizzas ENABLE ROW LEVEL SECURITY;

-- Everyone can read pizzas
CREATE POLICY "Anyone can view pizzas"
  ON pizzas FOR SELECT
  USING (true);

-- Only admins can insert
CREATE POLICY "Admins can create pizzas"
  ON pizzas FOR INSERT
  WITH CHECK (public.is_admin());

-- Only admins can update
CREATE POLICY "Admins can update pizzas"
  ON pizzas FOR UPDATE
  USING (public.is_admin());

-- Only admins can delete
CREATE POLICY "Admins can delete pizzas"
  ON pizzas FOR DELETE
  USING (public.is_admin());

-- --------------------------------------------------------
-- CATEGORIES_MENU
-- --------------------------------------------------------
ALTER TABLE categories_menu ENABLE ROW LEVEL SECURITY;

-- Everyone can read categories
CREATE POLICY "Anyone can view categories"
  ON categories_menu FOR SELECT
  USING (true);

-- Only admins can manage
CREATE POLICY "Admins can manage categories"
  ON categories_menu FOR ALL
  USING (public.is_admin());

-- --------------------------------------------------------
-- RESERVATIONS
-- --------------------------------------------------------
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

-- Users can view their own reservations
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all reservations
CREATE POLICY "Admins can view all reservations"
  ON reservations FOR SELECT
  USING (public.is_admin());

-- Users can create their own reservations
CREATE POLICY "Users can create reservations"
  ON reservations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reservations (cancel)
CREATE POLICY "Users can update own reservations"
  ON reservations FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can update any reservation
CREATE POLICY "Admins can update all reservations"
  ON reservations FOR UPDATE
  USING (public.is_admin());

-- --------------------------------------------------------
-- SITE_CONTENT
-- --------------------------------------------------------
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read site content
CREATE POLICY "Anyone can view site content"
  ON site_content FOR SELECT
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update site content"
  ON site_content FOR UPDATE
  USING (public.is_admin());

-- Only admins can insert
CREATE POLICY "Admins can insert site content"
  ON site_content FOR INSERT
  WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- NOTIFICATIONS
-- --------------------------------------------------------
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications + global ones
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all
CREATE POLICY "Admins can view all notifications"
  ON notifications FOR SELECT
  USING (public.is_admin());

-- Only admins can create notifications
CREATE POLICY "Admins can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (public.is_admin());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- --------------------------------------------------------
-- LOYALTY_EVENTS
-- --------------------------------------------------------
ALTER TABLE loyalty_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own events
CREATE POLICY "Users can view own loyalty events"
  ON loyalty_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all loyalty events"
  ON loyalty_events FOR SELECT
  USING (public.is_admin());

-- Only admins can create loyalty events
CREATE POLICY "Admins can create loyalty events"
  ON loyalty_events FOR INSERT
  WITH CHECK (public.is_admin());
