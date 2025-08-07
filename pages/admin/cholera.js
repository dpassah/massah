import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { supabase } from '../../lib/supabaseClient';

const PROVINCES = [
  'BATHA', 'BAHR EL GAZEL', 'BOURKOUMI', 'CHARI BAGUIRMI', 'GUERA', 'HADJER LAMIS', 'KANEM',
  'LAC', 'LAGONE ORIENTAL', 'LAGONE OCCIDENTAL', 'MANDOUL', 'MAYO KEBBI EST', 'MAYO KEBBI OUEST',
  'MAYO KEBBI', 'MOYEN CHARI', 'NDJAMENA', 'OUADDAI', 'SALAMAT', 'SIILA', 'TANDJILE',
  'TIBESTI', 'WADI FIRA', 'ENNEDI'
];

export default function AdminCholera() {
  const [form, setForm] = useState({
    province: '',
    prefecture: '',
    sousprefecture: '',
    ville: '',
    nbcas: '', 
    nbdeces: '', 
    nbgueris: '', 
    nbhospitalises: '', 
    nbvaccines: '',
    description: '',
    date: '',
    signataire: '',
    category: '',
    sorties: '',
    patientsaulit: '',
    decescommunautaire: '',
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
              alert('Avertissement : Aucune province enregistrée pour ce compte dans la base de données.');
            }
          });
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 3) {
      alert('Vous pouvez téléverser jusqu’à 3 images maximum.');
      return;
    }
    setImages(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMsg('Envoi en cours...');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitMsg('Erreur: Utilisateur non authentifié. Veuillez vous reconnecter.');
      return;
    }

    let imageUrls = [];
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { data, error } = await supabase.storage.from('cholera').upload(fileName, file); 
        if (error) {
          setSubmitMsg('Erreur lors du téléversement des images : ' + error.message);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('cholera').getPublicUrl(fileName); 
        imageUrls.push(publicUrl);
      }
    }

    const { category, ...formData } = form;
    const dbData = { 
      ...formData, 
      images: imageUrls,
      created_by_user_id: user.id
    };

    const { error: insertError } = await supabase.from('cholera').insert([dbData]); 
    if (insertError) {
      setSubmitMsg('Erreur lors de l\'envoi des données : ' + insertError.message);
      return;
    }

    setSubmitMsg('Données soumises avec succès !');
  };

  return (
    <Layout>
      <div className="admin-form-container" style={{maxWidth:800,margin:'2.5rem auto',background:'#fff',padding:'2.5rem',borderRadius:'20px',boxShadow:'0 4px 24px rgba(20,60,109,0.11)'}}>
        <h1 style={{fontSize:'1.6rem',color:'#143c6d',marginBottom:'1.8rem',textAlign:'center',letterSpacing:'1px'}}>Déclaration d'un cas de choléra</h1> 
        <form onSubmit={handleSubmit} style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:'2rem 3%',alignItems:'flex-start'}}>
          {/* Section principale */}
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Province <span style={{color:'#e53935'}}>*</span></label>
            {userRole === 'admin' ? (
              <select name="province" value={form.province} onChange={handleChange} required style={{width:'100%',marginBottom:8,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem',transition:'border 0.2s'}}>
                <option value="">-- Choisir une province --</option>
                {PROVINCES.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            ) : (
              <input name="province" value={form.province} readOnly required style={{width:'100%',marginBottom:8,background:'#f6f8fa',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem'}} />
            )}
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Catégorie <span style={{color:'#e53935'}}>*</span></label>
            <select name="category" value={form.category || ''} onChange={handleChange} required style={{width:'100%',marginBottom:8,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,fontSize:'1.08rem'}}>
              <option value="">-- Choisir la catégorie --</option>
              <option value="Réfugiés">Réfugiés</option>
              <option value="Citoyens">Citoyens</option>
            </select>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Département <span style={{color:'#e53935'}}>*</span></label>
            <input name="prefecture" value={form.prefecture} onChange={handleChange} placeholder="Nom du département..." required style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Sous-préfecture <span style={{color:'#e53935'}}>*</span></label>
            <input name="sousprefecture" value={form.sousprefecture} onChange={handleChange} placeholder="Nom de la sous-préfecture..." required style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Ville ou village <span style={{color:'#e53935'}}>*</span></label>
            <input name="ville" value={form.ville} onChange={handleChange} placeholder="Ville ou village..." required style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Date du cas <span style={{color:'#e53935'}}>*</span></label> 
            <input name="date" type="date" value={form.date} onChange={handleChange} required style={{width:'100%',marginBottom:8,background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:500,fontSize:'1.08rem'}} />
          </div>

          {/* Section numérique */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1.2rem 2%'}}>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>Cas suspects <span style={{color:'#e53935'}}>*</span></label> 
              <input name="nbcas" type="number" min="0" value={form.nbcas} onChange={handleChange} placeholder="Nombre de cas suspects" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>⚰️ Décès <span style={{color:'#e53935'}}>*</span></label> 
              <input name="nbdeces" type="number" min="0" value={form.nbdeces} onChange={handleChange} placeholder="Nombre de décès" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>💪 Guéris <span style={{color:'#e53935'}}>*</span></label> 
              <input name="nbgueris" type="number" min="0" value={form.nbgueris} onChange={handleChange} placeholder="Nombre de guéris" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>🏥 Lits disponibles <span style={{color:'#e53939'}}>*</span></label> 
              <input name="nbhospitalises" type="number" min="0" value={form.nbhospitalises} onChange={handleChange} placeholder="Lits disponibles" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>💉 Vaccinés <span style={{color:'#e53935'}}>*</span></label> 
              <input name="nbvaccines" type="number" min="0" value={form.nbvaccines} onChange={handleChange} placeholder="Nombre de vaccinés" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>🚶‍♂️ Sorties <span style={{color:'#e53935'}}>*</span></label> 
              <input name="sorties" type="number" min="0" value={form.sorties} onChange={handleChange} placeholder="Nombre de sorties" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>🛌 Patients au lit <span style={{color:'#e53935'}}>*</span></label> 
              <input name="patientsaulit" type="number" min="0" value={form.patientsaulit} onChange={handleChange} placeholder="Patients au lit" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <label style={{fontWeight:600,marginBottom:2}}>🚑 Décès communautaire <span style={{color:'#e53935'}}>*</span></label> 
              <input name="decescommunautaire" type="number" min="0" value={form.decescommunautaire} onChange={handleChange} placeholder="Décès communautaire" required style={{background:'#fafdff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.6rem',fontWeight:500}} />
            </div>
          </div>

          {/* Description et images */}
          <div style={{gridColumn:'1/-1',marginTop:10,display:'flex',flexDirection:'column',gap:10}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Description <span style={{color:'#e53935'}}>*</span></label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Décrire brièvement la situation..." style={{width:'100%',marginBottom:6,borderRadius:10,border:'1.5px solid #b3c0d1',padding:'0.8rem',fontWeight:500,fontSize:'1.08rem',background:'#fafdff'}} rows={3} required />
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Joindre des photos (jusqu\'à 3)</label>
            <div className="image-upload-section" style={{display:'flex',gap:18,marginBottom:10}}>
              {[0,1,2].map((idx) => (
                <div key={idx} style={{display:'flex',flexDirection:'column',alignItems:'center'}}>
                  <label htmlFor={`photo-upload-${idx}`} style={{
                    width:70,height:70,background:'#f6f8fa',border:'2px dashed #b3c0d1',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'border 0.2s',fontSize:idx===0?32:28,marginBottom:6
                  }}>
                    {images[idx] ? (
                      <span role="img" aria-label="image">صورة</span>
                    ) : (
                      <span style={{fontSize:32,color:'#b3c0d1'}}>+</span>
                    )}
                    <input id={`photo-upload-${idx}`} type="file" accept="image/*" style={{display:'none'}} onChange={e => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const newImages = [...images];
                      newImages[idx] = file;
                      setImages(newImages.filter(Boolean));
                    }} />
                  </label>
                  <div style={{fontSize:12,minHeight:18,maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'center'}}>
                    {images[idx]?.name || ''}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature et soumission */}
          <div style={{gridColumn:'1/-1',textAlign:'center',marginTop:18}}>
            <label style={{fontWeight:700,marginBottom:4,display:'block'}}>Signataire <span style={{color:'#e53935'}}>*</span></label>
            {userRole === 'admin' ? (
              <input name="signataire" value={form.signataire} onChange={handleChange} required style={{width:'60%',marginBottom:10,background:'#fff',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,color:'#143c6d',textAlign:'center',fontSize:'1.13rem'}} />
            ) : (
              <input name="signataire" value={form.signataire} readOnly required style={{width:'60%',marginBottom:10,background:'#f6f8fa',border:'1.5px solid #b3c0d1',borderRadius:10,padding:'0.7rem',fontWeight:600,color:'#143c6d',textAlign:'center',fontSize:'1.13rem'}} />
            )}
            <button type="submit" style={{background:'#143c6d',color:'#fff',border:'none',borderRadius:'10px',padding:'1rem 2.7rem',fontWeight:700,marginTop:'1.1rem',fontSize:'1.13rem',boxShadow:'0 2px 8px rgba(20,60,109,0.09)',transition:'background 0.2s'}}>
              Soumettre
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
          .admin-form-container {
            padding: 1rem !important;
          }
          h1 {
            font-size: 1.4rem !important;
            margin-bottom: 1.5rem !important;
          }
          @media (max-width: 768px) {
          .admin-form-container {
            padding: 1rem !important;
          }
          h1 {
            font-size: 1.4rem !important;
            margin-bottom: 1.5rem !important;
          }
          form {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          form > div {
            gap: 8px !important;
          }
          form > div > label {
            margin-bottom: 0 !important;
            font-size: 0.9rem !important;
          }
          form > div > input,
          form > div > select,
          form > div > textarea {
            margin-bottom: 0 !important;
            padding: 0.5rem !important;
            font-size: 0.95rem !important;
          }
          .image-upload-section {
            flex-direction: row;
            justify-content: center;
            gap: 10px !important;
            margin-bottom: 0 !important;
          }
          .image-upload-section > div {
            margin-bottom: 0px;
          }
          .image-upload-section label {
            width: 50px !important;
            height: 50px !important;
            font-size: 24px !important;
          }
          .image-upload-section div div {
            font-size: 10px !important;
          }
          button[type="submit"] {
            padding: 0.8rem 2rem !important;
            font-size: 1rem !important;
            margin-top: 1rem !important;
          }
          div[style*="marginTop:14"] {
            font-size: 0.95rem !important;
          }
        }
          button[type="submit"] {
            padding: 0.8rem 2rem !important;
            font-size: 1rem !important;
            margin-top: 1rem !important;
          }
          div[style*="marginTop:14"] {
            font-size: 0.95rem !important;
          }
        }
      `}</style>
    </Layout>
  );
}