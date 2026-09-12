const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoicePDF = async (payment) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `invoice_${payment.gateway_transaction_id}.pdf`;
    
    // Define the folder path and auto-create it if it is missing
    const dirPath = path.join(__dirname, '../../public/invoices');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    
    const filePath = path.join(dirPath, fileName);
    const writeStream = fs.createWriteStream(filePath);
    writeStream.on('finish', () => resolve(`/invoices/${fileName}`));
    writeStream.on('error', reject);
    doc.pipe(writeStream);

    // Header
    doc.fontSize(20).text('UNFAZED THERAPY PORTAL', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('TAX INVOICE', { align: 'center' });
    doc.moveDown();

    // Invoice Details
    doc.fontSize(10)
       .text(`Transaction ID: ${payment.gateway_transaction_id}`)
       .text(`Date: ${new Date().toLocaleDateString()}`)
       .text(`Package: ${payment.packageType}`);
    
    doc.moveDown();

    // Financials
    doc.text(`Total Amount: INR ${payment.total_amount}`);
    doc.text(`Platform Fee: INR ${payment.platform_fee}`);
    doc.text(`Net to Therapist: INR ${payment.net_amount}`);
    
    doc.moveDown();
    doc.text('Thank you for choosing Unfazed.', { align: 'center', italic: true });

    doc.end();
  });
};