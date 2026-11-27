import type { Metadata } from 'next';

// Page secrète du flyer : jamais indexée par Google, jamais dans le menu.
export const metadata: Metadata = {
  title: 'Tentez votre chance',
  description: 'Roue de la chance Da Enzo — réservée aux clients du flyer.',
  robots: { index: false, follow: false, nocache: true },
};

export default function RoueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
