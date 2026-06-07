-- ============================================================
-- Da Enzo Pizza — Seed Data
-- Execute this AFTER schema and RLS
-- ============================================================

-- --------------------------------------------------------
-- Categories
-- --------------------------------------------------------
INSERT INTO categories_menu (name, slug, icon) VALUES
  ('Classiques', 'classique', '🍕'),
  ('Signatures', 'signature', '⭐'),
  ('Desserts', 'dessert', '🍰'),
  ('Boissons', 'boisson', '🥤')
ON CONFLICT (slug) DO NOTHING;

-- --------------------------------------------------------
-- Demo Pizzas
-- --------------------------------------------------------
INSERT INTO pizzas (name, description, price, category, is_available, position) VALUES
  ('Margherita', 'Sauce tomate San Marzano, mozzarella di bufala AOP, basilic frais, huile d''olive extra vierge', 12.50, 'classique', true, 1),
  ('Regina', 'Sauce tomate, mozzarella fior di latte, jambon artisanal, champignons frais, origan', 14.00, 'classique', true, 2),
  ('Quattro Formaggi', 'Mozzarella, gorgonzola DOP, parmesan 24 mois, chèvre frais, miel de truffe', 16.50, 'classique', true, 3),
  ('Diavola', 'Sauce tomate piquante, mozzarella, salami calabrais épicé, piments rouges, huile pimentée', 14.50, 'classique', true, 4),
  ('La Truffe Noire', 'Crème de truffe noire, mozzarella di bufala, roquette sauvage, copeaux de parmesan, huile de truffe', 22.00, 'signature', true, 5),
  ('L''Italienne', 'Burrata crémeuse, tomates confites maison, jambon de Parme 18 mois, pesto de basilic génois', 19.50, 'signature', true, 6),
  ('Da Enzo Speciale', 'Notre création signature — sauce secrète maison, mozzarella fumée, nduja, oignon rouge caramélisé, miel épicé', 21.00, 'signature', true, 7),
  ('Végétale du Marché', 'Légumes de saison grillés, mozzarella, pesto rosso, roquette, graines de courge torréfiées', 17.00, 'signature', true, 8),
  ('Tiramisu Maison', 'Recette traditionnelle italienne au mascarpone, café expresso, cacao amer', 8.50, 'dessert', true, 9),
  ('Panna Cotta', 'Vanille de Madagascar, coulis de fruits rouges frais', 7.50, 'dessert', true, 10),
  ('Cannoli Siciliani', 'Ricotta fraîche, pistaches de Bronte, pépites de chocolat noir', 6.50, 'dessert', true, 11),
  ('Coca-Cola', 'Bouteille 33cl', 3.50, 'boisson', true, 12),
  ('Eau San Pellegrino', 'Bouteille 50cl pétillante', 3.00, 'boisson', true, 13),
  ('Limonade Artisanale', 'Citrons de Menton, menthe fraîche, miel', 5.50, 'boisson', true, 14),
  ('Vin Rouge Chianti', 'Verre 15cl — Chianti Classico DOCG', 7.00, 'boisson', true, 15),
  ('Spritz Aperol', 'Aperol, prosecco, eau gazeuse, orange', 9.00, 'boisson', true, 16)
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------
-- Site Content (editable by admin)
-- --------------------------------------------------------
INSERT INTO site_content (key, value) VALUES
  ('phone', '01 43 68 XX XX'),
  ('address', '12 Rue de Paris, 94220 Charenton-le-Pont'),
  ('email', 'contact@daenzopizza.fr'),
  ('hours_mon', 'Fermé'),
  ('hours_tue', '11h30 – 14h00 / 18h30 – 22h30'),
  ('hours_wed', '11h30 – 14h00 / 18h30 – 22h30'),
  ('hours_thu', '11h30 – 14h00 / 18h30 – 22h30'),
  ('hours_fri', '11h30 – 14h00 / 18h30 – 23h00'),
  ('hours_sat', '11h30 – 23h00'),
  ('hours_sun', '11h30 – 22h00'),
  ('hero_title', 'Da Enzo'),
  ('hero_subtitle', 'L''art de la pizza artisanale italienne depuis 2015'),
  ('hero_cta', 'Réserver une table'),
  ('about_title', 'Notre Histoire'),
  ('about_text', 'Née de la passion d''Enzo pour les traditions culinaires napolitaines, Da Enzo est bien plus qu''une pizzeria. C''est un voyage gustatif au cœur de l''Italie, où chaque pizza est pétrie à la main avec des farines sélectionnées et garnie d''ingrédients d''exception importés directement de producteurs italiens. Notre four à bois, atteignant 450°C, confère à nos pizzas cette croûte croustillante et cette mie aérée qui font notre réputation depuis plus de 10 ans à Charenton-le-Pont.'),
  ('about_values', 'Authenticité • Qualité • Passion • Convivialité'),
  ('instagram_url', 'https://instagram.com/daenzopizza'),
  ('facebook_url', 'https://facebook.com/daenzopizza')
ON CONFLICT (key) DO NOTHING;

-- --------------------------------------------------------
-- NOTE: Admin account
-- Create the admin user via Supabase Auth Dashboard:
-- Email: admin@daenzo.fr
-- Password: [your secure password]
-- Then update the profile role:
-- UPDATE profiles SET role = 'admin' WHERE email = 'admin@daenzo.fr';
-- --------------------------------------------------------
