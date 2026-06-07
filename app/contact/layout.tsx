import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez Da Enzo Pizza à Charenton-le-Pont. Adresse, horaires d\'ouverture, téléphone et plan d\'accès.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
