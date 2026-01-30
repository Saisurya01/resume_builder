const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse-fork');
const mammoth = require('mammoth');

async function testExtraction() {
    console.log('--- Testing Extraction Logic ---');

    const pdfPath = path.join(__dirname, 'verify_test.pdf');
    const docxPath = path.join(__dirname, 'verify_test.docx');

    // Test PDF
    if (fs.existsSync(pdfPath)) {
        console.log('\nTesting PDF Extraction (Buffer)...');
        try {
            const dataBuffer = fs.readFileSync(pdfPath);
            const data = await pdfParse(dataBuffer);
            console.log('PDF Text successfully extracted from buffer.');
            console.log('Sample text:', data.text.substring(0, 100) + '...');
        } catch (e) {
            console.error('PDF Extraction FAILED:', e.message);
        }
    } else {
        console.log('PDF test file not found at', pdfPath);
    }

    // Test DOCX
    if (fs.existsSync(docxPath)) {
        console.log('\nTesting DOCX Extraction (Buffer)...');
        try {
            const dataBuffer = fs.readFileSync(docxPath);
            const result = await mammoth.extractRawText({ buffer: dataBuffer });
            console.log('DOCX Text successfully extracted from buffer.');
            console.log('Sample text:', result.value.substring(0, 100) + '...');
        } catch (e) {
            console.error('DOCX Extraction FAILED:', e.message);
        }
    } else {
        console.log('DOCX test file not found at', docxPath);
    }
}

testExtraction().catch(console.error);
