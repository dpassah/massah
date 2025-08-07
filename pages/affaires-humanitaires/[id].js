import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import Layout from '@/components/Layout';
import Head from 'next/head';
import Image from 'next/image';

export default function AffairesHumanitairesDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [action, setAction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchAffaireHumanitaireDetail();
    }
  }, [id]);

  async function fetchAffaireHumanitaireDetail() {
    setLoading(true);
    const { data, error } = await supabase
      .from('affaires_humanitaires')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching affaire humanitaire detail:', error);
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
          Chargement des détails de l'affaire humanitaire...
        </div>
      </Layout>
    );
  }

  if (!action) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
          Affaire humanitaire introuvable.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{action.type_aide} – Détails de l'Affaire Humanitaire</title>
      </Head>

      <div style={{ maxWidth: 800, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#143c6d', marginBottom: '1.5rem', textAlign: 'center' }}>Détails de l'Affaire Humanitaire</h1>

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
          <strong>Préfecture:</strong> {action.prefecture}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Ville:</strong> {action.ville}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Type d'aide:</strong> {action.type_aide}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Bénéficiaires Hommes:</strong> {action.beneficiaires_hommes}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Bénéficiaires Femmes:</strong> {action.beneficiaires_femmes}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Type de Bénéficiaires:</strong> {action.beneficiary_type}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Organisation / Donateur:</strong> {action.organization_name}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Nom du Projet:</strong> {action.project_name}
        </p>
        <p style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.5rem' }}>
          <strong>Type de Travail:</strong> {action.work_type}
        </p>

        <h2 style={{ fontSize: '1.4rem', color: '#143c6d', margin: '1.5rem 0 0.8rem 0', fontWeight: 'bold' }}>Description:</h2>

        <p style={{ fontSize: '1rem', color: '#555', lineHeight: '1.6' }}>
          {action.description}
        </p>

        <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '1.5rem' }}>
          Date d'intervention: {new Date(action.date_intervention).toLocaleDateString('fr-FR')}
        </p>
        <p style={{ fontSize: '0.9rem', color: '#888' }}>
          Créé le: {new Date(action.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>
    </Layout>
  );
}
