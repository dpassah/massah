import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../../lib/supabaseClient';
import Layout from '../../../components/Layout';
import Head from 'next/head';

export default function AideProvinceData() {
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
      .from('aides')
      .select('*')
      .eq('province', provinceName)
      .order('date', { ascending: false });

    if (error) {
      console.error(`Error fetching aides data for ${provinceName}:`, error);
      setRows([]);
    } else {
      setRows(data || []);
    }
    setLoading(false);
  }

  const displayCols = [
    { key: 'date', label: 'Date' },
    { key: 'prefecture', label: 'Préfecture' },
    { key: 'sousprefecture', label: 'Sous-préfecture' },
    { key: 'ville', label: 'Ville/Village' },
    { key: 'typeaide', label: "Type d'aide" },
    { key: 'organisme', label: 'Organisme' },
    { key: 'nombrebeneficiaires', label: 'Bénéficiaires' },
    { key: 'signataire', label: 'Signataire' },
  ];

  const exportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

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
        
        const imgWidth = 20;
        const imgHeight = 20;
        const gap = 5;
        const logoX = (pageWidth - imgWidth) / 2;
        doc.addImage(imgData, 'PNG', logoX, 10, imgWidth, imgHeight);
        
        doc.setFontSize(12);
        const title1 = "Ministère de l'Action Sociale, de la Solidarité et des Affaires Humanitaires";
        doc.text(title1, pageWidth / 2, 10 + imgHeight + gap, { align: 'center' });

        doc.setFontSize(16);
        const title2 = `Détail des Aides pour la Province de ${province}`;
        doc.text(title2, pageWidth / 2, 10 + imgHeight + gap + 10, { align: 'center' });

        const tableColumn = displayCols.map(c => c.label);
        const tableRows = rows.map(row => {
            return displayCols.map(col => row[col.key] || '');
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 50,
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], textColor: 255, font: 'DejaVuSans' },
            styles: { fontSize: 8, cellPadding: 2, font: 'DejaVuSans' },
        });

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

        doc.save(`aides_${province}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Impossible de générer le PDF. Veuillez vérifier votre connexion Internet et que les fichiers de police et de logo sont présents dans le dossier public.");
    }
  };

  return (
    <Layout>
      <Head>
        <title>Aides pour {province} – DPASSAH</title>
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
        }
        .data-table tbody tr:nth-child(odd) {
          background-color: #fcfcfc;
        }
        .data-table tbody tr:hover {
          background-color: #eef8ff;
        }
      `}</style>

      <div className="container">
        <h2 style={{ textAlign: 'center', color: '#143c6d', marginBottom: '2rem' }}>
          Détail des Aides pour la Province de {province}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Chargement des données...
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '1.1rem', color: '#555' }}>
            Aucune aide à afficher pour cette province.
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
                    {displayCols.map(c => (
                      <th key={c.key}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      {displayCols.map(col => (
                        <td key={col.key}>{row[col.key]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
