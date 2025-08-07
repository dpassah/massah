import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import { supabase } from '../../../lib/supabaseClient';
import ImageManager from '../../../components/ImageManager'; // Import the new ImageManager

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
        // Ensure images array has 3 elements, filling with null if less
        const imagesArray = data.images ? [...data.images] : [];
        while (imagesArray.length < 3) {
          imagesArray.push(null);
        }
        setForm({ ...data, images: imagesArray });
        setInitialForm({ ...data, images: imagesArray });
      }
      setLoading(false);
    };
    fetch();
  }, [id, type]);

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
    setSubmitMsg('Mise à jour...');

    const initialImages = initialForm.images.filter(Boolean); // Filter out nulls
    const currentImages = form.images.filter(Boolean); // Filter out nulls

    // Determine images to delete from storage
    const toDelete = initialImages.filter(url => !currentImages.includes(url));
    if (toDelete.length > 0) {
      const pathsToDelete = toDelete.map(url => {
        const parts = url.split('/');
        return `${type}/${parts[parts.length - 1]}`;
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
        const fileName = `${type}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('images').upload(fileName, img);
        if (error) {
          setSubmitMsg(`Erreur lors du téléchargement de l\'image : ${error.message}`);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
        imageUrls.push(publicUrl);
      }
    }

    const { created_at, id: fid, ...update } = form;
    const { error } = await supabase.from(type).update({ ...update, images: imageUrls }).eq('id', id);
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
      <div className="admin-form-container" style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
        <h1 style={{ textAlign: 'center', color: '#143c6d' }}>Modifier {type} #{id}</h1>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {type === 'inondations' && <InondationsForm form={form} handleChange={handleChange} />}
          {type === 'cholera' && <CholeraForm form={form} handleChange={handleChange} />}
          {type === 'aides' && <AidesForm form={form} handleChange={handleChange} />}

          <ImageManager
            images={form.images}
            onImageChange={handleImageChange}
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
      <style jsx>{`
        @media (max-width: 768px) {
          .admin-form-container {
            padding: 1.5rem !important;
          }
          form {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
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