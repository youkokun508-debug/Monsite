'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import { PIZZA_CATEGORIES } from '@/lib/constants';
import type { Pizza, PizzaFormData, PizzaCategory } from '@/lib/types';

export default function AdminMenuPage() {
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Pizza | null>(null);
  const [formData, setFormData] = useState<PizzaFormData>({
    name: '',
    description: '',
    price: 0,
    category: 'classique',
    image_url: null,
    is_available: true,
    position: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPizzas();
  }, []);

  async function fetchPizzas() {
    const supabase = createClient();
    const { data } = await supabase
      .from('pizzas')
      .select('*')
      .order('position', { ascending: true });
    if (data) setPizzas(data as Pizza[]);
    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'classique',
      image_url: null,
      is_available: true,
      position: pizzas.length + 1,
    });
    setShowModal(true);
  }

  function openEdit(pizza: Pizza) {
    setEditing(pizza);
    setFormData({
      name: pizza.name,
      description: pizza.description,
      price: pizza.price,
      category: pizza.category,
      image_url: pizza.image_url,
      is_available: pizza.is_available,
      position: pizza.position,
    });
    setShowModal(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const supabase = createClient();

    if (editing) {
      await supabase
        .from('pizzas')
        .update(formData)
        .eq('id', editing.id);
    } else {
      await supabase.from('pizzas').insert(formData);
    }

    setShowModal(false);
    setSaving(false);
    fetchPizzas();
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette pizza définitivement ?')) return;
    const supabase = createClient();
    await supabase.from('pizzas').delete().eq('id', id);
    fetchPizzas();
  }

  async function toggleAvailability(pizza: Pizza) {
    const supabase = createClient();
    await supabase
      .from('pizzas')
      .update({ is_available: !pizza.is_available })
      .eq('id', pizza.id);
    fetchPizzas();
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', marginBottom: '0.25rem' }}>
            Gestion du Menu
          </h1>
          <p style={{ margin: 0 }}>{pizzas.length} produits au total</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary">
          + Ajouter un produit
        </button>
      </motion.div>

      {/* Table */}
      {loading ? (
        <div className="skeleton" style={{ height: '400px', borderRadius: '4px' }} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix</th>
                <th>Disponible</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pizzas.map((pizza) => (
                <tr key={pizza.id}>
                  <td style={{ color: 'var(--color-text-muted)' }}>{pizza.position}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {pizza.image_url ? (
                        <img
                          src={pizza.image_url}
                          alt={pizza.name}
                          style={{
                            width: '40px',
                            height: '40px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--color-surface-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                          }}
                        >
                          🍕
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, color: 'var(--color-text-primary)', fontWeight: 500 }}>{pizza.name}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--color-text-muted)', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {pizza.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-gold">
                      {PIZZA_CATEGORIES.find((c) => c.slug === pizza.category)?.name || pizza.category}
                    </span>
                  </td>
                  <td style={{ color: 'var(--color-gold)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                    {formatPrice(pizza.price)}
                  </td>
                  <td>
                    <button
                      onClick={() => toggleAvailability(pizza)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                      }}
                      title={pizza.is_available ? 'Désactiver' : 'Activer'}
                    >
                      {pizza.is_available ? '✅' : '❌'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => openEdit(pizza)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(pizza.id)}
                        className="btn btn-sm"
                        style={{
                          padding: '0.35rem 0.75rem',
                          fontSize: '0.75rem',
                          color: 'var(--color-error)',
                          border: '1px solid rgba(229,57,53,0.3)',
                          background: 'rgba(229,57,53,0.1)',
                        }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>
                {editing ? 'Modifier le produit' : 'Ajouter un produit'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-text-secondary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" htmlFor="pizza-name">Nom</label>
                <input
                  id="pizza-name"
                  type="text"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" htmlFor="pizza-desc">Description</label>
                <textarea
                  id="pizza-desc"
                  className="input-field"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div>
                  <label className="input-label" htmlFor="pizza-price">Prix (€)</label>
                  <input
                    id="pizza-price"
                    type="number"
                    required
                    step="0.50"
                    min="0"
                    className="input-field"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="input-label" htmlFor="pizza-cat">Catégorie</label>
                  <select
                    id="pizza-cat"
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as PizzaCategory })}
                  >
                    {PIZZA_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label className="input-label" htmlFor="pizza-img">URL de l&apos;image</label>
                <input
                  id="pizza-img"
                  type="url"
                  className="input-field"
                  placeholder="https://..."
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value || null })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <label className="input-label" htmlFor="pizza-pos">Position</label>
                  <input
                    id="pizza-pos"
                    type="number"
                    min="0"
                    className="input-field"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      style={{
                        width: '20px',
                        height: '20px',
                        accentColor: 'var(--color-gold)',
                      }}
                    />
                    <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                      Disponible
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Enregistrement...' : editing ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
