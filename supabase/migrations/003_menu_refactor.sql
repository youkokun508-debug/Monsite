-- ============================================================
-- Da Enzo Pizza — Migration 003 : Refonte du menu complet
-- Remplace les catégories fictives par le vrai menu du restaurant
-- À exécuter dans Supabase > SQL Editor
-- ============================================================

-- 1. Vider les données existantes
DELETE FROM pizzas;
DELETE FROM categories_menu;

-- 2. Supprimer l'ancienne contrainte CHECK
ALTER TABLE pizzas DROP CONSTRAINT IF EXISTS pizzas_category_check;

-- 3. Changer le DEFAULT
ALTER TABLE pizzas ALTER COLUMN category SET DEFAULT 'pizza-tomate';

-- 4. Ajouter la nouvelle contrainte avec toutes les catégories
ALTER TABLE pizzas ADD CONSTRAINT pizzas_category_check
  CHECK (category IN (
    'bruschetta', 'antipasti', 'insalate',
    'pizza-tomate', 'pizza-creme',
    'pasta', 'carni', 'pescare',
    'gelati', 'dolci', 'cafe', 'vin', 'bambino'
  ));
