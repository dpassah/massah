import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function ModifierActualite() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    title: '',
    details: '',
  });
  const [images, setImages] = useState([]);
  const [submitMsg, setSubmitMsg] = useState('');
  const [loading, setLoading] = useState(true);

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
      if (data.images && Array.isArray(data.images)) {
        setImages(data.images);
      }
    }
    setLoading(false);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (idx, file) => {
    const newImages = [...images];
    newImages[idx] = file;
    setImages(newImages.filter(Boolean));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Envoi en cours...');

    let imageUrls = [];
    const existingImageUrls = images.filter(img => typeof img === 'string');
    imageUrls.push(...existingImageUrls);

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      if (typeof file !== 'string') {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('actualites').upload(fileName, file);
        if (error) {
          setSubmitMsg('Erreur lors du téléchargement de l\'image : ' + error.message);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('actualites').getPublicUrl(fileName);
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

      <div style={{ maxWidth: 800, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center', letterSpacing: '1px' }}>Modifier l'actualité</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Titre de l'actualité <span style={{ color: '#e53935' }}>*</span></label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Titre de l'actualité..." required style={{ width: '100%', marginBottom: 8, background: '#fafdff', border: '1.5px solid #b3c0d1', borderRadius: 10, padding: '0.7rem', fontWeight: 500, fontSize: '1.08rem' }} />

            <label style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Détails de l'actualité <span style={{ color: '#e53935' }}>*</span></label>
            <textarea name="details" value={form.details} onChange={handleChange} placeholder="Décrivez les détails de l'actualité..." required style={{ width: '100%', marginBottom: 6, borderRadius: 10, border: '1.5px solid #b3c0d1', padding: '0.8rem', fontWeight: 500, fontSize: '1.08rem', background: '#fafdff' }} rows={5} />

            <label style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Joindre des photos (jusqu'à 3)</label>
            <div style={{ display: 'flex', gap: 18, marginBottom: 10, flexWrap: 'wrap' }}>
              {[0, 1, 2].map((idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label htmlFor={`photo-upload-${idx}`} style={{
                    width: 70, height: 70, background: '#f6f8fa', border: '2px dashed #b3c0d1', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border 0.2s', fontSize: idx === 0 ? 32 : 28, marginBottom: 6
                  }}>
                    {images[idx] ? (
                      typeof images[idx] === 'string' ? (
                        <img src={images[idx]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                      ) : (
                        <span role="img" aria-label="image">🖼️</span>
                      )
                    ) : (
                      <span style={{ fontSize: 32, color: '#b3c0d1' }}>+</span>
                    )}
                    <input id={`photo-upload-${idx}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      handleImageChange(idx, file);
                    }} />
                  </label>
                  <div style={{ fontSize: 12, minHeight: 18, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {typeof images[idx] === 'string' ? images[idx].split('/').pop() : images[idx]?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <button type="submit" style={{ background: '#143c6d', color: '#fff', border: 'none', borderRadius: '10px', padding: '1rem 2.7rem', fontWeight: 700, fontSize: '1.13rem', boxShadow: '0 2px 8px rgba(20,60,109,0.09)', transition: 'background 0.2s' }}>
              Mettre à jour l'actualité
            </button>
            {submitMsg && <div style={{ marginTop: 14, color: '#2e7d32', fontWeight: 600, fontSize: '1.07rem' }}>{submitMsg}</div>}
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
        }
      `}</style>
    </Layout>
  );
}
