// pages/admin/gestion.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import RequireAuth from '../../components/RequireAuth';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ALL_REPORT_TABLES = ['inondations', 'cholera', 'aides', 'affaires_humanitaires', 'action_sociale', 'actualites'];

const TABS_CONFIG = {
  inondations: {
    key: 'inondations',
    label: 'Inondations',
    dateField: 'date',
    provinceField: 'province',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Département' },
      { key: 'ville', label: 'Ville' },
      { key: 'nbAffectes', label: 'Affectés' },
      { key: 'nbMenages', label: 'Ménages' },
      { key: 'nbDeces', label: 'Décès' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' },
    ]
  },
  cholera: {
    key: 'cholera',
    label: 'Choléra',
    dateField: 'date',
    provinceField: 'province',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'prefecture', label: 'Département' },
      { key: 'ville', label: 'Ville' },
      { key: 'nbCasSuspects', label: 'Cas suspects' },
      { key: 'nbCasConfirmes', label: 'Cas confirmés' },
      { key: 'nbDecesCholera', label: 'Décès (choléra)' },
      { key: 'nbGueris', label: 'Guéris' },
      { key: 'nbLitsDisponibles', label: 'Lits disponibles' },
      { key: 'nbEquipesIntervention', label: "Équipes d'intervention" },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' },
    ]
  },
  aides: {
    key: 'aides',
    label: 'Aides',
    dateField: 'date',
    provinceField: 'province',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'province', label: 'Province' },
      { key: 'typeAide', label: `Type d'aide` },
      { key: 'organisme', label: 'Organisme' },
      { key: 'nombreBeneficiaires', label: 'Bénéficiaires' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' },
    ]
  },
  affaires_humanitaires: {
    key: 'affaires_humanitaires',
    label: 'Affaires Humanitaires',
    dateField: 'date_intervention',
    provinceField: 'province',
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
  action_sociale: {
    key: 'action_sociale',
    label: 'Action Sociale',
    dateField: 'date_action',
    provinceField: 'province',
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
  actualites: {
    key: 'actualites',
    label: 'Actualités',
    dateField: 'created_at',
    provinceField: 'province',
    cols: [
      { key: 'id', label: 'ID' },
      { key: 'title', label: 'Titre' },
      { key: 'details', label: 'Détails' },
      { key: 'images', label: 'Images', type: 'images' },
      { key: 'signataire', label: 'Signataire' },
      { key: 'created_at', label: 'Créé le', type: 'datetime' }
    ]
  },
  statistiques: { key: 'statistiques', label: 'Statistiques', cols: [] }
};

export default function AdminGestion() {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all_reports');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [expanded, setExpanded] = useState({});
  const router = useRouter();

  /* --------- جلب البيانات --------- */
  useEffect(() => {
    fetchAllReports();
  }, []);

  async function fetchAllReports() {
    setLoading(true);
    let data = [];
    for (const tableName of ALL_REPORT_TABLES) {
      const cfg = TABS_CONFIG[tableName];
      const { data: rows, error } = await supabase
        .from(tableName)
        .select('*')
        .order(cfg.dateField || 'created_at', { ascending: false });
      if (!error) {
        data.push(...rows.map(r => ({
          ...r,
          _type: tableName,
          _reportDate: r[cfg.dateField || 'created_at'],
          _province: r[cfg.provinceField || 'province']
        })));
      }
    }
    setAllReports(data);
    setLoading(false);
  }

  /* --------- مساعدات --------- */
  const formatDate = d => d ? new Date(d).toLocaleDateString('fr-FR') : '';
  const formatDateTime = d => d ? new Date(d).toLocaleString('fr-FR') : '';
  const toggle = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const handleEdit = (id, type) => {
    const paths = {
      action_sociale: '/admin/modifier-action-sociale',
      affaires_humanitaires: '/admin/modifier-affaire-humanitaire',
      actualites: '/admin/modifier-actualite'
    };
    router.push(paths[type] || `/admin/modifier-rapport/${id}?type=${type}`);
  };

  /* --------- تصفية حسب التصنيف --------- */
  const filteredReports = activeTab === 'all_reports'
    ? allReports
    : allReports.filter(r => r._type === activeTab);

  /* --------- تجميع حسب الولاية والشهر --------- */
  const grouped = filteredReports.reduce((acc, r) => {
    const p = r._province || (r._type === 'actualites' ? 'Actualités' : 'غير محدد');
    const m = new Date(r._reportDate).toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
    if (!acc[p]) acc[p] = {};
    if (!acc[p][m]) acc[p][m] = { monthName: m, reports: [] };
    acc[p][m].reports.push(r);
    return acc;
  }, {});
  const sortedProvinces = Object.keys(grouped).sort();
  const sortedGrouped = {};
  sortedProvinces.forEach(p => {
    sortedGrouped[p] = {};
    Object.keys(grouped[p]).sort().reverse().forEach(m => (sortedGrouped[p][m] = grouped[p][m]));
  });

  /* --------- تصدير PDF ---------- */
  const generatePdf = async (province, monthName, reports) => {
    try {
      /* 1) جلب الموارد الخارجية */
      const fontPromise = fetch('/DejaVuSans.ttf')
        .then(res => res.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
      const imagePromise = fetch('/logo.png')
        .then(res => res.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        }));
      const [fontData, imgData] = await Promise.all([fontPromise, imagePromise]);

      /* 2) إنشاء الـ PDF */
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const fontB64 = fontData.split(',')[1];
      doc.addFileToVFS('DejaVuSans.ttf', fontB64);
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'bold');
      doc.setFont('DejaVuSans');

      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 20; const imgHeight = 20; const gap = 5;
      const logoX = (pageWidth - imgWidth) / 2;

      /* رأس الصفحة */
      doc.addImage(imgData, 'PNG', logoX, 10, imgWidth, imgHeight);
      doc.setFontSize(12);
      doc.text("Ministère de l'Action Sociale, de la Solidarité et des Affaires Humanitaires", pageWidth / 2, 10 + imgHeight + gap, { align: 'center' });
      doc.setFontSize(16);
      doc.text(`Rapports ${province} – ${monthName}`, pageWidth / 2, 10 + imgHeight + gap + 10, { align: 'center' });

      /* 3) بناء الجداول لكل نوع تقرير */
      let finalY = 55; // Initial Y position for the first table

      const reportsByType = reports.reduce((acc, r) => {
        if (!acc[r._type]) acc[r._type] = [];
        acc[r._type].push(r);
        return acc;
      }, {});

      for (const type of Object.keys(reportsByType)) {
        const currentReports = reportsByType[type];
        const cfg = TABS_CONFIG[type];
        if (!cfg) continue;

        // Filter out description/details columns for the main table
        const colsForTable = cfg.cols.filter(c => c.key !== 'description' && c.key !== 'details');
        const descriptionCols = cfg.cols.filter(c => c.key === 'description' || c.key === 'details');

        const headers = colsForTable.map(c => c.label);
        const body = currentReports.map(r => colsForTable.map(c => {
          const val = r[c.key];
          if (c.type === 'date') return formatDate(val);
          if (c.type === 'datetime') return formatDateTime(val);
          if (c.key === 'images' && Array.isArray(val)) return val.length ? 'Oui' : '';
          return val ?? '';
        }));

        // Calculate totals for numeric columns in the current report type
        const totalRow = colsForTable.map((c, idx) => {
          if (idx === 0) return 'Total';
          const isNum = currentReports.every(r => typeof r[c.key] === 'number' || !isNaN(parseFloat(r[c.key])));
          if (!isNum) return '';
          return currentReports.reduce((sum, r) => sum + (parseFloat(r[c.key]) || 0), 0);
        });

        // Add a title for the current report type
        doc.setFontSize(14);
        doc.text(cfg.label, pageWidth / 2, finalY + 10, { align: 'center' });
        finalY += 20; // Adjust Y for title

        autoTable(doc, {
          head: [headers],
          body,
          foot: [totalRow],
          startY: finalY,
          theme: 'grid',
          headStyles: { fillColor: [44, 62, 80], textColor: 255, font: 'DejaVuSans' },
          footStyles: { fillColor: [234, 246, 255], textColor: [10, 77, 140], font: 'DejaVuSans', fontStyle: 'bold' },
          styles: { fontSize: 7, cellPadding: 2, font: 'DejaVuSans' },
          didDrawPage: (data) => {
            finalY = data.cursor.y; // Update finalY after each table
          }
        });

        // Add descriptions below the table if they exist
        if (descriptionCols.length > 0) {
          doc.setFontSize(10);
          doc.setTextColor(0);
          finalY += 10; // Space after table

          currentReports.forEach(r => {
            descriptionCols.forEach(descCol => {
              const descriptionContent = r[descCol.key];
              if (descriptionContent) {
                doc.setFontSize(12);
                doc.text(`Description:`, 14, finalY);
                finalY += 5;
                doc.setFontSize(10);
                const splitText = doc.splitTextToSize(descriptionContent, pageWidth - 28); // 14mm padding on each side
                doc.text(splitText, 14, finalY);
                finalY += (splitText.length * doc.internal.getLineHeight()) + 5; // Adjust Y for description text
              }
            });
          });
        }
        finalY += 10; // Space between different report types
      }

      /* 4) التذييل */
      const pageCount = doc.internal.getNumberOfPages();
      const now = new Date();
      const exportTime = `Exporté le: ${now.toLocaleDateString('fr-FR')} à ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(exportTime, 14, pageHeight - 10);
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }

      doc.save(`${province}_${monthName}.pdf`);
    } catch (error) {
      console.error('Erreur PDF:', error);
      alert('Impossible de générer le PDF. Vérifiez votre connexion et la présence des fichiers (logo, police).');
    }
  };

  /* --------- عرض --------- */
  const renderCell = (c, r) => {
    const v = r[c.key];
    if (c.key === 'description' || c.key === 'details') {
      const long = v?.length > 100;
      return (
        <>
          {long && !expanded[r.id] ? `${v?.substring(0, 100)}...` : v}
          {long && <button onClick={() => toggle(r.id)} style={{ marginLeft: 8, border: 'none', color: '#143c6d', textDecoration: 'underline' }}>{expanded[r.id] ? 'Voir moins' : 'Voir plus'}</button>}
        </>
      );
    }
    if (c.key === 'images' && v?.length) return v.map((img, i) => <img key={i} src={img} alt="" style={{ width: 40, height: 40, borderRadius: 4, border: '1px solid #ccc', marginRight: 4 }} />);
    if (c.type === 'date') return formatDate(v);
    if (c.type === 'datetime') return formatDateTime(v);
    return v ?? '';
  };

  return (
    <RequireAuth role="admin">
      <Layout>
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '2rem' }}>
          <h2>Gestion des données</h2>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['all_reports', ...ALL_REPORT_TABLES].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderBottom: activeTab === tab ? '3px solid #143c6d' : '3px solid transparent',
                  background: 'none',
                  color: activeTab === tab ? '#143c6d' : '#555',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {tab === 'all_reports' ? 'Tous les Rapports' : TABS_CONFIG[tab].label}
              </button>
            ))}
          </div>

          {activeTab === 'statistiques' ? <div>Statistiques – à implémenter</div> : loading ? <div>Chargement...</div> : !sortedProvinces.length ? <div>Aucun rapport</div> : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '2rem' }}>
                {sortedProvinces.map(p => (
                  <button key={p} onClick={() => setSelectedProvince(p)} style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: 8, background: selectedProvince === p ? '#143c6d' : '#f9f9f9', color: selectedProvince === p ? 'white' : '#333', cursor: 'pointer', fontWeight: 'bold', minWidth: 150 }}>{p}</button>
                ))}
              </div>

              {selectedProvince && (
                <div style={{ overflowX: 'auto', padding: '1rem' }}>
                  {selectedProvince && sortedGrouped[selectedProvince] && Object.entries(sortedGrouped[selectedProvince]).map(([m, { monthName, reports }]) => (
                    <div key={m} style={{ marginBottom: '2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <h3>{monthName}</h3>
                        <button onClick={() => generatePdf(selectedProvince, monthName, reports)} style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: 5 }}>Export PDF</button>
                      </div>
                      {reports.map(r => {
                        const cfg = TABS_CONFIG[r._type];
                        return (
                          <div key={r.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #f0f0f0', borderRadius: 5 }}>
                            <h4 style={{ color: '#143c6d' }}>{cfg.label}</h4>
                            <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.8rem' }}>
                              <thead style={{ background: '#f7f7f7' }}>
                                <tr>{cfg.cols.map(c => <th key={c.key}>{c.label}</th>)}<th>Actions</th></tr>
                              </thead>
                              <tbody>
                                <tr>{cfg.cols.map(c => <td key={c.key}>{renderCell(c, r)}</td>)}<td><button onClick={() => handleEdit(r.id, r._type)} style={{ padding: '4px 8px', background: '#f9c846', border: 'none', borderRadius: 4 }}>Modifier</button></td></tr>
                              </tbody>
                            </table>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}