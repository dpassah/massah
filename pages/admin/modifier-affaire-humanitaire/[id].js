import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';
import Head from 'next/head';
import ImageManager from '../../../components/ImageManager';
import RequireAuth from '../../../components/RequireAuth';

const ModifierAffaireHumanitaire = () => {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitMsg, setSubmitMsg] = useState('');
  const [userRole, setUserRole] = useState(''); // Added userRole state

  useEffect(() => {
    console.log("[DEBUG] useEffect triggered. ID:", id, "router.isReady:", router.isReady); // New log
    const checkUserAndLoadData = async () => {
      if (!router.isReady) {
        console.log("[DEBUG] Router not ready yet."); // New log
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      console.log("[DEBUG] Supabase session:", session); // New log
      if (!session) {
        console.log("[DEBUG] No session found, redirecting to login."); // New log
        router.push('/login');
        return;
      }

      const role = localStorage.getItem('userRole');
      setUserRole(role || '');

      if (id) {
        console.log("[DEBUG] Calling fetchAffaireHumanitaire with ID:", id);
        fetchAffaireHumanitaire(id);
      } else {
        console.log("[DEBUG] ID is not available yet."); // New log
      }
    };
    checkUserAndLoadData();
  }, [id, router.isReady, router]); // Add router.isReady to dependencies

  async function fetchAffaireHumanitaire(affaireId) {
    setLoading(true);
    const { data, error } = await supabase
      .from('affaires_humanitaires')
      .select('*')
      .eq('id', affaireId)
      .single();

    if (error) {
      console.error('Error fetching affaire humanitaire:', error);
      setSubmitMsg('Erreur lors du chargement des données.');
    } else if (data) {
      // Format date for input type="date"
      if (data.date_intervention) {
        data.date_intervention = new Date(data.date_intervention).toISOString().split('T')[0];
      }
      setForm({
        ...data,
        beneficiaires_hommes: data.beneficiaires_hommes || 0,
        beneficiaires_femmes: data.beneficiaires_femmes || 0,
      });
      setInitialForm(data);
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleImageDelete = (url) => {
    setForm(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }));
  };

  const handleNewImages = (urls) => {
    setForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Mise à jour en cours...');

    const initialImages = initialForm.images || [];
    const currentImages = form.images || [];

    // Determine images to delete from storage
    const toDelete = initialImages.filter(url => !currentImages.includes(url));
    if (toDelete.length > 0) {
      const pathsToDelete = toDelete.map(url => {
        const parts = url.split('/');
        // Assuming the path in storage is like 'affaires-humanitaires/filename.jpg'
        return `affaires-humanitaires/${parts[parts.length - 1]}`;
      });
      const { error: deleteError } = await supabase.storage.from('images').remove(pathsToDelete);
      if (deleteError) {
        console.error('Error deleting old images:', deleteError);
        setSubmitMsg(`Erreur lors de la suppression des anciennes images: ${deleteError.message}`);
        return;
      }
    }

    // Upload new images and collect all image URLs
    let imageUrls = [];
    for (const img of currentImages) {
      if (typeof img === 'string') {
        imageUrls.push(img); // Existing image URL
      } else { // New file object (from ImageManager)
        const fileExt = img.name.split('.').pop();
        const fileName = `affaires-humanitaires/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('images').upload(fileName, img);
        if (uploadError) {
          setSubmitMsg(`Erreur lors du téléchargement de l\'image : ${uploadError.message}`);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }
    }

    const { created_at, id: formId, ...updateData } = form;
    const { error: updateError } = await supabase.from('affaires_humanitaires').update({
      ...updateData,
      images: imageUrls,
      beneficiaires_hommes: parseInt(updateData.beneficiaires_hommes, 10) || 0,
      beneficiaires_femmes: parseInt(updateData.beneficiaires_femmes, 10) || 0,
    }).eq('id', id);

    if (updateError) {
      setSubmitMsg(`Erreur lors de la mise à jour : ${updateError.message}`);
      console.error(updateError);
      return;
    }

    setSubmitMsg('Données mises à jour avec succès !');
    router.push('/mes-rapports'); // Redirect after successful update
  };

  if (loading) {
    return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}>Chargement des données...</div></Layout>;
  }

  if (!form) {
    return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}>Données non trouvées.</div></Layout>;
  }

  return (
    <RequireAuth>
      <Layout>
        <Head>
          <title>Modifier Affaire Humanitaire – DPASSAH</title>
        </Head>
        <div className="admin-form-container" style={{ maxWidth: 900, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
          <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center' }}>Modifier une Affaire Humanitaire</h1>
          <form onSubmit={handleSubmit} className="dynamic-form">
            
            {/* --- Champs principaux --- */}
            <div className="form-grid">
              <div className="form-field">
                <label>Province</label>
                <input name="province" value={form.province || ''} onChange={handleChange} required readOnly={userRole !== 'admin'} />
              </div>
              <div className="form-field">
                <label>Département</label>
                <input name="prefecture" value={form.prefecture || ''} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Ville</label>
                <input name="ville" value={form.ville || ''} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Date d'intervention</label>
                <input name="date_intervention" type="date" value={form.date_intervention || ''} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label>Type d'aide</label>
                <input name="type_aide" value={form.type_aide || ''} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Bénéficiaires Hommes</label>
                <input name="beneficiaires_hommes" type="number" value={form.beneficiaires_hommes} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Bénéficiaires Femmes</label>
                <input name="beneficiaires_femmes" type="number" value={form.beneficiaires_femmes} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Type de Bénéficiaires</label>
                <input name="beneficiary_type" value={form.beneficiary_type || ''} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Organisation</label>
                <input name="organization_name" value={form.organization_name || ''} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Nom du Projet</label>
                <input name="project_name" value={form.project_name || ''} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label>Type de Travail</label>
                <input name="work_type" value={form.work_type || ''} onChange={handleChange} />
              </div>
            </div>

            {/* --- Champs pleine largeur --- */}
            <div className="form-field-full">
              <label>Description détaillée</label>
              <textarea name="description" value={form.description || ''} onChange={handleChange} rows="5"></textarea>
            </div>

            {/* --- Section Images --- */}
            <ImageManager
              images={form.images}
              onImageDelete={handleImageDelete}
              onNewImages={handleNewImages}
              storageBucket="affaires-humanitaires" // Specific bucket for affaires humanitaires images
            />

            {/* --- Soumission --- */}
            <div style={{gridColumn: '1 / -1', textAlign:'center', marginTop: '2rem'}}>
              <label>Signataire</label>
              <input name="signataire" value={form.signataire || ''} onChange={handleChange} readOnly={userRole !== 'admin'} />
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Mise à update...' : 'Mettre à jour'}
              </button>
              {submitMsg && <p style={{marginTop: '1rem', color: submitMsg.includes('Erreur') ? '#e53935' : '#2e7d32', fontWeight: 600}}>{submitMsg}</p>}
            </div>
          </form>
        </div>

        <style jsx>{`
          .dynamic-form .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1.5rem;
          }
          .dynamic-form .form-field, .dynamic-form .form-field-full {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
          .dynamic-form .form-field-full {
            grid-column: 1 / -1;
          }
          .dynamic-form label {
            font-weight: 600;
            color: #333;
          }
          .dynamic-form input, .dynamic-form select, .dynamic-form textarea {
            width: 100%;
            padding: 0.8rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 1rem;
          }
          .dynamic-form input[readOnly] {
            background: #f0f0f0;
          }
          .submit-button {
            background: #143c6d; color: white;
            padding: 1rem 2.5rem; border: none; border-radius: 8px;
            font-size: 1.1rem; font-weight: 700; cursor: pointer;
            transition: background 0.3s;
          }
          .submit-button:hover {
            background: #0f2a4d;
          }

          @media (max-width: 768px) {
            .dynamic-form .form-grid {
              grid-template-columns: 1fr;
            }
            .admin-form-container {
              padding: 1.5rem !important;
            }
          }
        `}</style>
      </Layout>
    </RequireAuth>
  );
};

export default ModifierAffaireHumanitaire;