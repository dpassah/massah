// pages/mes-rapports.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

const TABS = [
  {
    key: 'inondations',
    label: 'Inondations',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Departement' },
      { key: 'sousPrefecture', label: 'Sous-prefecture' },
      { key: 'ville', label: 'Ville' },
      { key: 'nbAffectes', label: 'Personnes affectées' },
      { key: 'nbMenages', label: 'Ménages' },
      { key: 'nbDisparus', label: 'Disparus' },
      { key: 'nbBlesses', label: 'Blessés' },
      { key: 'nbDeces', label: 'Décès' },
      { key: 'nbDeplaces', label: 'Déplacés' },
      { key: 'nbMaisonsDetruites', label: 'Maisons détruites' },
      { key: 'nbMaisonsEndommagees', label: 'Maisons endommagées' },
      { key: 'nbBetailPerdu', label: 'Bétail perdu' },
      { key: 'nbBetailMort', label: 'Bétail mort' },
      { key: 'superficieInondee', label: 'Superficie inondée' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'images', label: 'Images', type: 'images' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' },
      { key: 'description', label: 'Description' },
    ]
  },
  {
    key: 'cholera',
    label: 'Choléra',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Département' },
      { key: 'sousprefecture', label: 'Sous-préfecture' },
      { key: 'ville', label: 'Ville' },
      { key: 'nbcas', label: 'Cas', type: 'number' },
      { key: 'nbdeces', label: 'Décès', type: 'number' },
      { key: 'nbgueris', label: 'Guéris', type: 'number' },
      { key: 'nbhospitalises', label: 'Hospitalisés', type: 'number' },
      { key: 'nbvaccines', label: 'Vaccinés', type: 'number' },
      { key: 'sorties', label: 'Sorties', type: 'number' },
      { key: 'patientsaulit', label: 'Patients au lit', type: 'number' },
      { key: 'decescommunautaire', label: 'Décès communautaire', type: 'number' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'description', label: 'Description' },
      { key: 'category', label: 'Catégorie' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' },
      { key: 'images', label: 'Images', type: 'images' }
    ]
  },
  {
    key: 'aides',
    label: 'Aides',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Departement' },
      { key: 'ville', label: 'Ville' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'observations', label: 'Observations' },
      { key: 'images', label: 'Images', type: 'images' }
    ]
  },
  {
    key: 'actualites',
    label: 'Actualités',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Titre' },
      { key: 'details', label: 'Détails' },
      { key: 'images', label: 'Images', type: 'images' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' },
    ]
  },
  {
    key: 'action_sociale',
    label: 'Action Sociale',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Département' },
      { key: 'sous_prefecture', label: 'Sous-préfecture' },
      { key: 'ville', label: 'Ville' },
      { key: 'date_action', label: 'Date Action', type: 'date' },
      { key: 'type_action', label: 'Type Action' },
      { key: 'themes_abordes', label: 'Thèmes Abordés' },
      { key: 'nombre_participants_hommes', label: 'Hommes', type: 'number' },
      { key: 'nombre_participants_femmes', label: 'Femmes', type: 'number' },
      { key: 'description', label: 'Description' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'images', label: 'Images', type: 'images' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' }
    ]
  },
  {
    key: 'affaires_humanitaires',
    label: 'Affaires Humanitaires',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Département' },
      { key: 'ville', label: 'Ville' },
      { key: 'date_intervention', label: 'Date Intervention', type: 'date' },
      { key: 'type_aide', label: 'Type d\'aide' },
      { key: 'beneficiaires_hommes', label: 'Bénéficiaires Hommes', type: 'number' },
      { key: 'beneficiaires_femmes', label: 'Bénéficiaires Femmes', type: 'number' },
      { key: 'beneficiary_type', label: 'Type de Bénéficiaires' },
      { key: 'organization_name', label: 'Organisation' },
      { key: 'project_name', label: 'Nom du Projet' },
      { key: 'work_type', label: 'Type de Travail' },
      { key: 'description', label: 'Description' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'images', label: 'Images', type: 'images' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' }
    ]
  },
]

export default function MesRapports() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('inondations');
  const [user, setUser] = useState('');
  const [nomDelegue, setNomDelegue] = useState('');
  const [userrole, setUserrole] = useState('');
  const [mounted, setMounted] = useState(false);
  const [expanded, setExpanded] = useState({});
  const router = useRouter();

  useEffect(() => {
    const u = localStorage.getItem('username') || '';
    const nd = localStorage.getItem('nom_delegue') || '';
    const ur = localStorage.getItem('userrole') || 'delegue';
    setUser(u);
    setNomDelegue(nd);
    setUserrole(ur);
    setMounted(true);

    const handleStorageChange = () => {
      const newNomDelegue = localStorage.getItem('nom_delegue') || '';
      if (newNomDelegue !== nomDelegue) {
        setNomDelegue(newNomDelegue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [nomDelegue]);

  useEffect(() => {
    if (!mounted) return;
    fetchData();
  }, [active, user, nomDelegue, userrole, mounted]);


  async function fetchData() {
    setLoading(true);
    console.log('[DEBUG] fetchData params:', { user, nomDelegue, userrole, active });

    let query = supabase
      .from(active)
      .select('*')
      .order('created_at', { ascending: false });

    if (userrole === 'delegue') {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setRows([]);
        setLoading(false);
        return;
      }

      // استخدم العمود المناسب لكل جدول
      switch (active) {
        case 'inondations':
          query = query.eq('created_by_user_id', authUser.id);
          break;
        default:
          query = query.eq('signataire', authUser.id);
          break;
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('[DEBUG] Error fetching data:', error);
    } else {
      console.log('[DEBUG] Fetched data for', active, ':', data);
    }
    setRows(data || []);
    setLoading(false);
  }

  function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('fr-FR') : '';
  }
  function formatDateTime(d) {
    return d ? new Date(d).toLocaleString('fr-FR') : '';
  }

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEdit = (id) => {
    if (active === 'actualites') {
      router.push(`/admin/modifier-actualite/${id}`);
    } else if (active === 'action_sociale') {
      router.push(`/admin/modifier-action-sociale/${id}`);
    } else if (active === 'affaires_humanitaires') { // Added for Affaires Humanitaires
      router.push(`/admin/modifier-affaire-humanitaire/${id}`);
    } else {
      router.push(`/admin/modifier-rapport/${id}?type=${active}`);
    }
  };

  const currentTab = TABS.find(t => t.key === active);

  const renderCellContent = (c, r) => {
    const cellValue = r[c.key];

    if (c.key === 'description' || c.key === 'details') {
      const text = cellValue ?? '';
      const isLong = text.length > 100;
      const isExpanded = expanded[r.id];
      return (
        <div>
          {isLong && !isExpanded ? `${text.substring(0, 100)}...` : text}
          {isLong && (
            <button 
              onClick={() => toggleExpand(r.id)} 
              style={{ 
                marginLeft: 8, 
                border: 'none', 
                background: 'none', 
                color: '#143c6d', 
                cursor: 'pointer', 
                textDecoration: 'underline', 
                fontWeight: 'bold',
                padding: '2px 0'
              }}
            >
              {isExpanded ? 'Voir moins' : 'Voir plus'}
            </button>
          )}
        </div>
      );
    }

    if (c.key === 'images' && Array.isArray(cellValue) && cellValue.length > 0) {
      return (
        <div style={{ display: 'flex', gap: 4 }}>
          {cellValue.map((img, i) => (
            <a key={i} href={img} target="_blank" rel="noopener noreferrer">
              <img
                src={img}
                alt=""
                style={{
                  width: 40,
                  height: 40,
                  objectFit: 'cover',
                  borderRadius: 4,
                  border: '1px solid #ccc'
                }}
              />
            </a>
          ))}
        </div>
      );
    }

    if (c.type === 'date') {
      return formatDate(cellValue);
    }

    if (c.type === 'datetime') {
      return formatDateTime(cellValue);
    }

    return cellValue ?? '';
  };

  return (
    <Layout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        <h2>Mes rapports</h2>

        <div style={{ marginBottom: 16 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              style={{
                marginRight: 8,
                padding: '6px 12px',
                border: '1px solid #143c6d',
                background: active === t.key ? '#143c6d' : '#fff',
                color: active === t.key ? '#fff' : '#143c6d',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div>Chargement…</div>
        ) : rows.length === 0 ? (
          <div>Aucune donnée.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              border="1"
              cellPadding="6"
              style={{ borderCollapse: 'collapse', width: '100%', minWidth: 800 }}
            >
              <thead>
                <tr>
                  {currentTab.cols.map(c => <th key={c.key}>{c.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id}>
                    {currentTab.cols.map(c => (
                      <td key={c.key}>
                        {renderCellContent(c, r)}
                      </td>
                    ))}
                    <td>
                      <button 
                        onClick={() => handleEdit(r.id)}
                        style={{
                          padding: '4px 12px',
                          background: '#f9c846',
                          color: '#143c6d',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
