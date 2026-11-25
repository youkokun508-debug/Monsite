import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réservation',
  description: 'Réservez votre table chez Da Enzo Pizza à Charenton-le-Pont. Réservations uniquement par téléphone.',
};

export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
