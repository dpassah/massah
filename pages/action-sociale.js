import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

export default function ActionSociale() {
  const INITIAL_LIMIT = 6;
  const LOAD_MORE_STEP = 6;

  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchSocialActions();
  }, [limit]);

  async function fetchSocialActions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('action_sociale')
      .select('id, type_action, description, themes_abordes, date_action, images, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching social actions:', error);
      setActions([]);
      setHasMore(false);
    } else {
      setActions(data || []);
      // Check if there are more items than currently fetched
      const { count } = await supabase.from('action_sociale').select('count', { head: true, count: 'exact' });
      setHasMore(count > data.length);
    }
    setLoading(false);
  }

  const handleLoadMore = () => {
    setLimit((prevLimit) => prevLimit + LOAD_MORE_STEP);
  };

  return (
    <Layout>
      <Head>
        <title>Action Sociale – Ministère du Travail Social, Solidarité et Affaires Humanitaires</title>
      </Head>

      <div style={{ maxWidth: 1000, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center', letterSpacing: '1px' }}>Action Sociale</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Chargement des actions sociales...
          </div>
        ) : actions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Aucune action sociale à afficher pour le moment.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              {actions.map((item) => (
                <Link key={item.id} href={`/action-sociale/${item.id}`} passHref>
                  <div style={{ background: '#f9f9f9', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', cursor: 'pointer' }}>
                    {item.images && item.images.length > 0 && (
                      <Image src={item.images[0]} alt={item.type_action || 'Action Image'} width={300} height={200} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                    )}
                    <div style={{ padding: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.4rem', color: '#143c6d', margin: '0 0 0.8rem 0' }}>{item.type_action}</h2>
                      <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.5' }}>{item.description ? item.description.substring(0, 150) + '...' : ''}</p>
                      <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '1rem' }}>Publié le: {new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                  onClick={handleLoadMore}
                  style={{
                    padding: '10px 20px',
                    background: '#143c6d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 500,
                  }}
                >
                  Voir plus
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
