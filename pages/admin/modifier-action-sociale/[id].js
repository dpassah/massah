import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';
import Head from 'next/head';
import ImageManager from '../../../components/ImageManager';

const ACTION_TYPES = [
  { value: 'sensibilisation', label: 'Séance de sensibilisation' },
  { value: 'formation', label: 'Formation' },
  { value: 'assistance', label: 'Assistance directe' },
  { value: 'plaidoyer', label: 'Plaidoyer' },
  { value: 'autre', label: 'Autre' }
];

export default function ModifierActionSociale() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitMsg, setSubmitMsg] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkUserAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const role = localStorage.getItem('userRole');
      setUserRole(role || '');

      if (id) {
        console.log("Fetching social action with ID:", id); // Debug log
        fetchActionSociale(id);
      }
    };
    checkUserAndLoadData();
  }, [id, router]);

  async function fetchActionSociale(actionId) {
    setLoading(true);
    const { data, error } = await supabase
      .from('action_sociale')
      .select('*')
      .eq('id', actionId)
      .single();

    if (error) {
      console.error('Error fetching social action:', error); // Debug log
      setSubmitMsg('Erreur lors du chargement de l\'action sociale.');
    } else if (data) {
      // Ensure images array has 3 elements, filling with null if less
      const imagesArray = data.images ? [...data.images] : [];
      while (imagesArray.length < 3) {
        imagesArray.push(null);
      }
      setForm({
        ...form,
        images: imagesArray,
        nombre_participants_hommes: data.nombre_participants_hommes || '',
        nombre_participants_femmes: data.nombre_participants_femmes || '',
      });
      setInitialForm({ ...data, images: imagesArray });
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (index, newImageUrl) => {
    setForm(prev => {
      const newImages = [...prev.images];
      newImages[index] = newImageUrl;
      return { ...prev, images: newImages };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Mise à jour en cours...');

    const initialImages = initialForm.images.filter(Boolean); // Filter out nulls
    const currentImages = form.images.filter(Boolean); // Filter out nulls

    // Determine images to delete from storage
    const toDelete = initialImages.filter(url => !currentImages.includes(url));
    if (toDelete.length > 0) {
      const pathsToDelete = toDelete.map(url => {
        const parts = url.split('/');
        return `action-sociale/${parts[parts.length - 1]}`;
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
    for (const img of form.images) {
      if (img === null) continue; // Skip null slots
      if (typeof img === 'string') {
        imageUrls.push(img); // Existing image URL
      } else { // New file object
        const fileExt = img.name.split('.').pop();
        const fileName = `action-sociale/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('images').upload(fileName, img);
        if (error) {
          setSubmitMsg(`Erreur lors du téléchargement de l\'image : ${error.message}`);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }
    }

    const { created_at, id: formId, ...updateData } = form;
    const { error: updateError } = await supabase.from('action_sociale').update({
      ...form,
      images: imageUrls,
      nombre_participants_hommes: parseInt(updateData.nombre_participants_hommes, 10) || 0,
      nombre_participants_femmes: parseInt(updateData.nombre_participants_femmes, 10) || 0,
    }).eq('id', id);

    if (updateError) {
      setSubmitMsg(`Erreur lors de la mise à jour : ${updateError.message}`);
      console.error(updateError);
      return;
    }

    setSubmitMsg('Action sociale mise à jour avec succès !');
    router.push('/mes-rapports'); // Redirect after successful update
  };

  if (loading) {
    return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}>Chargement de l'action sociale...</div></Layout>;
  }

  if (!form) {
    return <Layout><div style={{ textAlign: 'center', padding: '4rem' }}>Action sociale non trouvée.</div></Layout>;
  }

  return (
    <Layout>
      <Head>
        <title>Modifier Action Sociale – DPASSAH</title>
      </Head>
      <div className="admin-form-container" style={{ maxWidth: 900, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center' }}>Modifier une Action Sociale</h1>
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
              <label>Sous-préfecture / Commune</label>
              <input name="sous_prefecture" value={form.sous_prefecture || ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Ville / Village</label>
              <input name="ville" value={form.ville || ''} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Date de l'action</label>
              <input name="date_action" type="date" value={form.date_action || ''} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Type d'action</label>
              <select name="type_action" value={form.type_action || ''} onChange={handleChange} required>
                <option value="">-- Choisir un type --</option>
                {ACTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Participants Hommes</label>
              <input name="nombre_participants_hommes" type="number" value={form.nombre_participants_hommes} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Participants Femmes</label>
              <input name="nombre_participants_femmes" type="number" value={form.nombre_participants_femmes} onChange={handleChange} />
            </div>
          </div>

          {/* --- Champs pleine largeur --- */}
          <div className="form-field-full">
            <label>Thèmes Abordés (séparés par des virgules)</label>
            <input name="themes_abordes" value={form.themes_abordes || ''} onChange={handleChange} />
          </div>
          <div className="form-field-full">
            <label>Description détaillée de l'action</label>
            <textarea name="description" value={form.description || ''} onChange={handleChange} rows="5"></textarea>
          </div>

          {/* --- Section Images --- */}
          <ImageManager
            images={form.images}
            onImageChange={handleImageChange}
            storageBucket="action-sociale"
          />

          {/* --- Soumission --- */}
          <div style={{gridColumn: '1 / -1', textAlign:'center', marginTop: '2rem'}}>
            <label>Signataire</label>
            <input name="signataire" value={form.signataire || ''} onChange={handleChange} readOnly={userRole !== 'admin'} />
            <button type="submit" className="submit-button">Mettre à jour l'Action</button>
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
        .photo-uploader {
          width: 100px; height: 100px; 
          background: #f7f7f7; border: 2px dashed #ccc; 
          border-radius: 10px; 
          display: flex; align-items: center; justify-content: center; 
          cursor: pointer; transition: border-color 0.2s;
          font-size: 2.5rem; color: #aaa;
          overflow: hidden;
        }
        .photo-uploader:hover {
          border-color: #143c6d;
        }
        .photo-uploader input[type="file"] {
          display: none;
        }
        .photo-uploader img {
          width: 100%; height: 100%;
          object-fit: cover;
        }
        .photo-name {
          font-size: 0.75rem; color: #666;
          margin-top: 0.5rem; max-width: 100px;
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
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
  );
}