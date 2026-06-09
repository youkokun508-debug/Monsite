-- ============================================================
-- Da Enzo — Seed complet (vrai menu du restaurant)
-- Exécuter APRÈS 001_schema.sql, 002_rls.sql, 003_menu_refactor.sql
-- ============================================================

-- --------------------------------------------------------
-- Catégories
-- --------------------------------------------------------
DELETE FROM categories_menu;
INSERT INTO categories_menu (name, slug, icon) VALUES
  ('Bruschettas',       'bruschetta',   '🍞'),
  ('Antipasti',         'antipasti',    '🫙'),
  ('Insalate',          'insalate',     '🥗'),
  ('Pizzas Base Tomate','pizza-tomate', '🍕'),
  ('Pizzas Base Crème', 'pizza-creme',  '🍕'),
  ('Pastas',            'pasta',        '🍝'),
  ('Carni',             'carni',        '🥩'),
  ('Pescare',           'pescare',      '🐟'),
  ('Gelati',            'gelati',       '🍦'),
  ('Dolci',             'dolci',        '🍰'),
  ('Cafés & Thés',      'cafe',         '☕'),
  ('Vins',              'vin',          '🍷'),
  ('Menu Bambino',      'bambino',      '👶');

-- --------------------------------------------------------
-- Menu complet
-- --------------------------------------------------------
DELETE FROM pizzas;
INSERT INTO pizzas (name, description, price, category, image_url, is_available, position) VALUES

  -- BRUSCHETTAS (à partager)
  ('Tomate Mozzarella',  'Ail, basilic, huile d''olive',  11.00, 'bruschetta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145437_da926820-8364-40ce-86ac-356fa41ae11b.png', true, 1),
  ('Di Parma',           'Jambon de Parme, basilic',      14.00, 'bruschetta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145439_2dd35847-d2e4-4600-b8db-c71a44653fbb.png', true, 2),
  ('Al Salmone',         'Saumon, ciboulette',            14.00, 'bruschetta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145440_0940acfe-071e-467e-a23b-7c08c0167d72.png', true, 3),

  -- ANTIPASTI
  ('Il Giardino dell''estate', 'Légumes grillés à l''huile aromatisée aux herbes', 12.00, 'antipasti', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145442_b23f07b6-f4f8-49d4-bfe8-eec0098ab0d9.png', true, 4),
  ('Mozzarella di bufala',     'Tomate, basilic',                                   9.00, 'antipasti', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145443_4aaca4cb-a218-49f7-a92a-170301b5936e.png', true, 5),

  -- INSALATE
  ('Salade César',  'Mesclun, poulet grillé, tomates cerises, copeaux de parmesan, sauce César', 16.00, 'insalate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145444_317e1b48-8b95-41ba-b403-faac989da7e7.png', true, 6),
  ('Da Enzo',       'Mesclun, chèvre, miel, concombre, tomates cerises, copeaux de parmesan',    16.50, 'insalate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145445_355abbab-2ef1-4776-a79f-a5f09fb89a25.png', true, 7),
  ('La Fresella',   'Tomates séchées, mozzarella di bufala, jambon, copeaux de parmesan',        18.00, 'insalate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145447_8d4a18eb-5b96-4854-bdaa-033effe7f6be.png', true, 8),
  ('Tonno',         'Salade, tomate, olive, thon',                                               13.50, 'insalate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145613_464bc486-1819-4535-85a9-9795e8d326b0.png', true, 9),

  -- PIZZAS BASE TOMATE
  ('Margherita',   'Sauce tomate, mozzarella',                                                          10.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143751_87865615-eeb1-41be-a4b8-cccf16af7f08.png', true, 10),
  ('Calzone',      'Sauce tomate, mozzarella, jambon blanc, œuf',                                      15.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145614_5c03702e-12f2-4f50-882e-5d2a5f8915da.png', true, 11),
  ('Da Enzo',      'Sauce tomate, mozzarella, viande hachée, poivron, œuf',                            16.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143759_da044b86-756e-4c34-9461-7a7ca37900e5.png', true, 12),
  ('Regina',       'Sauce tomate, mozzarella, champignons, jambon blanc',                              16.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143752_4a6a0250-c5ac-4d2e-82d4-cdc09475b70f.png', true, 13),
  ('Napolitaine',  'Sauce tomate, mozzarella, anchois, câpres et olives',                              14.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145616_a502d094-c42f-4075-8f29-ad471c694df4.png', true, 14),
  ('Orientale',    'Sauce tomate, mozzarella, merguez, poivron, œuf',                                  16.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145617_aea21d86-dffd-4147-abb6-1f2047dd6cb2.png', true, 15),
  ('4 Stagioni',   'Sauce tomate, mozzarella, jambon blanc, artichaut, poivrons, olives, champignons', 16.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145618_e5c164b4-ddba-4a0f-b857-04f4c9a1f6b9.png', true, 16),
  ('Végétarienne', 'Sauce tomate, mozzarella, aubergines, poivrons, courgettes, champignons, artichauts', 15.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143801_a0b1d92d-5fd2-4df4-b3d3-3e067e2aa3e7.png', true, 17),
  ('La Picante',   'Sauce tomate, mozzarella, chorizo, basilic',                                       15.50, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143755_1a12e105-66af-4334-a4b8-5eeabce0ed33.png', true, 18),
  ('Burrata',      'Sauce tomate, burrata, basilic, roquette, tomates cerises',                        16.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145619_9e411947-8d6f-4dff-8b17-d98d21ccc4bc.png', true, 19),
  ('Calabra',      'Sauce tomate, thon, oignons rouges, mozzarella, tomates cerises, olives noires',   16.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145621_beb618b3-e371-4073-96d3-502864ae8d54.png', true, 20),
  ('Saumon',       'Sauce tomate, saumon, mozzarella et pot de crème fraîche',                         19.00, 'pizza-tomate', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145622_501a9096-10aa-405b-9e71-258e5abb7220.png', true, 21),

  -- PIZZAS BASE CRÈME
  ('Chèvre & Miel', 'Crème fraîche, chèvre, miel',                                         15.50, 'pizza-creme', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145707_c199f901-50ce-4035-a535-772c18193d3b.png', true, 22),
  ('Tartufo',       'Crème fraîche, crème de truffe, champignons, fior di latte',           16.00, 'pizza-creme', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143757_1509b486-0f16-4e19-a68c-92f6acb894cf.png', true, 23),
  ('4 Fromages',    'Fior di latte, camembert, chèvre, gorgonzola',                         16.00, 'pizza-creme', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143753_9663b956-2c8c-439b-9c13-513ee2890dbd.png', true, 24),
  ('Parma',         'Crème fraîche, fior di latte, jambon de Parme, roquette, parmesan',    19.00, 'pizza-creme', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143758_262e50cf-7501-4cb6-9e65-ce78d488cbab.png', true, 25),

  -- PASTAS
  ('Lasagne au four',           'Maison — servi avec une salade verte',  14.00, 'pasta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145708_89f859f5-714b-4759-ab9a-05373d724059.png', true, 26),
  ('Tagliatelle alla carbonara','',                                       15.00, 'pasta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145709_1e2961df-bd8f-420f-ac2b-7f831036030c.png', true, 27),
  ('Penne al 4 formaggi et noix','',                                      15.00, 'pasta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145710_7c853269-0a1d-4a7b-bb06-2b5abac4bf9f.png', true, 28),
  ('Linguine al tartufo',        '',                                      19.00, 'pasta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145711_171a4ddc-4019-442b-93a1-a02670d6bb57.png', true, 29),
  ('Risotto gorgonzola',         '',                                      14.00, 'pasta', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145712_604a0695-e620-4cd1-a4d9-419f5424ab23.png', true, 30),

  -- CARNI
  ('L''Entrecôte',             'Servie avec une sauce au choix : poivre ou gorgonzola',                   21.00, 'carni', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145714_6f63d996-c37a-4f2d-9034-29bd48931577.png', true, 31),
  ('Carpaccio di manzo',       'Bœuf, roquette, flocons de parmesan, vinaigrette',                        14.00, 'carni', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145715_e7ed4c3b-6b33-46da-ac68-5bb85ab7e113.png', true, 32),
  ('Cotoletta alla Milanese',  'Escalope de veau panée',                                                   17.00, 'carni', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145846_e158a4a6-ea19-4779-8c61-fa7773837fe5.png', true, 33),
  ('La Scaloppina',            'Escalope de veau marsala avec champignons ou sauce citron',                21.00, 'carni', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145847_f75b618f-6125-4b2f-8395-fa0729350e56.png', true, 34),
  ('La Scaloppina Bolognaise', 'Escalope panée au jambon blanc, sauce bolognaise, fior di latte',          23.00, 'carni', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145848_56883f11-90a2-4857-9f7d-01cfea1d1908.png', true, 35),
  ('Bavette Grillée',          'Servie avec une sauce au choix : poivre ou gorgonzola',                    19.00, 'carni', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145849_862651d5-ba64-44df-87fd-8e072cc8935d.png', true, 36),

  -- PESCARE
  ('Pavé di Salmone', 'Saumon frais grillé, sauce béarnaise', 19.00, 'pescare', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145851_9d154872-65e7-4a3c-b2df-9584e0fa7247.png', true, 37),

  -- BAMBINO
  ('Menu Bambino', 'Margherita ou steak haché ou spaghetti bolognaise — 1 boisson — 1 dessert au choix', 11.00, 'bambino', NULL, true, 38),

  -- GELATI
  ('Coupe Limoncello',   '2 boules citron + limoncello',                          11.00, 'gelati', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145852_44927d9a-00f0-44c4-ad8e-ecbd968be0b2.png', true, 39),
  ('Coupe Liégeois',     'Café ou chocolat',                                       9.00, 'gelati', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_145854_9d56169e-fa03-4131-91cc-7cc0448bc0c3.png', true, 40),
  ('Dame Blanche',       '3 boules vanille, sauce chocolat, chantilly',            9.00, 'gelati', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_150022_40a11c3c-1240-4806-83d3-5d2d98167de8.png', true, 41),
  ('Dame à l''Italienne','3 boules stracciatella, sauce chocolat, chantilly',      9.00, 'gelati', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_150023_f376f909-7be9-4404-a7c8-251aabdecb00.png', true, 42),
  ('Coupe Fruit Rouge',  'Cassis, framboises, fraises, coulis, chantilly',         9.00, 'gelati', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_150025_96d77cd5-dddb-4681-84ae-9975b3524802.png', true, 43),
  ('Glaces — 2 boules',  'Vanille, café, chocolat, pistache, stracciatella, fraise', 5.00, 'gelati', NULL, true, 44),
  ('Sorbets — 3 boules', 'Framboise, cassis, citron, mangue, rhum raisin',          7.00, 'gelati', NULL, true, 45),

  -- DOLCI (fait-maison)
  ('Tiramisu',          'Recette traditionnelle au mascarpone, café expresso, cacao amer',  9.00, 'dolci', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143944_96fca456-89fd-4763-bf6b-89bc2b07c85e.png', true, 46),
  ('Panna cotta',       'Fruit rouge ou caramel',                                           7.00, 'dolci', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_143945_49d45863-e175-4855-9345-54a0e2e93847.png', true, 47),
  ('Mousse au chocolat','',                                                                  7.00, 'dolci', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_150028_78ed0468-34a8-4946-9dae-fb73d68bba6d.png', true, 48),
  ('Crème brûlée',      '',                                                                  7.00, 'dolci', 'https://d8j0ntlcm91z4.cloudfront.net/user_34hTdMzSowzm7io1hBUuIclx78R/hf_20260609_150029_29b2708c-3019-4e3b-bc48-09fdda6c014a.png', true, 49),

  -- CAFÉS & THÉS
  ('Café Expresso / Décaféiné', '',  2.50, 'cafe', NULL, true, 50),
  ('Thé, Tisane',               '', 3.90, 'cafe', NULL, true, 51),
  ('Café Crème / Cappuccino',   '', 3.90, 'cafe', NULL, true, 52),
  ('Irish Coffee',               '',10.50, 'cafe', NULL, true, 53),
  ('Café / Thé Gourmand',        '',10.00, 'cafe', NULL, true, 54),

  -- VINS ITALIENS
  ('Valpolicella Classico Lamberti', '75cl — Rouge',        26.00, 'vin', NULL, true, 55),
  ('Chianti San Lorenzo',            '75cl — Rouge',        25.00, 'vin', NULL, true, 56),
  ('Lambrusco',                      '75cl — Rouge / Doux ou Sec', 21.00, 'vin', NULL, true, 57),
  ('Bardolino',                      '75cl — Rouge',        21.00, 'vin', NULL, true, 58),
  ('Montepulciano',                  '75cl — Rouge',        24.00, 'vin', NULL, true, 59),
  ('Lambrusco Rosé',                 '75cl — Rosé / Doux ou Sec', 21.00, 'vin', NULL, true, 60),
  ('Bardolino Rosé',                 '75cl — Rosé',         21.00, 'vin', NULL, true, 61),
  ('Lacryma Christi',                '75cl — Blanc',        26.00, 'vin', NULL, true, 62),
  ('Orvieto',                        '75cl — Blanc',        25.00, 'vin', NULL, true, 63),

  -- VINS FRANÇAIS
  ('Côte du Rhône',    '75cl — Rouge',              22.00, 'vin', NULL, true, 64),
  ('Côte de Provence', '75cl — Rosé',               24.00, 'vin', NULL, true, 65),
  ('Pouilly Fumé',     '75cl — Blanc',              28.00, 'vin', NULL, true, 66),
  ('Chardonnay',       '75cl — Blanc',              23.00, 'vin', NULL, true, 67),

  -- PICHETS & VERRE
  ('Pichet Rouge / Rosé / Blanc', '25cl',  7.00, 'vin', NULL, true, 68),
  ('Pichet Rouge / Rosé / Blanc', '50cl', 12.00, 'vin', NULL, true, 69),
  ('Bardolino au verre',          'Rouge ou Rosé', 5.50, 'vin', NULL, true, 70),
  ('Orvieto au verre',            'Blanc',          5.50, 'vin', NULL, true, 71);

-- --------------------------------------------------------
-- Contenu du site
-- --------------------------------------------------------
INSERT INTO site_content (key, value) VALUES
  ('phone',         '01 43 68 XX XX'),
  ('address',       '12 Rue de Paris, 94220 Charenton-le-Pont'),
  ('email',         'contact@daenzopizza.fr'),
  ('hours_mon',     'Fermé'),
  ('hours_tue',     '11h30 – 14h00 / 18h30 – 22h30'),
  ('hours_wed',     '11h30 – 14h00 / 18h30 – 22h30'),
  ('hours_thu',     '11h30 – 14h00 / 18h30 – 22h30'),
  ('hours_fri',     '11h30 – 14h00 / 18h30 – 23h00'),
  ('hours_sat',     '11h30 – 23h00'),
  ('hours_sun',     '11h30 – 22h00'),
  ('hero_title',    'Da Enzo'),
  ('hero_subtitle', 'L''art de la pizza artisanale italienne depuis 2015'),
  ('hero_cta',      'Réserver une table'),
  ('about_title',   'Notre Histoire'),
  ('about_text',    'Née de la passion d''Enzo pour les traditions culinaires napolitaines, Da Enzo est bien plus qu''une pizzeria. C''est un voyage gustatif au cœur de l''Italie, où chaque pizza est pétrie à la main avec des farines sélectionnées et garnie d''ingrédients d''exception importés directement de producteurs italiens. Notre four à bois, atteignant 450°C, confère à nos pizzas cette croûte croustillante et cette mie aérée qui font notre réputation depuis plus de 10 ans à Charenton-le-Pont.'),
  ('about_values',  'Authenticité • Qualité • Passion • Convivialité'),
  ('instagram_url', 'https://instagram.com/daenzopizza'),
  ('facebook_url',  'https://facebook.com/daenzopizza')
ON CONFLICT (key) DO NOTHING;

-- --------------------------------------------------------
-- NOTE: Compte admin
-- Créer via Supabase Auth Dashboard :
-- Email: admin@daenzo.fr / Mot de passe: [à définir]
-- Puis : UPDATE profiles SET role = 'admin' WHERE email = 'admin@daenzo.fr';
-- --------------------------------------------------------
