// pages/solidarite/inondations.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import { supabase } from '../../lib/supabaseClient';
import Layout from '../../components/Layout';
import Head from 'next/head';

export default function InondationsData() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize router
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchData();
    setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inondations')
      .select('*')
      .order('province', { ascending: true });

    if (error) {
      console.error('Error fetching inondations data:', error);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
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

  const summaryCols = [
    { key: 'province', label: 'Province' },
    ...numericalKeys.map(nk => ({ key: `total_${nk.key}`, label: nk.label }))
  ];

  const processedData = {};
  rows.forEach(row => {
    if (!processedData[row.province]) {
      processedData[row.province] = { reports: [] };
      numericalKeys.forEach(nk => {
        processedData[row.province][`total_${nk.key}`] = 0;
      });
    }
    numericalKeys.forEach(nk => {
      processedData[row.province][`total_${nk.key}`] += (parseInt(row[nk.key], 10) || 0);
    });
    processedData[row.province].reports.push(row);
  });

  const provinces = Object.keys(processedData);

  const totals = rows.reduce((acc, row) => {
    numericalKeys.forEach(item => {
      acc[item.key] = (acc[item.key] || 0) + (parseInt(row[item.key], 10) || 0);
    });
    return acc;
  }, {});

  const handleRowClick = (provinceName) => {
    router.push(`/solidarite/inondations/${encodeURIComponent(provinceName)}`);
  };

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

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
        doc.setFont('DejaVuSans'); // Set font for the entire document
        
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
        const title2 = "Situation générale des inondations";
        doc.text(title2, pageWidth / 2, 10 + imgHeight + gap + 10, { align: 'center' });

        // Key Figures Section
        doc.setFont('DejaVuSans', 'bold');
        doc.setTextColor(20, 60, 109); // #143c6d
        doc.setFontSize(12);
        doc.text("Les chiffres clés:", 14, 45);
        doc.setFont('DejaVuSans', 'normal');
        doc.setTextColor(0, 0, 0);


        const keyFigures = [
            { label: "Provinces affectées", value: provinces.length },
            { label: "Personnes affectées", value: totals.nbAffectes || 0 },
            { label: "Ménages affectés", value: totals.nbMenages || 0 },
            { label: "Personnes blessées", value: totals.nbBlesses || 0 },
            { label: "Personnes décédées", value: totals.nbDeces || 0 },
            { label: "Personnes déplacées", value: totals.nbDeplaces || 0 },
            { label: "Bétail mort", value: totals.nbBetailMort || 0 },
            { label: "Hectares détruits", value: totals.superficieInondee || 0 }
        ];

        let startX = 14;
        let startY = 52;
        const itemWidth = 70;
        const itemHeight = 15;
        const maxItemsPerRow = 4;

        keyFigures.forEach((figure, index) => {
            const col = index % maxItemsPerRow;
            const row = Math.floor(index / maxItemsPerRow);
            const currentX = startX + col * itemWidth;
            const currentY = startY + row * itemHeight;

            doc.setFontSize(10);
            doc.setFont('DejaVuSans', 'bold');
            doc.text(String(figure.value), currentX, currentY);
            
            doc.setFont('DejaVuSans', 'normal');
            doc.setFontSize(8);
            doc.text(figure.label, currentX, currentY + 5);
        });

        const tableStartY = startY + Math.ceil(keyFigures.length / maxItemsPerRow) * itemHeight;

        const tableColumn = summaryCols.map(c => c.label);
        const tableRows = provinces.map(provinceName => {
            const rowData = [provinceName];
            numericalKeys.forEach(nk => {
                rowData.push(processedData[provinceName][`total_${nk.key}`] || 0);
            });
            return rowData;
        });

        const totalRow = ['Total Général'];
        numericalKeys.forEach(nk => {
            totalRow.push(totals[nk.key] || 0);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            foot: [totalRow],
            startY: tableStartY,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255, font: 'DejaVuSans' },
            footStyles: { fillColor: [234, 246, 255], textColor: [10, 77, 140], font: 'DejaVuSans' },
            styles: { fontSize: 8, cellPadding: 2, font: 'DejaVuSans' },
            columnStyles: { 0: { cellWidth: 40 } },
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

        doc.save('situation_inondations.pdf');
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Impossible de générer le PDF. Veuillez vérifier votre connexion Internet et que les fichiers de police et de logo sont présents dans le dossier public.");
    }
  };

  return (
    <Layout>
      <Head>
        <title>Données des Inondations – DPASSAH</title>
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
            margin-bottom: 1.5rem;
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
          min-width: 1100px;
        }
        
        .data-table th,
        .data-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #ddd;
          text-align: center;
          vertical-align: middle;
          font-size: 0.9rem;
        }
        
        .data-table th {
          background-color: #f7f9fc;
          color: #333;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .data-table th:first-child,
        .data-table td:first-child {
          text-align: left;
          font-weight: 500;
          min-width: 180px;
          position: sticky;
          left: 0;
          z-index: 1;
          background-color: inherit;
        }
        
        .data-table th:first-child {
          z-index: 2;
        }
        
        .data-table tbody tr {
          transition: background-color 0.2s ease;
        }
        
        .data-table tbody tr:last-child td {
            border-bottom: none;
        }

        .data-table tbody tr:nth-child(even) {
          background-color: #fff;
        }
        
        .data-table tbody tr:nth-child(odd) {
          background-color: #fcfcfc;
        }
        
        .data-table tbody tr.clickable-row:hover {
          background-color: #eef8ff;
          cursor: pointer;
        }
        
        .data-table .total-row td {
          background-color: #eaf6ff;
          font-weight: bold;
          color: #0a4d8c;
          border-top: 2px solid #0a4d8c;
        }
        
        .data-table .total-row td:first-child {
          position: sticky;
          left: 0;
          z-index: 1;
          background-color: #eaf6ff;
        }
        
        @media (max-width: 768px) {
          .data-table {
            /* min-width removed */
          }
          .data-table th, .data-table td {
            font-size: 0.75rem;
            padding: 8px 5px;
          }
          .data-table th:first-child,
          .data-table td:first-child {
            min-width: 100px;
          }
          div[style*="display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center'"] > div {
            min-width: 120px !important;
            max-width: 150px !important;
            padding: 1rem !important;
          }
          div[style*="font-size: '2.5rem'"] {
            font-size: 1.8rem !important;
          }
          div[style*="font-size: '1.1rem'"] {
            font-size: 0.9rem !important;
          }
          div[style*="font-size: '2.2rem'"] {
            font-size: 1.8rem !important;
          }
        }
      `}</style>

      <div className="container">
        <h2 style={{ textAlign: 'center', color: '#143c6d', marginBottom: '2rem' }}>
          Données des Inondations par Province
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Chargement des données...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Aucune donnée d'inondation à afficher.
          </div>
        ) : (
          <>
            {isLoggedIn && (
              <div style={{ textAlign: 'center' }}>
                  <button onClick={exportPDF} className="export-button">
                      Exporter en PDF
                  </button>
              </div>
            )}
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {summaryCols.map(c => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {provinces.map((provinceName) => (
                    <tr 
                      key={provinceName} 
                      onClick={() => handleRowClick(provinceName)}
                      className="clickable-row"
                    >
                      <td>{provinceName}</td>
                      {numericalKeys.map(nk => (
                        <td key={nk.key}>
                          {processedData[provinceName][`total_${nk.key}`]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr className="total-row">
                    <td>Total Général</td>
                    {numericalKeys.map(nk => (
                      <td key={nk.key}>{totals[nk.key] || 0}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 style={{ textAlign: 'center', color: '#143c6d', marginBottom: '1.5rem', marginTop: '3rem' }}>
              Statistiques Globales
            </h3>
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