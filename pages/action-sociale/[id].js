import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';
import Head from 'next/head';
import Image from 'next/image';

export default function SocialActionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchActionDetail();
    }
  }, [id]);

  async function fetchActionDetail() {
    setLoading(true);
    const { data, error } = await supabase
      .from('action_sociale')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching social action detail:', error);
      setAction(null);
    } else {
      setAction(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
          Chargement des détails de l'action sociale...
        </div>
      </Layout>
    );
  }

  if (!action) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
          Action sociale introuvable.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{action.type_action} – Détails de l'Action Sociale</title>
      </Head>

      <div style={{ maxWidth: 800, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#143c6d', marginBottom: '1.5rem', textAlign: 'center' }}>Détails de l'Action Sociale</h1>

        {action.images && action.images.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            {action.images.map((img, index) => (
              <div key={index} style={{ position: 'relative', width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                <Image src={img} alt={`Image ${index + 1}`} layout="fill" objectFit="cover" />
              </div>
            ))}
          </div>
        )}

        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Province:</strong> {action.province}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Type d'Action:</strong> {action.type_action}
        </p>

        <h2 style={{ fontSize: '1.4rem', color: '#143c6d', margin: '1.5rem 0 0.8rem 0', fontWeight: 'bold' }}>Thèmes Abordés: {action.themes_abordes}</h2>

        <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
          <strong>Description:</strong> {action.description}
        </p>

        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1.5rem' }}>
          Date de l'action: {new Date(action.date_action).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </Layout>
  );
}
