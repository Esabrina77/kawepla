import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  purchaseId: string;
  purchaseDate: string;
  customerName: string;
  customerEmail: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  stripePaymentId?: string;
}

interface CompanyInfo {
  name: string;
  city: string;
  postalCode: string;
  country: string;
  email: string;
  website: string;
}

const COMPANY_INFO: CompanyInfo = {
  name: 'Kawepla',
  city: 'Paris',
  postalCode: '75001',
  country: 'France',
  email: 'kawepla@kaporelo.com',
  website: 'https://kawepla.kaporelo.com'
};

export async function generateInvoicePDF(data: InvoiceData): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  // Couleurs Professionnelles (KAWEPLA BRAND)
  const primaryColor = [99, 102, 241]; // #6366F1
  const secondaryColor = [31, 41, 55]; // Gray-800
  const lightGray = [243, 244, 246]; // Gray-100
  const borderGray = [229, 231, 235]; // Gray-200
  const mutedGray = [107, 114, 128]; // Gray-500

  // Header Background Accent
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 2, 'F');

  // LOGO KAWEPLA (Helvetica Bold #6366F1)
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('KAWEPLA', margin, 25);
  
  // Title (Right)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFontSize(28);
  doc.text('FACTURE', pageWidth - margin, 25, { align: 'right' });
  
  yPosition = 50;

  // Invoice Meta Info (Number & Date) - Top Center
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`NUMÉRO DE FACTURE`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.invoiceNumber, pageWidth - margin, yPosition, { align: 'right' });
  
  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text(`DATE D'ÉMISSION`, pageWidth - margin, yPosition, { align: 'right' });
  yPosition += 6;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(formatDate(data.purchaseDate), pageWidth - margin, yPosition, { align: 'right' });

  // Reset Y for Address Sections
  yPosition = 50;

  // Company Section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('ÉMETTEUR', margin, yPosition);
  
  yPosition += 6;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(COMPANY_INFO.name.toUpperCase(), margin, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  yPosition += 6;
  doc.text(`${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}, ${COMPANY_INFO.country}`, margin, yPosition);
  yPosition += 5;
  doc.text(COMPANY_INFO.email, margin, yPosition);

  // Client Section
  yPosition += 15;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.setFontSize(10);
  doc.text('DESTINATAIRE', margin, yPosition);
  
  yPosition += 6;
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(data.customerName, margin, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  yPosition += 6;
  doc.text(data.customerEmail, margin, yPosition);

  // Table Section
  yPosition += 25;
  
  // Table Header
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F');
  
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('DESCRIPTION', margin + 5, yPosition + 6.5);
  doc.text('QUANTITÉ', margin + 100, yPosition + 6.5, { align: 'center' });
  doc.text('PRIX UNITAIRE', margin + 140, yPosition + 6.5, { align: 'center' });
  doc.text('TOTAL', pageWidth - margin - 5, yPosition + 6.5, { align: 'right' });

  // Table Row
  yPosition += 10;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, yPosition + 10, pageWidth - margin, yPosition + 10);
  
  doc.setFont('helvetica', 'normal');
  doc.text(data.itemName, margin + 5, yPosition + 6.5);
  doc.text(data.quantity.toString(), margin + 100, yPosition + 6.5, { align: 'center' });
  doc.text(formatPrice(data.unitPrice, data.currency), margin + 140, yPosition + 6.5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(formatPrice(data.totalPrice, data.currency), pageWidth - margin - 5, yPosition + 6.5, { align: 'right' });

  // Summary (Totals)
  yPosition += 40;
  const colX = pageWidth - margin - 60;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('SOUS-TOTAL', colX, yPosition);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(formatPrice(data.totalPrice, data.currency), pageWidth - margin, yPosition, { align: 'right' });
  
  yPosition += 8;
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('TVA (0%)', colX, yPosition);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text('0,00 €', pageWidth - margin, yPosition, { align: 'right' });
  
  // Final Total Line
  yPosition += 6;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.5);
  doc.line(colX, yPosition, pageWidth - margin, yPosition);
  
  yPosition += 10;
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL', colX, yPosition);
  doc.text(formatPrice(data.totalPrice, data.currency), pageWidth - margin, yPosition, { align: 'right' });

  // Footer Policy
  const footerY = pageHeight - 30;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.1);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setFontSize(8);
  doc.setTextColor(mutedGray[0], mutedGray[1], mutedGray[2]);
  doc.text('MERCI POUR VOTRE ACHAT', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Kawepla - Solutions de Planification d\'Événements - © 2026', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text('Toute question peut être adressée à hello@kawepla.com', pageWidth / 2, footerY + 10, { align: 'center' });

  // Download the PDF
  doc.save(`KAWEPLA_FACTURE_${data.invoiceNumber}.pdf`);
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatPrice(price: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(price);
}
