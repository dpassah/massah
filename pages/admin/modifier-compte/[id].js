// /pages/admin/comptes/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';
import RequireAuth from '../../../components/RequireAuth';

export default function ModifierCompte() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    nom_delegue: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  async function fetchUser() {
    setLoading(true);
    const { data, error } = await supabase
      .from('comptes')
      .select('*, user_id')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      setUser(null);
    } else {
      setUser(data);
      setFormData({
        username: data.username || '',
        nom_delegue: data.nom_delegue || '',
        password: '',
        role: data.userrole || '',
      });
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { username, nom_delegue, password, role } = formData;

    // 1) Mise à jour table `comptes`
    const { error: updateError } = await supabase
      .from('comptes')
      .update({ username, nom_delegue, userrole: role })
      .eq('id', id);

    if (updateError) {
      console.error(updateError);
      alert('Erreur lors de la mise à jour de l’utilisateur.');
      setLoading(false);
      return;
    }

    // 2) Mise à jour mot de passe (si renseigné)
    if (password && password.trim() !== '') {
      if (!user?.user_id) {
        alert('ID utilisateur introuvable.');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/admin/update-user-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.user_id,
            newPassword: password.trim(),
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          alert(`Erreur : ${json.error || 'Mise à jour échouée'}`);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error(err);
        alert('Erreur réseau.');
        setLoading(false);
        return;
      }
    }

    alert('Utilisateur modifié avec succès !');
    router.push('/admin/comptes');
  };

  const handleCancel = () => router.push('/admin/comptes');

  if (loading) return <Layout><div>Chargement...</div></Layout>;
  if (!user) return <Layout><div>Utilisateur non trouvé.</div></Layout>;

  return (
    <RequireAuth role="admin">
      <Layout>
        <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', padding: '2.5rem', borderRadius: 20, boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
          <h1 style={{ fontSize: '1.4rem', color: '#143c6d', marginBottom: '1.5rem', textAlign: 'center' }}>
            Modifier le compte utilisateur
          </h1>

          <form onSubmit={handleSave}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nom d'utilisateur :
              </label>
              <input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 5 }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="nom_delegue" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nom du délégué :
              </label>
              <input
                id="nom_delegue"
                name="nom_delegue"
                value={formData.nom_delegue}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 5 }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Nouveau mot de passe (laisser vide pour ne pas changer) :
              </label>
              <input
                type="text"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #ddd', borderRadius: 5 }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Province :</label>
              <p style={{ padding: '0.5rem', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 5 }}>
                {user.province}
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Rôle :</label>
              <p style={{ padding: '0.5rem', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: 5 }}>
                {user.userrole}
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: loading ? '#ccc' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 5,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </Layout>
    </RequireAuth>
  );
}