// ============================================================
// Da Enzo Pizza — Constants
// ============================================================

import { LoyaltyTierInfo, NavLink } from './types';

// ---------- Navigation ----------

export const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: 'Accueil', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Réservation', href: '/reservation' },
  { label: 'Contact', href: '/contact' },
];

export const USER_NAV_LINKS: NavLink[] = [
  { label: 'Tableau de bord', href: '/mon-compte', icon: '📊' },
  { label: 'Mes réservations', href: '/mon-compte/reservations', icon: '📅' },
  { label: 'Programme fidélité', href: '/mon-compte/fidelite', icon: '⭐' },
  { label: 'Notifications', href: '/mon-compte/notifications', icon: '🔔' },
];

export const ADMIN_NAV_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Menu', href: '/admin/menu', icon: '🍕' },
  { label: 'Réservations', href: '/admin/reservations', icon: '📅' },
  { label: 'Utilisateurs', href: '/admin/utilisateurs', icon: '👥' },
  { label: 'Fidélité', href: '/admin/fidelite', icon: '⭐' },
  { label: 'Contenu', href: '/admin/contenu', icon: '✏️' },
  { label: 'Notifications', href: '/admin/notifications', icon: '📢' },
];

// ---------- Reservation ----------

export const RESERVATION_STATUSES = {
  pending: { label: 'En attente', color: '#C9A84C' },
  confirmed: { label: 'Confirmée', color: '#4CAF50' },
  cancelled: { label: 'Annulée', color: '#E53935' },
} as const;

export const AVAILABLE_TIMES = [
  '11:30', '12:00', '12:30', '13:00', '13:30',
  '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00',
];

export const MAX_GUESTS = 12;

// ---------- Pizza Categories ----------

export const PIZZA_CATEGORIES = [
  { slug: 'bruschetta', name: 'Bruschettas', icon: '🍞' },
  { slug: 'antipasti', name: 'Antipasti', icon: '🫙' },
  { slug: 'insalate', name: 'Insalate', icon: '🥗' },
  { slug: 'pizza-tomate', name: 'Pizzas Base Tomate', icon: '🍕' },
  { slug: 'pizza-creme', name: 'Pizzas Base Crème', icon: '🍕' },
  { slug: 'pasta', name: 'Pastas', icon: '🍝' },
  { slug: 'carni', name: 'Carni', icon: '🥩' },
  { slug: 'pescare', name: 'Pescare', icon: '🐟' },
  { slug: 'gelati', name: 'Gelati', icon: '🍦' },
  { slug: 'dolci', name: 'Dolci', icon: '🍰' },
  { slug: 'cafe', name: 'Cafés & Thés', icon: '☕' },
  { slug: 'vin', name: 'Vins', icon: '🍷' },
  { slug: 'bambino', name: 'Menu Bambino', icon: '👶' },
] as const;

// ---------- Loyalty Program ----------

export const LOYALTY_TIERS: Record<string, LoyaltyTierInfo> = {
  bronze: {
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 499,
    color: '#CD7F32',
    benefits: [
      'Accès aux offres spéciales',
      'Accumulez 1 point par euro dépensé',
    ],
  },
  argent: {
    name: 'Argent',
    minPoints: 500,
    maxPoints: 1499,
    color: '#C0C0C0',
    benefits: [
      'Tous les avantages Bronze',
      'Une pizza offerte pour 500 points',
      '-10% sur votre addition le jour de votre anniversaire',
    ],
  },
  or: {
    name: 'Or',
    minPoints: 1500,
    maxPoints: Infinity,
    color: '#C9A84C',
    benefits: [
      'Tous les avantages Argent',
      'Accès prioritaire aux réservations',
      '-15% permanent sur votre addition',
      'Invitation aux événements exclusifs',
    ],
  },
};

// ---------- Site Content Keys ----------

export const SITE_CONTENT_KEYS = {
  // Contact
  phone: 'Téléphone',
  address: 'Adresse',
  email: 'Email de contact',
  
  // Hours
  hours_mon: 'Lundi',
  hours_tue: 'Mardi',
  hours_wed: 'Mercredi',
  hours_thu: 'Jeudi',
  hours_fri: 'Vendredi',
  hours_sat: 'Samedi',
  hours_sun: 'Dimanche',
  
  // Hero
  hero_title: 'Titre principal',
  hero_subtitle: 'Sous-titre',
  hero_cta: 'Texte du bouton',
  
  // About
  about_title: 'Titre À propos',
  about_text: 'Texte À propos',
  about_values: 'Nos valeurs',
  
  // Social
  instagram_url: 'Instagram',
  facebook_url: 'Facebook',
} as const;

// ---------- Animation Defaults ----------

export const ANIMATION_DEFAULTS = {
  duration: 0.6,
  ease: 'easeOut' as const,
  staggerChildren: 0.1,
  wordStagger: 0.08,
};
