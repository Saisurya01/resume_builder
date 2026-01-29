const { validateAndCleanData } = require('./utils/cleaners');
const pdfGenerator = require('./utils/pdfGenerator');
const docxGenerator = require('./utils/docxGenerator');
const fs = require('fs');
const path = require('path');

const testPayload = JSON.parse(fs.readFileSync(path.join(__dirname, 'test_payload.json'), 'utf8'));

async function verify() {
    console.log('--- Verification Started ---');

    // 1. Test Validation
    console.log('\n[1/3] Testing Validation and Cleaning...');
    try {
        const cleaned = validateAndCleanData(testPayload);
        console.log('Success: Data cleaned.');

        // Assertions (simple console logs)
        if (cleaned.summary.includes('https://')) {
            console.error('FAIL: Raw URL remaining in summary!');
        } else {
            console.log('PASS: Raw URL stripped from summary.');
        }

        if (cleaned.experience[0].description[1].includes('https://')) {
            console.error('FAIL: Raw URL remaining in experience!');
        } else {
            console.log('PASS: Raw URL stripped from experience.');
        }

    } catch (e) {
        console.error('FAIL: Validation threw error:', e.message);
    }

    // 2. Test PDF Generation (Mock res)
    console.log('\n[2/3] Testing PDF Generation...');
    const pdfOut = fs.createWriteStream(path.join(__dirname, 'verify_test.pdf'));
    const pdfRes = {
        setHeader: (k, v) => console.log(`PDF Header: ${k}=${v}`),
        pipe: (stream) => {
            // pdfkit calls .pipe(res)
            // res should be a writable stream for pdfkit
        },
        // Mocks for a writable stream that pdfkit expects
        on: (ev, cb) => {
            if (ev === 'finish') pdfOut.on('finish', cb);
            return pdfRes;
        },
        once: (ev, cb) => pdfRes,
        emit: (ev, data) => { },
        write: (chunk) => pdfOut.write(chunk),
        end: () => pdfOut.end(),
        removeListener: () => pdfRes,
        writable: true
    };
    pdfGenerator.generatePDF(testPayload, pdfRes);

    await new Promise(resolve => pdfOut.on('finish', () => {
        console.log('PASS: PDF generated (verify_test.pdf)');
        resolve();
    }));

    // 3. Test DOCX Generation
    console.log('\n[3/3] Testing DOCX Generation...');
    const docxRes = {
        setHeader: (k, v) => console.log(`DOCX Header: ${k}=${v}`),
        send: (buffer) => {
            fs.writeFileSync(path.join(__dirname, 'verify_test.docx'), buffer);
            console.log('PASS: DOCX generated (verify_test.docx)');
        }
    };
    await docxGenerator.generateDocx(testPayload, docxRes);

    console.log('\n--- Verification Script Complete ---');
}

verify().catch(console.error);
