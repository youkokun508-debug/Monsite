// ============================================================
// Da Enzo Pizza — Utility Functions
// ============================================================

import { LoyaltyTier } from './types';
import { LOYALTY_TIERS } from './constants';

/**
 * Formats a price in EUR with French locale
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(price);
}

/**
 * Formats a date string to French locale
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Formats a short date (DD/MM/YYYY)
 */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

/**
 * Formats a time string (HH:MM)
 */
export function formatTime(timeStr: string): string {
  return timeStr.slice(0, 5);
}

/**
 * Determines the loyalty tier based on points
 */
export function getLoyaltyTier(points: number): LoyaltyTier {
  if (points >= LOYALTY_TIERS.or.minPoints) return 'or';
  if (points >= LOYALTY_TIERS.argent.minPoints) return 'argent';
  return 'bronze';
}

/**
 * Gets the progress percentage toward the next tier
 */
export function getLoyaltyProgress(points: number): number {
  const currentTier = getLoyaltyTier(points);
  const tierInfo = LOYALTY_TIERS[currentTier];
  
  if (currentTier === 'or') return 100;
  
  const range = tierInfo.maxPoints - tierInfo.minPoints;
  const progress = points - tierInfo.minPoints;
  return Math.min(100, Math.round((progress / range) * 100));
}

/**
 * Merges class names, filtering out falsy values
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generates initials from a full name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Truncates text to a maximum length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}

/**
 * Gets a greeting based on the time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

/**
 * Creates a minimum date string for the reservation calendar (today)
 */
export function getMinReservationDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Creates a maximum date string for the reservation calendar (30 days from now)
 */
export function getMaxReservationDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
}
