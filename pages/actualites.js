import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Actualites() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    setLoading(true);
    const { data, error } = await supabase
      .from('actualites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching news:', error);
      setNews([]);
    } else {
      setNews(data || []);
    }
    setLoading(false);
  }

  const handleEdit = (id) => {
    router.push(`/admin/modifier-actualite/${id}`);
  };

  const handleCreateNew = () => {
    router.push('/admin/creer-actualite');
  };

  return (
    <Layout>
      <Head>
        <title>Actualités – DPASSAH</title>
      </Head>

      <div style={{ maxWidth: 1000, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center', letterSpacing: '1px' }}>Actualités</h1>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button onClick={handleCreateNew} style={{
            background: '#143c6d',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'background 0.3s ease',
          }}>
            Créer une nouvelle actualité
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Chargement des actualités...
          </div>
        ) : news.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Aucune actualité à afficher pour le moment.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {news.map((item) => (
              <div key={item.id} style={{ background: '#f9f9f9', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                {item.images && item.images.length > 0 && (
                  <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                )}
                <div style={{ padding: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.4rem', color: '#143c6d', margin: '0 0 0.8rem 0' }}>{item.title}</h2>
                  <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.5' }}>{item.details.substring(0, 150)}...</p>
                  <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>Publié le: {new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                  <button onClick={() => handleEdit(item.id)} style={{
                    background: '#f9c846',
                    color: '#143c6d',
                    padding: '8px 15px',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    marginTop: '1rem',
                  }}>
                    Modifier
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}