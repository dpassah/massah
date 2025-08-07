import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

const AIDE_TYPES = [
  { value: 'alimentaire', label: 'Aide alimentaire' },
  { value: 'financiere', label: 'Aide financière' },
  { value: 'sanitaire', label: 'Aide sanitaire' },
  { value: 'logement', label: 'Aide au logement' },
  { value: 'education', label: 'Aide à l/éducation'},
  { value: 'eau', label: 'Aide en eau' },
  { value: 'autre', label: 'Autre' }
];

const BENEF_TYPES = [
  { value: 'Réfugiés', label: 'Réfugiés' },
  { value: 'Citoyens', label: 'Citoyens' },
  { value: 'Tous', label: 'Tous' }
];

export default function AdminAides() {
  const [form, setForm] = useState({
    province: '',
    prefecture: '',
    sousPrefecture: '',
    ville: '',
    typeAide: '',
    organisme: '',
    date: '',
    nombreBeneficiaires: '',
    beneficiaires: '',
    montant: '',
    description: '',
    signataire: ''
  });
  const [submitMsg, setSubmitMsg] = useState('');
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  const [delegueName, setDelegueName] = useState('');
  const [images, setImages] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const p = localStorage.getItem('username');
      const role = localStorage.getItem('userRole');
      setUserRole(role || '');
      setUsername(p || '');
      if (role === 'admin') {
        setForm(f => ({ ...f, province: '', signataire: '' }));
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
              province: data?.province || '',
              signataire: data?.nom_delegue || p || ''
            }));
            if (!data?.province) {
              alert('تنبيه: لا يوجد ولاية مسجلة لهذا الحساب في قاعدة البيانات.');
            }
          });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImagesChange = (idx, file) => {
    const newImages = [...images];
    newImages[idx] = file;
    setImages(newImages.filter(Boolean));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Envoi en cours...');
    let imageUrls = [];
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('aides').upload(fileName, file);
        if (error) {
          setSubmitMsg('خطأ في رفع الصور: ' + error.message);
          return;
        }
        imageUrls.push(data.path);
      }
    }

    // Map form state (camelCase) to database schema (lowercase)
    const dbData = {
      province: form.province,
      prefecture: form.prefecture,
      sousprefecture: form.sousPrefecture,
      ville: form.ville,
      typeaide: form.typeAide,
      organisme: form.organisme,
      date: form.date,
      nombrebeneficiaires: form.nombreBeneficiaires,
      beneficiaires: form.beneficiaires,
      montant: form.montant || null,
      description: form.description,
      signataire: form.signataire,
      images: imageUrls
    };

    const { error: insertError } = await supabase.from('aides').insert([dbData]);
    if (insertError) {
      setSubmitMsg('Erreur lors de l\'envoi des données : ' + insertError.message);
      return;
    }
    setSubmitMsg('Aide enregistrée avec succès !');
    // Reset form after successful submission
    setForm({
        province: form.province, // Keep province for non-admins
        prefecture: '',
        sousPrefecture: '',
        ville: '',
        typeAide: '',
        organisme: '',
        date: '',
        nombreBeneficiaires: '',
        beneficiaires: '',
        montant: '',
        description: '',
        signataire: form.signataire, // Keep signataire for non-admins
    });
    setImages([]);
  };

  return (
    <Layout>
      <div className="admin-form-container" style={{maxWidth:900,margin:'2.5rem auto',background:'#fff',padding:'2.5rem',borderRadius:'20px',boxShadow:'0 4px 24px rgba(20,60,109,0.11)'}}>
        <h1 style={{fontSize:'1.6rem',color:'#143c6d',marginBottom:'1.8rem',textAlign:'center',letterSpacing:'1px'}}>Déclaration d'une aide</h1>
        <form onSubmit={handleSubmit} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'2rem 3%',alignItems:'flex-start'}}>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Province <span style={{color:'#e53935'}}>*</span></label>
            {userRole === 'admin' ? (
              <input name="province" value={form.province} onChange={handleChange} placeholder="Nom de la province..." required style={{width:'100%',marginBottom:8,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem',transition:'border 0.2s'}} />
            ) : (
              <input name="province" value={form.province} readOnly required style={{width:'100%',marginBottom:8,background:'#f6f8fa',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem'}} />
            )}
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Departement <span style={{color:'#e53935'}}>*</span></label>
            <input name="prefecture" value={form.prefecture} onChange={handleChange} placeholder="Nom du departement..." required style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Sous-préfecture</label>
            <input name="sousPrefecture" value={form.sousPrefecture} onChange={handleChange} placeholder="Nom de la sous-préfecture..." style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Ville ou village</label>
            <input name="ville" value={form.ville} onChange={handleChange} placeholder="Ville ou village..." style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Date de l'aide <span style={{color:'#e53935'}}>*</span></label>
            <input name="date" type="date" value={form.date} onChange={handleChange} required style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Type d'aide <span style={{color:'#e53935'}}>*</span></label>
            <select name="typeAide" value={form.typeAide} onChange={handleChange} required style={{width:'100%',marginBottom:8,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem'}}>
              <option value="">-- Choisir le type d'aide --</option>
              {AIDE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Organisme ayant fourni l'aide <span style={{color:'#e53935'}}>*</span></label>
            <input name="organisme" value={form.organisme} onChange={handleChange} required placeholder="Nom de l'organisme..." style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Catégorie de bénéficiaires <span style={{color:'#e53935'}}>*</span></label>
            <select name="beneficiaires" value={form.beneficiaires} onChange={handleChange} required style={{width:'100%',marginBottom:8,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem'}}>
              <option value="">-- Choisir la catégorie --</option>
              {BENEF_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Nombre de bénéficiaires <span style={{color:'#e53935'}}>*</span></label>
            <input name="nombreBeneficiaires" type="number" min="0" value={form.nombreBeneficiaires} onChange={handleChange} required placeholder="Nombre total..." style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Montant (si financier)</label>
            <input name="montant" type="number" min="0" value={form.montant} onChange={handleChange} placeholder="Montant en FCFA..." style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500}} />
          </div>

          <div style={{gridColumn:'1/-1',marginTop:10,display:'flex',flexDirection:'column',gap:10}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrire brièvement la situation..." style={{width:'100%',marginBottom:6,borderRadius:10,border:'1.5px solid #b3c0d1',padding:'0.8rem',fontWeight:500,fontSize:'1.08rem',background:'#fafdff'}} rows={3} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Joindre des photos (jusqu'à 3)</label>
            <div style={{display:'flex',gap:18,marginBottom:10}}>
              {[0,1,2].map((idx) => (
                <div key={idx} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <label htmlFor={`photo-upload-${idx}`} style={{
                    width:70,height:70,background:'#f6f8fa',border:'2px dashed #b3c0d1',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'border 0.2s',fontSize:idx===0?32:28,marginBottom:6
                  }}>
                    {images[idx] ? (
                      <span role="img" aria-label="image">🖼️</span>
                    ) : (
                      <span style={{fontSize:32,color:'#b3c0d1'}}>+</span>
                    )}
                    <input id={`photo-upload-${idx}`} type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      handleImagesChange(idx, file);
                    }} />
                  </label>
                  <div style={{fontSize:12,minHeight:18,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'center'}}>
                    {images[idx]?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{gridColumn:'1/-1',textAlign:'center',marginTop:18}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Signataire <span style={{color:'#e53935'}}>*</span></label>
            {userRole === 'admin' ? (
              <input name="signataire" value={form.signataire} onChange={handleChange} required style={{width:'60%',marginBottom:10,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,color:'#143c6d',textAlign:'center',fontSize:'1.13rem'}} />
            ) : (
              <input name="signataire" value={form.signataire} readOnly required style={{width:'60%',marginBottom:10,background:'#f6f8fa',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,color:'#143c6d',textAlign:'center',fontSize:'1.13rem'}} />
            )}
            <button type="submit" style={{background:'#143c6d',color:'#fff',border:'none',borderRadius:'10px',padding:'1rem 2.7rem',fontWeight:700,marginTop:'1.1rem',fontSize:'1.13rem',boxShadow:'0 2px 8px rgba(20,60,109,0.09)',transition:'background 0.2s'}}>
              Enregistrer
            </button>
            {submitMsg && <div style={{marginTop:14,color:'#2e7d32',fontWeight:600,fontSize:'1.07rem'}}>{submitMsg}</div>}
          </div>
        </form>
      </div>
      <style jsx>{`
        .admin-form-container {
          padding: 1.5rem !important;
        }
        @media (max-width: 768px) {
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