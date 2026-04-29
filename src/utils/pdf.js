const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const env = require('../config/env');

const generateReceiptPdf = ({ payment, user, property }) =>
  new Promise((resolve, reject) => {
    const receiptsDir = path.join(process.cwd(), 'public', 'receipts');
    fs.mkdirSync(receiptsDir, { recursive: true });
    const fileName = `${payment._id}.pdf`;
    const fullPath = path.join(receiptsDir, fileName);
    const fileStream = fs.createWriteStream(fullPath);
    const doc = new PDFDocument({ margin: 48 });

    doc.pipe(fileStream);
    doc.fontSize(24).fillColor('#123047').text('Rent Payment Receipt');
    doc.moveDown();
    doc.fontSize(12).fillColor('#3f5672').text(`Receipt Number: ${payment.receiptNumber}`);
    doc.text(`Transaction ID: ${payment.transactionId || 'Pending confirmation'}`);
    doc.text(`Paid Date: ${payment.paidDate ? new Date(payment.paidDate).toLocaleString() : '-'}`);
    doc.moveDown();
    doc.fontSize(14).fillColor('#123047').text('Tenant');
    doc.fontSize(12).fillColor('#3f5672').text(user.fullName);
    doc.text(user.email);
    doc.text(user.phone);
    doc.moveDown();
    doc.fontSize(14).fillColor('#123047').text('Property');
    doc.fontSize(12).fillColor('#3f5672').text(property.title);
    doc.text(`${property.address?.line1 || ''}, ${property.address?.city || ''}`);
    doc.moveDown();
    doc.fontSize(14).fillColor('#123047').text('Payment');
    doc.fontSize(12).fillColor('#3f5672').text(`Amount: ${payment.currency.toUpperCase()} ${payment.amount}`);
    doc.text(`Month: ${payment.month}`);
    doc.text(`Status: ${payment.status}`);
    doc.end();

    fileStream.on('finish', () => {
      resolve({
        fileName,
        fullPath,
        url: `${env.appBaseUrl}/public/receipts/${fileName}`,
      });
    });

    fileStream.on('error', reject);
  });

module.exports = {
  generateReceiptPdf,
};
