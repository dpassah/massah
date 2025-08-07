// pages/admin/modifier-rapport/[id].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';

/* ---------- ImageManager ---------- */
const ImageManager = ({ images = [], onImageDelete, onNewImages, storageBucket }) => {
  const handleNewImages = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImageUrls = [];
    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from(storageBucket).upload(fileName, file);
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from(storageBucket).getPublicUrl(fileName);
      newImageUrls.push(publicUrl);
    }
    onNewImages(newImageUrls);
  };

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <label>Images</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {images.map((img, i) => (
          <div key={i} style={{ position: 'relative', width: 100, height: 100 }}>
            <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            <button
              onClick={() => onImageDelete(img)}
              style={{
                position: 'absolute', top: 2, right: 2,
                background: 'rgba(0,0,0,0.6)', color: '#fff',
                border: 'none', borderRadius: '50%', width: 20, height: 20,
                cursor: 'pointer', lineHeight: '20px', textAlign: 'center', padding: 0
              }}
            >
              X
            </button>
          </div>
        ))}
        <div style={{ width: 100, height: 100, border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          <label htmlFor="new-images-upload" style={{ cursor: 'pointer', fontSize: '2rem', color: '#ccc' }}>
            +
            <input id="new-images-upload" type="file" multiple accept="image/*" onChange={handleNewImages} style={{ display: 'none' }} />
          </label>
        </div>
      </div>
    </div>
  );
};

/* ---------- Forms ---------- */
const InondationsForm = ({ form, handleChange }) => (
  <>
    <div><label>Province</label><input name="province" value={form.province || ''} readOnly style={{ background: '#eee' }} /></div>
    <div><label>Département</label><input name="prefecture" value={form.prefecture || ''} onChange={handleChange} /></div>
    <div><label>Sous-préfecture</label><input name="sousPrefecture" value={form.sousPrefecture || ''} onChange={handleChange} /></div>
    <div><label>Ville/Village</label><input name="ville" value={form.ville || ''} onChange={handleChange} /></div>
    <div><label>Date</label><input name="date" type="date" value={form.date || ''} onChange={handleChange} /></div>
    <div><label>Signataire</label><input name="signataire" value={form.signataire || ''} readOnly style={{ background: '#eee' }} /></div>
    <div><label>Personnes affectées</label><input name="nbAffectes" type="number" value={form.nbAffectes || ''} onChange={handleChange} /></div>
    <div><label>Ménages</label><input name="nbMenages" type="number" value={form.nbMenages || ''} onChange={handleChange} /></div>
    <div><label>Disparus</label><input name="nbDisparus" type="number" value={form.nbDisparus || ''} onChange={handleChange} /></div>
    <div><label>Blessés</label><input name="nbBlesses" type="number" value={form.nbBlesses || ''} onChange={handleChange} /></div>
    <div><label>Décès</label><input name="nbDeces" type="number" value={form.nbDeces || ''} onChange={handleChange} /></div>
    <div><label>Déplacés</label><input name="nbDeplaces" type="number" value={form.nbDeplaces || ''} onChange={handleChange} /></div>
    <div><label>Maisons détruites</label><input name="nbMaisonsDetruites" type="number" value={form.nbMaisonsDetruites || ''} onChange={handleChange} /></div>
    <div><label>Maisons endommagées</label><input name="nbMaisonsEndommagees" type="number" value={form.nbMaisonsEndommagees || ''} onChange={handleChange} /></div>
    <div><label>Bétail perdu</label><input name="nbBetailPerdu" type="number" value={form.nbBetailPerdu || ''} onChange={handleChange} /></div>
    <div><label>Bétail mort</label><input name="nbBetailMort" type="number" value={form.nbBetailMort || ''} onChange={handleChange} /></div>
    <div><label>Superficie inondée (ha)</label><input name="superficieInondee" value={form.superficieInondee || ''} onChange={handleChange} /></div>
    <div style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea name="description" value={form.description || ''} onChange={handleChange} rows="4"></textarea></div>
  </>
);

const CholeraForm = ({ form, handleChange }) => (
  <>
    <div><label>Province</label><input name="province" value={form.province || ''} readOnly style={{ background: '#eee' }} /></div>
    <div><label>Département</label><input name="prefecture" value={form.prefecture || ''} onChange={handleChange} /></div>
    <div><label>Sous-préfecture</label><input name="sousprefecture" value={form.sousprefecture || ''} onChange={handleChange} /></div>
    <div><label>Ville/Village</label><input name="ville" value={form.ville || ''} onChange={handleChange} /></div>
    <div><label>Date</label><input name="date" type="date" value={form.date || ''} onChange={handleChange} /></div>
    <div><label>Signataire</label><input name="signataire" value={form.signataire || ''} readOnly style={{ background: '#eee' }} /></div>
    <div><label>Cas</label><input name="nbcas" type="number" value={form.nbcas || ''} onChange={handleChange} /></div>
    <div><label>Décès</label><input name="nbdeces" type="number" value={form.nbdeces || ''} onChange={handleChange} /></div>
    <div><label>Guéris</label><input name="nbgueris" type="number" value={form.nbgueris || ''} onChange={handleChange} /></div>
    <div><label>Hospitalisés</label><input name="nbhospitalises" type="number" value={form.nbhospitalises || ''} onChange={handleChange} /></div>
    <div><label>Vaccinés</label><input name="nbvaccines" type="number" value={form.nbvaccines || ''} onChange={handleChange} /></div>
    <div><label>Sorties</label><input name="sorties" type="number" value={form.sorties || ''} onChange={handleChange} /></div>
    <div><label>Patients au lit</label><input name="patientsaulit" type="number" value={form.patientsaulit || ''} onChange={handleChange} /></div>
    <div><label>Décès communautaire</label><input name="decescommunautaire" type="number" value={form.decescommunautaire || ''} onChange={handleChange} /></div>
    <div style={{ gridColumn: '1 / -1' }}><label>Description</label><textarea name="description" value={form.description || ''} onChange={handleChange} rows="4"></textarea></div>
  </>
);

const AidesForm = ({ form, handleChange }) => (
  <>
    <div><label>Province</label><input name="province" value={form.province || ''} readOnly style={{ background: '#eee' }} /></div>
    <div><label>Département</label><input name="prefecture" value={form.prefecture || ''} onChange={handleChange} /></div>
    <div><label>Ville/Village</label><input name="ville" value={form.ville || ''} onChange={handleChange} /></div>
    <div><label>Date</label><input name="date" type="date" value={form.date || ''} onChange={handleChange} /></div>
    <div><label>Signataire</label><input name="signataire" value={form.signataire || ''} readOnly style={{ background: '#eee' }} /></div>
    <div><label>Type d'aide</label><input name="typeaide" value={form.typeaide || ''} onChange={handleChange} /></div>
    <div><label>Organisme</label><input name="organisme" value={form.organisme || ''} onChange={handleChange} /></div>
    <div><label>Nombre de bénéficiaires</label><input name="nombrebeneficiaires" type="number" value={form.nombrebeneficiaires || ''} onChange={handleChange} /></div>
    <div><label>Bénéficiaires</label><input name="beneficiaires" value={form.beneficiaires || ''} onChange={handleChange} /></div>
    <div><label>Montant</label><input name="montant" type="number" value={form.montant || ''} onChange={handleChange} /></div>
    <div style={{ gridColumn: '1 / -1' }}><label>Observations</label><textarea name="observations" value={form.observations || ''} onChange={handleChange} rows="4"></textarea></div>
  </>
);

/* ---------- Page ---------- */
export default function ModifierRapport() {
  const router = useRouter();
  const { id, type } = router.query;
  const [form, setForm] = useState(null);
  const [initialForm, setInitialForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitMsg, setSubmitMsg] = useState('');

  useEffect(() => {
    if (!id || !type) return;
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase.from(type).select('*').eq('id', id).single();
      if (error) {
        console.error(error);
        setSubmitMsg('Rapport non trouvé.');
        setForm(null);
      } else {
        setForm(data);
        setInitialForm(data);
      }
      setLoading(false);
    };
    fetch();
  }, [id, type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageDelete = (url) =>
    setForm(prev => ({ ...prev, images: prev.images.filter(u => u !== url) }));
  const handleNewImages = (urls) =>
    setForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Mise à jour...');

    const initialImages = initialForm.images || [];
    const currentImages = form.images || [];
    const toDelete = initialImages.filter(u => !currentImages.includes(u));
    if (toDelete.length) {
      const paths = toDelete.map(u => u.split(`/${type}/`)[1]).filter(Boolean);
      if (paths.length) await supabase.storage.from(type).remove(paths);
    }

    const { created_at, id: fid, ...update } = form;
    const { error } = await supabase.from(type).update(update).eq('id', id);
    if (error) {
      setSubmitMsg(`Erreur: ${error.message}`);
    } else {
      setSubmitMsg('Succès !');
      setTimeout(() => router.push('/mes-rapports'), 1500);
    }
  };

  if (loading) return <Layout><div>Chargement...</div></Layout>;
  if (!form) return <Layout><div>Rapport introuvable.</div></Layout>;

  return (
    <Layout>
      <div style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#143c6d' }}>Modifier {type} #{id}</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {type === 'inondations' && <InondationsForm form={form} handleChange={handleChange} />}
          {type === 'cholera' && <CholeraForm form={form} handleChange={handleChange} />}
          {type === 'aides' && <AidesForm form={form} handleChange={handleChange} />}

          <ImageManager
            images={form.images}
            onImageDelete={handleImageDelete}
            onNewImages={handleNewImages}
            storageBucket={type}
          />

          <div style={{ gridColumn: '1 / -1', textAlign: 'center', marginTop: '1rem' }}>
            <button type="submit" style={{ padding: '0.8rem 2rem', background: '#143c6d', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
              Mettre à jour
            </button>
            {submitMsg && <p style={{ marginTop: '1rem', color: submitMsg.startsWith('Erreur') ? 'red' : 'green' }}>{submitMsg}</p>}
          </div>
        </form>
      </div>
    </Layout>
  );
}