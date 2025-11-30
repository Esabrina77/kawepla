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
  const margin = 25;
  let yPosition = margin;

  // Couleurs élégantes
  const textColor = [30, 30, 30];
  const lightGray = [220, 220, 220];
  const accentColor = [197, 168, 128]; // Or/doré Kawepla
  const darkGray = [100, 100, 100];

  // Ligne décorative en haut
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(0, 0, pageWidth, 3, 'F');

  // Charger et ajouter le logo (plus petit)
  try {
    const logoUrl = '/images/logo.png';
    const logoResponse = await fetch(logoUrl);
    const logoBlob = await logoResponse.blob();
    const logoDataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(logoBlob);
    });

    // Logo plus petit (hauteur 22px)
    const logoHeight = 22;
    const logoWidth = logoHeight * 2.5;
    doc.addImage(logoDataUrl, 'PNG', margin, 8, logoWidth, logoHeight);
  } catch (error) {
    console.warn('Impossible de charger le logo, utilisation du texte:', error);
    // Fallback: texte Kawepla stylisé
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.text('Kawepla', margin, 20);
  }
  
  // Titre de la facture (à droite, plus élégant)
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - margin, 22, { align: 'right' });
  
  // Ligne fine sous le titre
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - margin - 60, 26, pageWidth - margin, 26);

  yPosition = 40;

  // Informations de l'entreprise (avec style amélioré)
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(margin - 3, yPosition - 8, 80, 50, 2, 2, 'F');
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', margin, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  yPosition += 7;
  doc.text(COMPANY_INFO.name, margin, yPosition);
  yPosition += 5.5;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`${COMPANY_INFO.postalCode} ${COMPANY_INFO.city}`, margin, yPosition);
  yPosition += 5;
  doc.text(COMPANY_INFO.country, margin, yPosition);
  yPosition += 5;
  doc.setFontSize(8.5);
  doc.text(`Email: ${COMPANY_INFO.email}`, margin, yPosition);
  yPosition += 4.5;
  doc.text(`Site: ${COMPANY_INFO.website}`, margin, yPosition);

  // Informations du client (à droite, avec style amélioré)
  const clientX = pageWidth - margin - 75;
  yPosition = 40;
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(clientX - 3, yPosition - 8, 75, 35, 2, 2, 'F');
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('FACTURÉ À', clientX, yPosition);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  yPosition += 7;
  doc.text(data.customerName, clientX, yPosition);
  yPosition += 5.5;
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.setFontSize(8.5);
  doc.text(data.customerEmail, clientX, yPosition);

  // Informations de la facture (style amélioré)
  yPosition = 100;
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`N° Facture:`, margin, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(data.invoiceNumber, margin + 28, yPosition);
  
  yPosition += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Date:`, margin, yPosition);
  doc.text(formatDate(data.purchaseDate), margin + 15, yPosition);
  
  if (data.stripePaymentId) {
    yPosition += 6;
    doc.text(`Référence paiement:`, margin, yPosition);
    doc.setFontSize(8);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.text(data.stripePaymentId.substring(0, 30) + '...', margin + 38, yPosition);
  }

  // Ligne de séparation stylisée
  yPosition += 12;
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  
  // Petite ligne décorative
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.3);
  doc.line(margin, yPosition + 0.5, pageWidth - margin, yPosition + 0.5);

  // Tableau des articles (style amélioré)
  yPosition += 8;
  
  // En-tête du tableau avec fond
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, yPosition - 6, pageWidth - (margin * 2), 10, 1, 1, 'F');
  
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Description', margin + 2, yPosition);
  doc.text('Qté', margin + 105, yPosition);
  doc.text('Prix unitaire', margin + 130, yPosition);
  doc.text('Total', pageWidth - margin - 2, yPosition, { align: 'right' });

  yPosition += 2;
  doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Détails de l'article (avec fond alterné)
  yPosition += 8;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, yPosition - 6, pageWidth - (margin * 2), 10, 1, 1, 'F');
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text(data.itemName, margin + 2, yPosition);
  doc.text(data.quantity.toString(), margin + 105, yPosition);
  doc.text(formatPrice(data.unitPrice, data.currency), margin + 130, yPosition);
  doc.setFont('helvetica', 'bold');
  doc.text(formatPrice(data.totalPrice, data.currency), pageWidth - margin - 2, yPosition, { align: 'right' });

  // Ligne de séparation stylisée
  yPosition += 4;
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(1);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);

  // Total (style amélioré avec encadré)
  yPosition += 12;
  const totalBoxWidth = 80;
  const totalBoxX = pageWidth - margin - totalBoxWidth;
  
  // Encadré pour le total
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setLineWidth(1.5);
  doc.roundedRect(totalBoxX, yPosition - 8, totalBoxWidth, 15, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.text('Total TTC:', totalBoxX + 5, yPosition);
  
  doc.setFontSize(13);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.text(formatPrice(data.totalPrice, data.currency), pageWidth - margin - 5, yPosition + 3, { align: 'right' });

  // Mentions légales en bas
  const footerY = doc.internal.pageSize.getHeight() - 40;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Facture générée automatiquement par Kawepla', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Cette facture est valable à des fins comptables et fiscales', pageWidth / 2, footerY + 5, { align: 'center' });
  doc.text(`Date d'émission: ${formatDate(new Date().toISOString())}`, pageWidth / 2, footerY + 10, { align: 'center' });

  // Télécharger le PDF
  doc.save(`facture-${data.invoiceNumber}.pdf`);
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
