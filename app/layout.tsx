import type { Metadata } from "next";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Da Enzo — Pizzeria Artisanale | Charenton-le-Pont",
    template: "%s | Da Enzo Pizza",
  },
  description:
    "Da Enzo, pizzeria artisanale à Charenton-le-Pont. Pizzas cuites au feu de bois, ingrédients importés d'Italie. Réservez votre table en ligne.",
  keywords: [
    "pizzeria",
    "pizza artisanale",
    "Charenton-le-Pont",
    "Da Enzo",
    "restaurant italien",
    "pizza feu de bois",
  ],
  openGraph: {
    title: "Da Enzo — Pizzeria Artisanale",
    description:
      "L'art de la pizza artisanale italienne depuis 2015. Charenton-le-Pont.",
    type: "website",
    locale: "fr_FR",
    siteName: "Da Enzo Pizza",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: rows } = await supabase
    .from('site_content')
    .select('key, value')
    .in('key', ['phone', 'address', 'email']);

  const content: Record<string, string> = {};
  rows?.forEach((r) => { content[r.key] = r.value; });

  return (
    <html lang="fr">
      <body>
        <PublicShell
          footerPhone={content.phone}
          footerAddress={content.address}
          footerEmail={content.email}
        >
          {children}
        </PublicShell>
      </body>
    </html>
  );
}
