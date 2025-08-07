import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';
import Head from 'next/head';

const AID_TYPES = [
  { value: 'nourriture', label: 'Aide alimentaire' },
  { value: 'medicale', label: 'Aide médicale' },
  { value: 'abris', label: 'Abris / Logement' },
  { value: 'eau', label: 'Eau et assainissement' },
  { value: 'autre', label: 'Autre' }
];

const WORK_TYPES = [
  { value: 'toussensibilisation', label: 'Touche de sensibilisation' },
  { value: 'mise_en_oeuvre', label: 'Mise en uvre' },
  { value: 'suivi', label: 'Suivi' },
  { value: 'evaluation', label: 'Évaluation' }
];

export default function AffairesHumanitairesAdmin() {
  const [form, setForm] = useState({
    province: '',
    prefecture: '',
    ville: '',
    date_intervention: '',
    type_aide: '',
    beneficiaires_hommes: '',
    beneficiaires_femmes: '',
    beneficiary_type: '',
    organization_name: '', // New field
    project_name: '',      // New field
    work_type: '',         // New field
    description: '',
    signataire: '', // UUID
    images: []
  });
  const [submitMsg, setSubmitMsg] = useState('');
  const [userRole, setUserRole] = useState('');
  const [nomDelegue, setNomDelegue] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole');
      const username = localStorage.getItem('username');
      setUserRole(role || '');

      supabase.auth.getUser().then(({ data }) => {
        const user = data?.user;
        if (!user) return;

        setForm(f => ({ ...f, signataire: user.id }));
        const fullName = user.user_metadata?.nom_delegue || user.user_metadata?.full_name || username || '';
        setNomDelegue(fullName);
      });

      if (role !== 'admin') {
        supabase
          .from('comptes')
          .select('province')
          .eq('username', username)
          .single()
          .then(({ data }) => {
            setForm(f => ({ ...f, province: data?.province || '' }));
          });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (idx, file) => {
    const newImages = [...images];
    newImages[idx] = file;
    setImages(newImages.filter(Boolean));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Envoi en cours...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitMsg('Erreur: Utilisateur non authentifié.');
      return;
    }

    let imageUrls = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      if (!file) continue;
      const fileExt = file.name.split('.').pop();
      const fileName = `affaires-humanitaires/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage.from('images').upload(fileName, file);
      if (error) {
        setSubmitMsg('Erreur upload image: ' + error.message);
        return;
      }
      const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName);
      imageUrls.push(publicUrl);
    }

    const payload = {
      province: form.province,
      prefecture: form.prefecture,
      ville: form.ville,
      date_intervention: form.date_intervention,
      type_aide: form.type_aide,
      beneficiaires_hommes: parseInt(form.beneficiaires_hommes) || 0,
      beneficiaires_femmes: parseInt(form.beneficiaires_femmes) || 0,
      beneficiary_type: form.beneficiary_type,
      organization_name: form.organization_name, // Added to payload
      project_name: form.project_name,          // Added to payload
      work_type: form.work_type,                // Added to payload
      description: form.description,
      signataire: user.id,
      images: imageUrls
    };

    const { error: insertError } = await supabase.from('affaires_humanitaires').insert([payload]);
    if (insertError) {
      setSubmitMsg('Erreur (enregistrement): ' + insertError.message);
      return;
    }

    setSubmitMsg('Action humanitaire enregistrée avec succès !');
    setImages([]);
  };

  return (
    <Layout>
      <Head>
        <title>Saisie Affaires Humanitaires</title>
      </Head>
      <div style={{ maxWidth: 900, margin: '2.5rem auto', background: '#fff', padding: '2.5rem', borderRadius: 20, boxShadow: '0 4px 24px rgba(20,60,109,0.11)' }}>
        <h1 style={{ fontSize: '1.6rem', color: '#143c6d', marginBottom: '1.8rem', textAlign: 'center' }}>
          Enregistrer une Action Humanitaire
        </h1>

        <form onSubmit={handleSubmit} className="dynamic-form">
          <div className="form-grid">
            <div className="form-field">
              <label>Province</label>
              <input name="province" value={form.province} onChange={handleChange} readOnly={userRole !== 'admin'} required />
            </div>
            <div className="form-field">
              <label>Département</label>
              <input name="prefecture" value={form.prefecture} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Ville / Village</label>
              <input name="ville" value={form.ville} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Date d'intervention</label>
              <input name="date_intervention" type="date" value={form.date_intervention} onChange={handleChange} required />
            </div>
            <div className="form-field">
              <label>Type d'aide</label>
              <select name="type_aide" value={form.type_aide} onChange={handleChange} required>
                <option value="">-- Choisir un type --</option>
                {AID_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Bénéficiaires Hommes</label>
              <input name="beneficiaires_hommes" type="number" min="0" value={form.beneficiaires_hommes} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Bénéficiaires Femmes</label>
              <input name="beneficiaires_femmes" type="number" min="0" value={form.beneficiaires_femmes} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Type de Bénéficiaires</label>
              <select name="beneficiary_type" value={form.beneficiary_type} onChange={handleChange} required>
                <option value="">-- Choisir un type --</option>
                <option value="refugies">Réfugiés</option>
                <option value="citoyens">Citoyens</option>
                <option value="rapatries">Rapatriés</option>
              </select>
            </div>
            <div className="form-field">
              <label>Nom de l'Organisation / Donateur</label>
              <input name="organization_name" value={form.organization_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Nom du Projet</label>
              <input name="project_name" value={form.project_name} onChange={handleChange} />
            </div>
            <div className="form-field">
              <label>Type de Travail</label>
              <select name="work_type" value={form.work_type} onChange={handleChange} required>
                <option value="">-- Choisir un type --</option>
                {WORK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field-full">
            <label>Description détaillée</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
          </div>

          <div className="form-field-full">
            <label>Joindre des photos (jusqu'à 3)</label>
            <div style={{ display: 'flex', gap: 18 }}>
              {[0, 1, 2].map(idx => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <label htmlFor={`photo-upload-${idx}`} style={{
                    width: 70, height: 70, background: '#f6f8fa', border: '2px dashed #b3c0d1',
                    borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', fontSize: 32, marginBottom: 4
                  }}>
                    {images[idx] ? '🖼️' : '+'}
                    <input id={`photo-upload-${idx}`} type="file" accept="image/*" style={{ display: 'none' }}
                           onChange={e => handleImageChange(idx, e.target.files?.[0])} />
                  </label>
                  <div style={{ fontSize: 12, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {images[idx]?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: 20 }}>
            <label style={{ fontWeight: 700, display: 'block', marginBottom: 4 }}>Signataire</label>
            <input
              name="signataireDisplay"
              value={nomDelegue}
              readOnly
              style={{ width: '60%', marginBottom: 10, background: '#f6f8fa', border: '1.5px solid #b3c0d1', borderRadius: 10, padding: '0.7rem', fontWeight: 600, textAlign: 'center' }}
            />
            <button type="submit" style={{ background: '#143c6d', color: '#fff', border: 'none', borderRadius: 10, padding: '1rem 2.7rem', fontWeight: 700, fontSize: '1.13rem' }}>
              Enregistrer l'Action Humanitaire
            </button>
            {submitMsg && <div style={{ marginTop: 14, color: submitMsg.includes('Erreur') ? '#e53935' : '#2e7d32', fontWeight: 600 }}>{submitMsg}</div>}
          </div>
        </form>
      </div>

      <style jsx>{`
        .dynamic-form .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem 3%;
        }
        .dynamic-form .form-field,
        .dynamic-form .form-field-full {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .dynamic-form .form-field-full {
          grid-column: 1 / -1;
        }
        .dynamic-form label {
          font-weight: 600;
          color: #333;
        }
        .dynamic-form input,
        .dynamic-form select,
        .dynamic-form textarea {
          width: 100%;
          padding: 0.7rem;
          border: 1.5px solid #b3c0d1;
          border-radius: 10px;
          font-weight: 500;
          font-size: 1.08rem;
          background: #fafdff;
        }
        .dynamic-form input[readonly] {
          background: #f6f8fa;
        }
      `}</style>
    </Layout>
  );
}
