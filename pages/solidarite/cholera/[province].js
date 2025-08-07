// pages/solidarite/cholera/[province].js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CholeraProvinceDetails() {
  const router = useRouter();
  const { province } = router.query;
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (province) {
      fetchData(province);
    }
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, [province]);

  async function fetchData(provinceName) {
    setLoading(true);
    const { data, error } = await supabase
      .from('cholera')
      .select('*')
      .ilike('province', decodeURIComponent(provinceName))
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching cholera data:', error);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }

  const numericalKeys = [
    { key: 'nbcas', label: 'Nombre de cas', icon: '🤒' },
    { key: 'nbdeces', label: 'Nombre de décès', icon: '⚰️' },
    { key: 'nbgueris', label: 'Nombre de guéris', icon: '💪' },
    { key: 'nbhospitalises', label: 'Hospitalisés', icon: '🏥' },
    { key: 'nbvaccines', label: 'Vaccinés', icon: '💉' },
    { key: 'sorties', label: 'Sorties', icon: '🏃‍♂️' },
    { key: 'patientsaulit', label: 'Patients au lit', icon: '🛏️' },
    { key: 'decescommunautaire', label: 'Décès communautaire', icon: '🚑' },
  ];

  const detailCols = [
    { key: 'prefecture', label: 'Département' },
    { key: 'sousprefecture', label: 'Sous-préfecture' },
    { key: 'ville', label: 'Ville/Village' },
    { key: 'category', label: 'Catégorie' },
    { key: 'nbcas', label: 'Cas', type: 'number' },
    { key: 'nbdeces', label: 'Décès', type: 'number' },
    { key: 'nbgueris', label: 'Guéris', type: 'number' },
    { key: 'nbhospitalises', label: 'Hospitalisés', type: 'number' },
    { key: 'nbvaccines', label: 'Vaccinés', type: 'number' },
    { key: 'sorties', label: 'Sorties', type: 'number' },
    { key: 'patientsaulit', label: 'Patients au lit', type: 'number' },
    { key: 'decescommunautaire', label: 'Décès communautaire', type: 'number' },
    { key: 'date', label: 'Date', type: 'date' },
  ];

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');

  const totals = rows.reduce((acc, row) => {
    numericalKeys.forEach(item => {
      acc[item.key] = (acc[item.key] || 0) + (parseInt(row[item.key], 10) || 0);
    });
    return acc;
  }, {});

  const renderCellContent = (c, r) => {
    const cellValue = r[c.key];
    if (c.type === 'date') return formatDate(cellValue);
    return cellValue ?? '';
  };

  const exportPDF = async () => {
    try {
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

      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const fontB64 = fontData.split(',')[1];
      doc.addFileToVFS('DejaVuSans.ttf', fontB64);
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
      doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'bold');
      doc.setFont('DejaVuSans');

      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = 20, imgHeight = 20;
      const logoX = (pageWidth - imgWidth) / 2;
      doc.addImage(imgData, 'PNG', logoX, 10, imgWidth, imgHeight);

      doc.setFontSize(12);
      doc.text("Ministère de l'Action Sociale, de la Solidarité et des Affaires Humanitaires", pageWidth / 2, 10 + imgHeight + 5, { align: 'center' });

      doc.setFontSize(16);
      doc.text(`Situation du choléra – Province ${province}`, pageWidth / 2, 10 + imgHeight + 15, { align: 'center' });

      const tableColumn = detailCols.map(c => c.label);
      const tableRows = rows.map(row => detailCols.map(c => renderCellContent(c, row)));
      const totalRow = detailCols.map((col, idx) => {
        if (idx === 0) return 'Total';
        if (idx === 1) return '';
        return totals[col.key] ?? '';
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        foot: [totalRow],
        startY: 55,
        theme: 'grid',
        headStyles: { fillColor: [44, 62, 80], textColor: 255, font: 'DejaVuSans' },
        footStyles: { fillColor: [234, 246, 255], textColor: [10, 77, 140], font: 'DejaVuSans', fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2, font: 'DejaVuSans' },
        columnStyles: { 0: { cellWidth: 25 }, 1: { cellWidth: 25 } },
      });

      const pageCount = doc.internal.getNumberOfPages();
      const now = new Date();
      const exportTime = `Exporté le: ${now.toLocaleDateString('fr-FR')} à ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height || pageSize.getHeight();
        const pageWidth = pageSize.width || pageSize.getWidth();
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(exportTime, 14, pageHeight - 10);
        doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }

      doc.save(`situation_cholera_${province}.pdf`);
    } catch (error) {
      console.error('PDF error:', error);
      alert('Impossible de générer le PDF. Vérifiez la connexion et les fichiers public.');
    }
  };

  return (
    <Layout>
      <Head>
        <title>Détail Choléra – {province || ''}</title>
      </Head>

      <style jsx>{`
        .container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
        .export-button {
          background-color: #143c6d;
          color: white;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 500;
          transition: background-color 0.3s ease;
          margin-bottom: 1.5rem;
        }
        .export-button:hover { background-color: #0a2a4d; }
        .data-table-wrapper { overflow-x: auto; margin-bottom: 3rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.1); border: 1px solid #ddd; }
        .data-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
        .data-table th, .data-table td { padding: 12px 10px; border-bottom: 1px solid #ddd; text-align: center; vertical-align: middle; font-size: 0.9rem; }
        .data-table th { background-color: #f7f9fc; color: #333; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .data-table tbody tr:nth-child(even) { background-color: #fff; }
        .data-table tbody tr:nth-child(odd) { background-color: #fcfcfc; }
        .data-table tbody tr:hover { background-color: #eef8ff; }
        .empty { text-align: center; padding: 2rem; color: #555; }
      `}</style>

      <div className="container">
        <h2>Données du choléra – Province : {province}</h2>

        {loading ? (
          <div className="empty">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="empty">Aucune donnée trouvée pour cette province.</div>
        ) : (
          <>
            {isLoggedIn && (
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <button onClick={exportPDF} className="export-button">
                  Exporter en PDF
                </button>
              </div>
            )}
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {detailCols.map(c => <th key={c.key}>{c.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(report => (
                    <tr key={report.id}>
                      {detailCols.map(c => (
                        <td key={c.key}>{renderCellContent(c, report)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ textAlign: 'center', color: '#143c6d', marginBottom: '1.5rem' }}>Statistiques Globales pour la Province</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center' }}>
              {numericalKeys.map(item => (
                <div
                  key={item.key}
                  style={{
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    borderRadius: '10px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    minWidth: '180px',
                    flex: '1 1 auto',
                    maxWidth: '220px',
                    color: '#143c6d',
                    fontWeight: 'bold',
                    border: '1px solid #a7d9ff',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                  <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.label}</div>
                  <div style={{ fontSize: '2.2rem', fontWeight: 'bold' }}>{totals[item.key] || 0}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}