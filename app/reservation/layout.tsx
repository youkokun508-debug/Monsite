import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservation',
  description: 'Réservez votre table chez Da Enzo Pizza à Charenton-le-Pont. Réservation en ligne simple et rapide.',
};

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
