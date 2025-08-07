import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function CreerRapport() {
  const [titre, setTitre] = useState('');
  const [typeRapport, setTypeRapport] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const username = typeof window !== 'undefined' ? localStorage.getItem('username') : '';
  const [activeTab, setActiveTab] = useState('inondations');

  function handleImageChange(e) {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      setError('يمكنك اختيار 3 صور كحد أقصى');
      setImages([]);
      return;
    }
    setError('');
    setImages(files);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      let imageUrls = [];
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const fileExt = file.name.split('.').pop();
          const filePath = `${username}_${Date.now()}_${i}.${fileExt}`;
          let { error: uploadError } = await supabase.storage.from('rapports').upload(filePath, file);
          if (uploadError) throw uploadError;
          const { data } = supabase.storage.from('rapports').getPublicUrl(filePath);
          imageUrls.push(data.publicUrl);
        }
      }
      // جلب nom_delegue من localStorage
      const nom_delegue = typeof window !== 'undefined' ? localStorage.getItem('nom_delegue') : '';
      let { error: insertError } = await supabase.from(activeTab).insert([
        {
          username,
          signataire: nom_delegue,
          titre: titre,
          type_rapport: typeRapport,
          observations: text,
          images: imageUrls
        }
      ]);
      if (insertError) throw insertError;
      setSuccess(true);
      setTimeout(() => {
        router.push('/mes-rapports');
      }, 1200);
    } catch (err) {
      setError('خطأ أثناء إنشاء التقرير أو رفع الصور');
    }
    setCreating(false);
  }

  return (
    <Layout>
      <div style={{ maxWidth: 600, margin: '40px auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #0001', padding: '2rem' }}>
        <h2 style={{ fontWeight: 800, marginBottom: 24, color: '#143c6d' }}>Créer un nouveau rapport</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Titre du rapport :</label>
            <input
              type="text"
              value={titre}
              onChange={e => setTitre(e.target.value)}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.2px solid #b3c0d1', marginTop: 8 }}
              placeholder="Titre du rapport"
              disabled={creating}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Type de rapport :</label>
            <input
              type="text"
              value={typeRapport}
              onChange={e => setTypeRapport(e.target.value)}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1.2px solid #b3c0d1', marginTop: 8 }}
              placeholder="Type de rapport (ex: Inondations, Choléra, Aides, Autre...)"
              disabled={creating}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Contenu du rapport :</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              required
              rows={6}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1.2px solid #b3c0d1', marginTop: 8 }}
              placeholder="Écrivez le contenu du rapport ici..."
              disabled={creating}
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>إرفاق صور (حتى 3):</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              max="3"
              disabled={creating}
              style={{ display: 'block', marginTop: 8 }}
            />
            {images.length > 0 && (
              <div style={{ fontSize: 13, color: '#1976d2', marginTop: 6 }}>
                الصور المختارة: {images.map(f => f.name).join(', ')}
              </div>
            )}
          </div>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 12 }}>تم إنشاء التقرير بنجاح!</div>}
          <div style={{ display: 'flex', gap: 16 }}>
            <button type="submit" disabled={creating} style={{ background: '#388e3c', color: '#fff', border: 'none', borderRadius: 6, padding: '10px 28px', fontWeight: 700, fontSize: 18 }}>
              {creating ? '...جاري الإنشاء' : 'إنشاء التقرير'}
            </button>
            <button type="button" onClick={() => router.push('/mes-rapports')} style={{ background: '#bdbdbd', color: '#143c6d', border: 'none', borderRadius: 6, padding: '10px 18px', fontWeight: 700, fontSize: 16 }}>
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
