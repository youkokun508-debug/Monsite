// ============================================================
// Da Enzo Pizza — Type Definitions
// ============================================================

// ---------- Database Row Types ----------

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  points: number;
  created_at: string;
}

export interface Pizza {
  id: string;
  name: string;
  description: string;
  price: number;
  category: PizzaCategory;
  image_url: string | null;
  is_available: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export type PizzaCategory = 'classique' | 'signature' | 'dessert' | 'boisson';

export interface CategoryMenu {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Reservation {
  id: string;
  user_id: string;
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes: string | null;
  status: ReservationStatus;
  created_at: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface SiteContent {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string | null;
}

export interface Notification {
  id: string;
  user_id: string | null;
  title: string;
  body: string;
  is_read: boolean;
  type: NotificationType;
  created_at: string;
}

export type NotificationType = 'promo' | 'info' | 'reservation';

export interface LoyaltyEvent {
  id: string;
  user_id: string;
  points: number;
  reason: string;
  created_at: string;
}

// ---------- Form Types ----------

export interface PizzaFormData {
  name: string;
  description: string;
  price: number;
  category: PizzaCategory;
  image_url: string | null;
  is_available: boolean;
  position: number;
}

export interface ReservationFormData {
  date: string;
  time: string;
  guests: number;
  name: string;
  phone: string;
  notes: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  full_name: string;
  email: string;
  password: string;
}

export interface ContentFormData {
  [key: string]: string;
}

// ---------- UI Types ----------

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

export type LoyaltyTier = 'bronze' | 'argent' | 'or';

export interface LoyaltyTierInfo {
  name: string;
  minPoints: number;
  maxPoints: number;
  color: string;
  benefits: string[];
}
