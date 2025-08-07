// utils/pdfExport.js
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export async function generateReportsPdf(provinceName, monthName, reports, TABS_CONFIG) {
  const doc = new jsPDF('p', 'mm', 'a4');
  const margin = 10;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  let yOffset = 20;

  const addHeaderFooter = () => {
    doc.setFontSize(10);
    doc.text('اسم المندوبية', pageWidth / 2, margin, { align: 'center' });
    doc.text(new Date().toLocaleDateString('fr-FR'), pageWidth - margin, pageHeight - margin, { align: 'right' });
  };

  addHeaderFooter();

  doc.setFontSize(16);
  doc.text(`Rapports pour ${provinceName} - ${monthName}`, margin, yOffset);
  yOffset += 10;

  reports.forEach(report => {
    const config = TABS_CONFIG[report._type];
    if (!config) return;

    const colsForPdf = config.cols.filter(c => c.key !== 'description' && c.key !== 'details');
    const headers = colsForPdf.map(c => c.label);
    const data = colsForPdf.map(c => {
      let val = report[c.key];
      if (c.type === 'date') return new Date(val).toLocaleDateString('fr-FR');
      if (c.type === 'datetime') return new Date(val).toLocaleString('fr-FR');
      if (c.key === 'images' && Array.isArray(val)) return val.length + ' image(s)';
      return val ?? '';
    });

    if (yOffset + 20 > pageHeight - margin) {
      doc.addPage();
      addHeaderFooter();
      yOffset = margin + 10;
    }

    doc.autoTable({
      startY: yOffset,
      head: [headers],
      body: [data],
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 1 },
      margin: { left: margin, right: margin },
      didDrawPage: addHeaderFooter
    });
    yOffset = doc.autoTable.previous.finalY + 5;

    const desc = report.description || report.details;
    if (desc) {
      doc.setFontSize(8);
      doc.text('Description:', margin, yOffset);
      yOffset += 5;
      const split = doc.splitTextToSize(desc, pageWidth - 2 * margin);
      doc.text(split, margin, yOffset);
      yOffset += split.length * 2.5 + 5;
    }
  });

  doc.save(`${provinceName}_${monthName}_reports.pdf`);
}