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
      { key: 'prefecture', label: 'Département' },
      { key: 'sousPrefecture', label: 'Sous-préfecture' },
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
      { key: 'prefecture', label: 'Département' },
      { key: 'ville', label: 'Ville' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'description', label: 'Description' },
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
];

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

      query = query.eq('created_by_user_id', authUser.id);
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
    } else if (active === 'affaires_humanitaires') {
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
                  alt="Image"
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

          <div className="tabs-container">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setActive(t.key)}
                className={`tab-button ${active === t.key ? 'active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="loading-message">Chargement…</div>
          ) : rows.length === 0 ? (
            <div className="no-data-message">Aucune donnée.</div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
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
                          className="edit-button"
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
      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        h2 {
          text-align: center;
          margin-bottom: 1.5rem;
          color: #143c6d;
        }
        .tabs-container {
          margin-bottom: 1rem;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .tab-button {
          padding: 8px 12px;
          border: 1px solid #143c6d;
          background: #fff;
          color: #143c6d;
          cursor: pointer;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
          font-size: 0.9rem;
        }
        .tab-button.active {
          background: #143c6d;
          color: #fff;
        }
        .tab-button:hover:not(.active) {
          background: #e0e0e0;
        }
        .loading-message,
        .no-data-message {
          text-align: center;
          padding: 20px;
          font-size: 1.1rem;
          color: #555;
        }
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch; /* Enable smooth scrolling on iOS */
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px; /* Ensure table is wide enough for content */
        }
        .data-table th,
        .data-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #ddd;
          text-align: left;
          vertical-align: top;
          font-size: 0.85rem;
        }
        .data-table th {
          background-color: #f7f9fc;
          color: #333;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .data-table tbody tr:nth-child(even) {
          background-color: #fff;
        }
        .data-table tbody tr:nth-child(odd) {
          background-color: #fcfcfc;
        }
        .data-table tbody tr:hover {
          background-color: #eef8ff;
        }
        .edit-button {
          padding: 6px 10px;
          background: #f9c846;
          color: #143c6d;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          font-size: 0.8rem;
          transition: background 0.2s;
        }
        .edit-button:hover {
          background: #e0b030;
        }
        .image-gallery {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .image-gallery img {
          width: 30px;
          height: 30px;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .expand-button {
          margin-left: 8px;
          border: none;
          background: none;
          color: #143c6d;
          cursor: pointer;
          text-decoration: underline;
          font-weight: bold;
          padding: 2px 0;
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }
          h2 {
            font-size: 1.4rem;
            margin-bottom: 1rem;
          }
          .tabs-container {
            justify-content: flex-start;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            white-space: nowrap;
            padding-bottom: 8px;
          }
          .tab-button {
            flex-shrink: 0;
            font-size: 0.8rem;
            padding: 6px 10px;
          }
          .data-table {
            min-width: 600px; /* Adjust min-width for smaller screens */
          }
          .data-table th,
          .data-table td {
            font-size: 0.75rem;
            padding: 8px 5px;
          }
          .data-table td:first-child {
            min-width: 120px; /* Adjust for first column */
          }
          .edit-button {
            padding: 4px 8px;
            font-size: 0.7rem;
          }
          .image-gallery img {
            width: 25px;
            height: 25px;
          }
          .expand-button {
            font-size: 0.7rem;
          }
        }
      `}</style>
    );
  }