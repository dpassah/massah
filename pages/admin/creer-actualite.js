import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function CreerActualite() {
  const [form, setForm] = useState({
    title: '',
    details: '',
    signataire: '',
  });
  const [images, setImages] = useState([]);
  const [submitMsg, setSubmitMsg] = useState('');
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const [delegueName, setDelegueName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!loggedIn) {
        router.replace('/login');
        return;
      }

      const p = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');
      setUserRole(role || '');
      setUsername(p || '');
      if (role === 'admin') {
        setForm(f => ({ ...f, signataire: '' }));
      } else {
        supabase
          .from('comptes')
          .select('nom_delegue, province')
          .eq('username', p)
          .single()
          .then(({ data }) => {
            setDelegueName(data?.nom_delegue || p || '');
            setForm(f => ({
              ...f,
              signataire: data?.nom_delegue || p || ''
            }));
          });
      }
    }
  }, [router]);

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
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      if (file) {
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

    const { error: insertError } = await supabase.from('actualites').insert([
      {
        title: form.title,
        details: form.details,
        images: imageUrls,
        signataire: form.signataire,
      },
    ]);

    if (insertError) {
      setSubmitMsg('Erreur lors de l\'enregistrement de l\'actualité : ' + insertError.message);
      return;
    }

    setSubmitMsg('Actualité enregistrée avec succès !');
    setForm({
      title: '',
      details: '',
      signataire: form.signataire, // Keep signataire for non-admins
    });
    setImages([]);
  };

  return (
    <Layout>
      <Head>
        <title>Créer Actualité – DPASSAH</title>
      </Head>

      <div className="admin-form-container" style={{ maxWidth: 800, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center', letterSpacing: '1px' }}>Créer une nouvelle actualité</h1>
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
                      <span role="img" aria-label="image">🖼️</span>
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
                    {images[idx]?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <label style={{ fontWeight: 700, marginBottom: 4, display: 'block' }}>Signataire <span style={{ color: '#e53935' }}>*</span></label>
            {userRole === 'admin' ? (
              <input name="signataire" value={form.signataire} onChange={handleChange} required style={{ width: '60%', marginBottom: 10, background: '#fff', border: '1.5px solid #b3c0d1', borderRadius: 10, padding: '0.7rem', fontWeight: 600, color: '#143c6d', textAlign: 'center', fontSize: '1.13rem' }} />
            ) : (
              <input name="signataire" value={form.signataire} readOnly required style={{ width: '60%', marginBottom: 10, background: '#f6f8fa', border: '1.5px solid #b3c0d1', borderRadius: 10, padding: '0.7rem', fontWeight: 600, color: '#143c6d', textAlign: 'center', fontSize: '1.13rem' }} />
            )}
            <button type="submit" style={{ background: '#143c6d', color: '#fff', border: 'none', borderRadius: '10px', padding: '1rem 2.7rem', fontWeight: 700, marginTop: '1.1rem', fontSize: '1.13rem', boxShadow: '0 2px 8px rgba(20,60,109,0.09)', transition: 'background 0.2s' }}>
              Enregistrer l'actualité
            </button>
            {submitMsg && <div style={{ marginTop: 14, color: '#2e7d32', fontWeight: 600, fontSize: '1.07rem' }}>{submitMsg}</div>}
          </div>
        </form>
      </div>
      <style jsx>{`
        .admin-form-container {
          padding: 1.5rem !important;
        }
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