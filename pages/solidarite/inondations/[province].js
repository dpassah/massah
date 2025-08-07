import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../../../components/Layout';
import Head from 'next/head';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ProvinceInondationsData() {
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
      .from('inondations')
      .select('*')
      .eq('province', provinceName)
      .order('prefecture', { ascending: true })
      .order('ville', { ascending: true });

    if (error) {
      console.error('Error fetching inondations data for province:', error);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }

  function formatDate(d) {
    return d ? new Date(d).toLocaleDateString('fr-FR') : '';
  }

  const numericalKeys = [
    { key: 'nbAffectes', label: "Nombre d'affectés", icon: '👥' },
    { key: 'nbMenages', label: 'Nombre de ménages', icon: '🏠' },
    { key: 'nbDisparus', label: 'Nombre de disparus', icon: '❓' },
    { key: 'nbBlesses', label: 'Nombre de blessés', icon: '🤕' },
    { key: 'nbDeces', label: 'Nombre de décès', icon: '⚰️' },
    { key: 'nbDeplaces', label: 'Nombre de déplacés', icon: '🚚' },
    { key: 'nbMaisonsDetruites', label: 'Maisons détruites', icon: '🏚️' },
    { key: 'nbMaisonsEndommagees', label: 'Maisons endommagées', icon: '🩹🏠' },
    { key: 'nbBetailPerdu', label: 'Bétail perdu', icon: '🐄' },
    { key: 'nbBetailMort', label: 'Bétail mort', icon: '💀' },
    { key: 'superficieInondee', label: 'Hectares de champs détruits', icon: '🌾' },
  ];

  const detailCols = [
    { key: 'prefecture', label: 'Préfecture/Dép.' },
    { key: 'ville', label: 'Commune/Ville' },
    { key: 'nbAffectes', label: 'Affectés' },
    { key: 'nbMenages', label: 'Ménages' },
    { key: 'nbDisparus', label: 'Disparus' },
    { key: 'nbBlesses', label: 'Blessés' },
    { key: 'nbDeces', label: 'Décès' },
    { key: 'nbDeplaces', label: 'Déplacés' },
    { key: 'nbMaisonsDetruites', label: 'Maisons dét.' },
    { key: 'nbMaisonsEndommagees', label: 'Maisons end.' },
    { key: 'nbBetailPerdu', label: 'Bétail perdu' },
    { key: 'nbBetailMort', label: 'Bétail mort' },
    { key: 'superficieInondee', label: 'Hectares détruits' },
    { key: 'date', label: 'Date', type: 'date' },
  ];

  const renderCellContent = (c, r) => {
    const cellValue = r[c.key];
    if (c.type === 'date') {
      return formatDate(cellValue);
    }
    return cellValue ?? '';
  };

  const totals = rows.reduce((acc, row) => {
    numericalKeys.forEach(item => {
      acc[item.key] = (acc[item.key] || 0) + (parseInt(row[item.key], 10) || 0);
    });
    return acc;
  }, {});

  const exportPDF = async () => {
    try {
        // 1. Fetch all external resources first
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

        // 2. Create PDF and add resources
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });

        const fontB64 = fontData.split(',')[1];
        doc.addFileToVFS('DejaVuSans.ttf', fontB64);
        doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'normal');
        doc.addFont('DejaVuSans.ttf', 'DejaVuSans', 'bold');
        doc.setFont('DejaVuSans');

        const pageWidth = doc.internal.pageSize.getWidth();

        // 3. Build the PDF content
        // Header
        const imgWidth = 20;
        const imgHeight = 20;
        const gap = 5;
        const logoX = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData, 'PNG', logoX, 10, imgWidth, imgHeight);

        doc.setFontSize(12);
        const title1 = "Ministère de l'Action Sociale, de la Solidarité et des Affaires Humanitaires";
        doc.text(title1, pageWidth / 2, 10 + imgHeight + gap, { align: 'center' });

        doc.setFontSize(16);
        const title2 = `Situation des inondations pour la province de ${province}`;
        doc.text(title2, pageWidth / 2, 10 + imgHeight + gap + 10, { align: 'center' });

        // Table
        const tableColumn = detailCols.map(c => c.label);
        const tableRows = rows.map(row => {
            return detailCols.map(c => renderCellContent(c, row));
        });

        const totalRowForTable = detailCols.map((col, index) => {
            if (index === 0) return 'Total';
            return totals[col.key] !== undefined ? totals[col.key] : '';
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            foot: [totalRowForTable],
            startY: 55,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255, font: 'DejaVuSans' },
            footStyles: { fillColor: [234, 246, 255], textColor: [10, 77, 140], font: 'DejaVuSans', fontStyle: 'bold' },
            styles: { fontSize: 7, cellPadding: 2, font: 'DejaVuSans' },
            columnStyles: { 0: { cellWidth: 25 }, 1: {cellWidth: 25 } },
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        const now = new Date();
        const exportTime = `Exporté le: ${now.toLocaleDateString('fr-FR')} à ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const pageSize = doc.internal.pageSize;
            const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
            const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();

            doc.setFontSize(8);
            doc.setTextColor(100);
            doc.text(exportTime, 14, pageHeight - 10);
            doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        }

        doc.save(`situation_inondations_${province}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Impossible de générer le PDF. Veuillez vérifier votre connexion Internet et que les fichiers de police et de logo sont présents dans le dossier public.");
    }
  };

  return (
    <Layout>
      <Head>
        <title>Données des Inondations - {province} – DPASSAH</title>
      </Head>

      <style jsx>{`
        .container {
          width: 100%;
          padding: 2rem 1rem;
          margin: 0 auto;
        }
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
        }
        .export-button:hover {
            background-color: #0a2a4d;
        }
        .data-table-wrapper {
          overflow-x: auto;
          margin-bottom: 3rem;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1200px;
        }
        .data-table th,
        .data-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #ddd;
          text-align: left;
          vertical-align: middle;
          font-size: 0.9rem;
        }
        .data-table th {
          background-color: #f7f9fc;
          color: #333;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: center;
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
        .data-table td {
            text-align: center;
        }
        .data-table td:first-child, .data-table th:first-child {
            text-align: left;
            font-weight: 500;
        }
      `}</style>

      <div className="container">
        <h2 style={{ textAlign: 'center', color: '#143c6d', marginBottom: '2rem' }}>
          Données des Inondations pour {province}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>Chargement des données...</div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>Aucune donnée d'inondation à afficher pour cette province.</div>
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
                    {detailCols.map(c => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((report) => (
                    <tr key={report.id}>
                      {detailCols.map(c => (
                        <td key={c.key}>
                          {renderCellContent(c, report)}
                        </td>
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
                    transition: 'transform 0.2s ease',
                    cursor: 'default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
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
