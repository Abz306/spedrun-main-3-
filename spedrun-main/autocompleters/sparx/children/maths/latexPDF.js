const PDFDocument = require('pdfkit');

function formatPdfValue(value) {
    if (value === undefined || value === null) return '';
    if (typeof value !== 'object') return String(value);
    if (Array.isArray(value)) return value.map(formatPdfValue).filter(Boolean).join(', ');
    return String(value.value ?? value.answer ?? value.response ?? value.text ?? JSON.stringify(value));
}

function normalizeBookworks(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return [];

    return Object.entries(obj).map(([code, value]) => {
        if (value && typeof value === 'object') {
            const answer = value.answer ?? value.response ?? '';
            const question = value.question?.questionText ?? value.question ?? '';
            return {
                code: String(code),
                answer: formatPdfValue(answer),
                question: Array.isArray(question) ? question.join('\n') : String(question)
            };
        }

        return { code: String(code), answer: String(value ?? ''), question: '' };
    });
}

function stringifyPdfText(value) {
    return String(value ?? '')
        .replace(/\\n/g, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
}

async function convertToPDF(obj, packageID) {
    const items = normalizeBookworks(obj);
    if (items.length === 0) return null;

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50, info: {
            Title: `Bookwork codes for ${packageID}`,
            Author: 'Hielke AI'
        } });
        const chunks = [];

        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        doc.font('Helvetica-Bold').fontSize(22).text('Hielke AI - Bookwork Codes');
        doc.moveDown(0.35);
        doc.font('Helvetica').fontSize(10).fillColor('#555555')
            .text(`Package: ${String(packageID || 'Unknown')}`);
        doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`);
        doc.moveDown();

        items.forEach((item, index) => {
            if (index > 0 && doc.y > 650) doc.addPage();

            doc.fillColor('#000000').font('Helvetica-Bold').fontSize(15)
                .text(`Bookwork code: ${item.code}`);
            doc.moveDown(0.35);

            const question = stringifyPdfText(item.question);
            const answer = stringifyPdfText(item.answer);

            if (question) {
                doc.font('Helvetica-Bold').fontSize(11).text('Question');
                doc.font('Helvetica').fontSize(10).text(question, { lineGap: 2 });
                doc.moveDown(0.5);
            }

            doc.font('Helvetica-Bold').fontSize(11).text('Answer');
            doc.font('Helvetica').fontSize(12).text(answer || 'No answer recorded', { lineGap: 2 });

            if (index < items.length - 1) {
                doc.moveDown(1.2);
                doc.strokeColor('#CCCCCC').moveTo(50, doc.y).lineTo(545, doc.y).stroke();
                doc.moveDown(0.8);
            }
        });

        doc.end();
    });
}

module.exports = { convertToPDF };
