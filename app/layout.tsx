import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>
        <Header />
        <main style={{ minHeight: "calc(100vh - var(--header-height))" }}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
