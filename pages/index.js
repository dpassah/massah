import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Head from 'next/head';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import styles from '../styles/home.module.css'; // Import the CSS module

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
    <div className={styles.itemCard}>
      {image && (
        <img src={image} alt={title} className={styles.itemCardImage} />
      )}
      <div className={styles.itemCardContent}>
        <h3 className={styles.itemCardTitle}>{title}</h3>
        <p className={styles.itemCardDetails}>{details ? details.substring(0, 120) + '...' : ''}</p>
        <div className={styles.itemCardFooter}>
          <p className={styles.itemCardDate}>{formatDate(item.created_at)}</p>
          <Link href={link} className={styles.itemCardLink}>
            Lire plus
          </Link>
        </div>
      </div>
    </div>
  );
};

const DataSection = ({ title, items, type, loading, onLoadMore, hasMore }) => (
  <section className={styles.dataSection}>
    <h2 className={styles.dataSectionTitle}>
      {title}
    </h2>
    {loading ? (
      <p>Chargement...</p>
    ) : items && items.length > 0 ? (
      <>
        <div className={styles.dataGrid}>
          {items.map((item) => (
            <ItemCard key={`${type}-${item.id}`} item={item} type={type} />
          ))}
        </div>
        {hasMore && (
          <div className={styles.loadMoreContainer}>
            <button
              onClick={onLoadMore}
              className={styles.loadMoreButton}
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
        <title>Accueil – DPASSAH</title>
        <meta name="description" content="Tableau de bord et dernières mises à jour sur les actions sociales, la solidarité et les affaires humanitaires." />
      </Head>

      <div className={styles.mainContentWrapper}>
        <div className={styles.mainContentInner}>
          
          
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
