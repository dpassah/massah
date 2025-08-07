import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';
import Head from 'next/head';
import { useRouter } from 'next/router';
import ImageManager from '../../../components/ImageManager'; // Import the new ImageManager

export default function ModifierActualite() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    title: '',
    details: '',
  });
  const [images, setImages] = useState([null, null, null]); // Initialize with 3 nulls
  const [submitMsg, setSubmitMsg] = useState('');
  const [loading, setLoading] = useState(true); // Initialize loading as a state with true
  const [initialImages, setInitialImages] = useState([null, null, null]); // To track original images for deletion

  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) {
      router.replace('/login');
      return;
    }

    if (id) {
      fetchActualite(id);
    }
  }, [id, router]);

  async function fetchActualite(actualiteId) {
    setLoading(true);
    const { data, error } = await supabase
      .from('actualites')
      .select('*')
      .eq('id', actualiteId)
      .single();

    if (error) {
      console.error('Error fetching actualite:', error);
      setSubmitMsg('Erreur lors du chargement de l\'actualité.');
    } else if (data) {
      setForm({ title: data.title, details: data.details });
      // Ensure images array has 3 elements, filling with null if less
      let imagesArray = [];
      if (Array.isArray(data.images)) {
        imagesArray = [...data.images];
      }
      while (imagesArray.length < 3) {
        imagesArray.push(null);
      }
      setImages(imagesArray);
      setInitialImages(imagesArray);
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (index, newImageUrl) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = newImageUrl;
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Envoi en cours...');

    // Determine images to delete from storage
    let toDelete = [];
    if (Array.isArray(initialImages)) {
      toDelete = initialImages.filter(url => url && !images.includes(url));
    }
    if (toDelete.length > 0) {
      const pathsToDelete = toDelete.map(url => {
        const parts = url.split('/');
        return `actualites/${parts[parts.length - 1]}`;
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
    for (const img of images) {
      if (img === null) continue; // Skip null slots
      if (typeof img === 'string') {
        imageUrls.push(img); // Existing image URL
      } else { // New file object
        const fileExt = img.name.split('.').pop();
        const fileName = `actualites/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('images').upload(fileName, img);
        if (error) {
          setSubmitMsg(`Erreur lors du téléchargement de l\'image : ${error.message}`);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }
    }

    const { error: updateError } = await supabase.from('actualites').update(
      {
        title: form.title,
        details: form.details,
        images: imageUrls,
      }
    ).eq('id', id);

    if (updateError) {
      setSubmitMsg('Erreur lors de la mise à jour de l\'actualité : ' + updateError.message);
      return;
    }

    setSubmitMsg('Actualité mise à jour avec succès !');
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
          Chargement de l'actualité...
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>Modifier Actualité – DPASSAH</title>
      </Head>

      <div className="admin-form-container" style={{ maxWidth: 800, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center', letterSpacing: '1px' }}>Modifier l'actualité</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Titre de l'actualité <span style={{ color: '#e53935' }}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Titre de l'actualité..." required style={{ width: '100%', marginBottom: 8, background: '#fafdff', border: '1.5px solid #b3c0d1', borderRadius: 10, padding: '0.7rem', fontWeight: 500, fontSize: '1.08rem' }} />

            <label style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Détails de l'actualité <span style={{ color: '#e53935' }}>*</span></label>
            <textarea name="details" value={form.details} onChange={handleChange} placeholder="Décrivez les détails de l'actualité..." required style={{ width: '100%', marginBottom: 6, borderRadius: 10, border: '1.5px solid #b3c0d1', padding: '0.8rem', fontWeight: 500, fontSize: '1.08rem', background: '#fafdff' }} rows={5} />

            {/* Use the new ImageManager component */}
            <ImageManager
              images={images}
              onImageChange={handleImageChange}
              storageBucket="actualites"
            />
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button type="submit" style={{ background: '#143c6d', color: '#fff', border: 'none', borderRadius: '10px', padding: '1rem 2.7rem', fontWeight: 700, fontSize: '1.13rem', boxShadow: '0 2px 8px rgba(20,60,109,0.09)', transition: 'background 0.2s' }}>
              Mettre à jour l'actualité
            </button>
            {submitMsg && <div style={{ marginTop: 14, color: submitMsg.includes('Erreur') ? '#e53935' : '#2e7d32', fontWeight: 600, fontSize: '1.07rem' }}>{submitMsg}</div>}
          </div>
        </form>
      </div>
      <style jsx>{`
        @media (max-width: 768px) {
          form {
            gap: 1rem !important;
          }
          form > div {
            gap: 10px !important;
          }
          form > div > label {
            margin-bottom: 0 !important;
          }
          form > div > input,
          form > div > select,
          form > div > textarea {
            margin-bottom: 0 !important;
            padding: 0.6rem !important;
            font-size: 1rem !important;
          }
          .image-upload-section {
            flex-direction: column;
            align-items: center;
          }
          .image-upload-section > div {
            margin-bottom: 10px;
          }
          .image-upload-section label {
            width: 60px !important;
            height: 60px !important;
            font-size: 28px !important;
          }
          .image-upload-section div div {
            font-size: 11px !important;
          }
          .admin-form-container {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </Layout>
  );
}