import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';

const formatDate = (dateString) => {
  if (!dateString) return 'Date inconnue';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const ItemCard = ({ item, type }) => {
  let title, details, link, image;

  switch (type) {
    case 'actualites':
      title = item.title;
      details = item.details;
      link = `/actualites/${item.id}`;
      image = item.images && item.images.length > 0 ? item.images[0] : null;
      break;
    case 'cholera':
      title = `Rapport Choléra: ${item.province}`;
      details = `Nouveaux cas: ${item.nbcas || 0}, Décès: ${item.nbdeces || 0}, Guéris: ${item.nbgueris || 0}`;
      link = '/solidarite/cholera';
      image = item.images && item.images.length > 0 ? item.images[0] : null;
      break;
    case 'inondations':
      title = `Rapport Inondations: ${item.province}`;
      details = `Personnes affectées: ${item.nbAffectes || 0}, Maisons détruites: ${item.nbMaisonsDetruites || 0}`;
      link = '/solidarite/inondations';
      image = item.images && item.images.length > 0 ? item.images[0] : null;
      break;
    case 'aides':
      title = `Distribution d'aides: ${item.province}`;
      details = item.observations || 'Distribution d\'aide humanitaire.';
      link = '/solidarite/aides';
      image = item.images && item.images.length > 0 ? item.images[0] : null;
      break;
    default:
      return null;
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {image && (
        <img src={image} alt={title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
      )}
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <h3 style={{ fontSize: '1.3rem', color: '#143c6d', margin: '0 0 1rem 0' }}>{title}</h3>
        <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: '1.6', flexGrow: 1 }}>{details ? details.substring(0, 120) + '...' : ''}</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
          <p style={{ fontSize: '0.85rem', color: '#888', margin: 0 }}>{formatDate(item.created_at)}</p>
          <Link href={link} style={{
            padding: '7px 16px',
            background: '#143c6d',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9rem'
          }}>
            Lire plus
          </Link>
        </div>
      </div>
    </div>
  );
};

const DataSection = ({ title, items, type, loading, onLoadMore, hasMore }) => (
  <section style={{ marginBottom: '4rem' }}>
    <h2 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#143c6d', marginBottom: '2rem', borderBottom: '3px solid #143c6d', paddingBottom: '1rem' }}>
      {title}
    </h2>
    {loading ? (
      <p>Chargement...</p>
    ) : items && items.length > 0 ? (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {items.map((item) => (
            <ItemCard key={`${type}-${item.id}`} item={item} type={type} />
          ))}
        </div>
        {hasMore && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <button
              onClick={onLoadMore}
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
    ) : (
      <p>Aucune donnée à afficher.</p>
    )}
  </section>
);

export default function Home() {
  const INITIAL_LIMIT = 3;
  const LOAD_MORE_STEP = 3;

  const [data, setData] = useState({
    actualites: [],
    cholera: [],
    inondations: [],
    aides: [],
  });
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState({
    actualites: true,
    cholera: true,
    inondations: true,
    aides: true,
  });
  const [limits, setLimits] = useState({
    actualites: INITIAL_LIMIT,
    cholera: INITIAL_LIMIT,
    inondations: INITIAL_LIMIT,
    aides: INITIAL_LIMIT,
  });

  const fetchData = async () => {
    setLoading(true);
    const tables = ['actualites', 'cholera', 'inondations', 'aides'];
    const promises = tables.map(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limits[table]);
      
      if (error) {
        console.error(`Error fetching ${table}:`, error);
        return { table, data: [], hasMore: false };
      }
      
      // Check if there are more items than currently fetched
      const { count } = await supabase.from(table).select('count', { head: true, count: 'exact' });
      const moreAvailable = count > data.length;

      return { table, data: data || [], hasMore: moreAvailable };
    });

    const results = await Promise.all(promises);

    const newData = {};
    const newHasMore = {};
    results.forEach(({ table, data, hasMore: moreAvailable }) => {
      newData[table] = data;
      newHasMore[table] = moreAvailable;
    });

    setData(newData);
    setHasMore(newHasMore);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [limits]); // Re-fetch data when limits change

  const handleLoadMore = (type) => {
    setLimits((prevLimits) => ({
      ...prevLimits,
      [type]: prevLimits[type] + LOAD_MORE_STEP,
    }));
  };

  return (
    <Layout>
      <Head>
        <title>الصفحة الرئيسية – DPASSAH</title>
        <meta name="description" content="Tableau de bord et dernières mises à jour sur les actions sociales, la solidarité et les affaires humanitaires." />
      </Head>

      <div style={{ padding: '3rem 1rem', background: '#f4f7fa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          
          <DataSection
            title="Dernières Actualités"
            items={data.actualites}
            type="actualites"
            loading={loading}
            onLoadMore={() => handleLoadMore('actualites')}
            hasMore={hasMore.actualites}
          />
          <DataSection
            title="Derniers Rapports sur le Choléra"
            items={data.cholera}
            type="cholera"
            loading={loading}
            onLoadMore={() => handleLoadMore('cholera')}
            hasMore={hasMore.cholera}
          />
          <DataSection
            title="Derniers Rapports sur les Inondations"
            items={data.inondations}
            type="inondations"
            loading={loading}
            onLoadMore={() => handleLoadMore('inondations')}
            hasMore={hasMore.inondations}
          />
          <DataSection
            title="Dernières Aides Distribuées"
            items={data.aides}
            type="aides"
            loading={loading}
            onLoadMore={() => handleLoadMore('aides')}
            hasMore={hasMore.aides}
          />

        </div>
      </div>
    </Layout>
  );
}
