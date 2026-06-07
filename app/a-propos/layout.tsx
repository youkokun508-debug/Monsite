import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À Propos',
  description: 'Découvrez l\'histoire de Da Enzo, pizzeria artisanale à Charenton-le-Pont depuis 2015. Nos valeurs : authenticité, qualité, passion et convivialité.',
};

export default function AProposLayout({ children }: { children: React.ReactNode }) {
  return children;
}
