import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import Head from 'next/head';
import Link from 'next/link';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function ActualiteDetails() {
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (!id) return;

    const fetchNewsItem = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('actualites')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching news item:', error);
        setNewsItem(null);
      } else {
        setNewsItem(data);
      }
      setLoading(false);
    };

    fetchNewsItem();
  }, [id]);

  if (loading) {
    return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}>Chargement de l'actualité...</div></Layout>;
  }

  if (!newsItem) {
    return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}>Actualité non trouvée.</div></Layout>;
  }

  return (
    <Layout>
      <Head>
        <title>{newsItem.title} – DPASSAH</title>
      </Head>

      <div style={{ maxWidth: '900px', margin: '3rem auto', background: '#fff', padding: '3rem', borderRadius: '15px', boxShadow: '0 6px 24px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#143c6d', marginBottom: '1rem', lineHeight: 1.2 }}>{newsItem.title}</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', color: '#555', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
          <span style={{ fontWeight: 600 }}>Publié par:</span>
          <span style={{ marginLeft: '0.5rem', color: '#143c6d' }}>{newsItem.signataire || 'Anonyme'}</span>
          <span style={{ margin: '0 1rem' }}>|</span>
          <span style={{ fontWeight: 600 }}>Date:</span>
          <span style={{ marginLeft: '0.5rem' }}>{formatDate(newsItem.created_at)}</span>
        </div>

        {newsItem.images && newsItem.images.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <img src={newsItem.images[0]} alt={newsItem.title} style={{ width: '100%', borderRadius: '10px', marginBottom: '1rem' }} />
            {newsItem.images.length > 1 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                {newsItem.images.slice(1).map((image, index) => (
                  <a href={image} target="_blank" rel="noopener noreferrer" key={index}>
                    <img src={image} alt={`${newsItem.title} - image ${index + 2}`} style={{ width: '100%', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
          {newsItem.details}
        </div>

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link href="/" style={{
            padding: '0.8rem 2rem',
            background: '#143c6d',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
          }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </Layout>
  );
}
