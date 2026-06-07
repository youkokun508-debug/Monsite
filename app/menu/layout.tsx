import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notre Menu',
  description: 'Découvrez la carte complète de Da Enzo : pizzas classiques, signatures, desserts et boissons. Ingrédients importés d\'Italie, cuisson au feu de bois.',
};

export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return children;
}
