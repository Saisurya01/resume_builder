const fs = require('fs');
const path = require('path');
const { uploadResume, optimizeResume } = require('./controllers/resumeController');

// Mock request and response
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.body = data;
        return res;
    };
    res.send = (data) => {
        res.body = data;
        return res;
    };
    return res;
};

async function testResiliency() {
    console.log('--- Testing Resume Analysis Resiliency (Offline Mode) ---');

    // 1. Test uploadResume (Text Extraction)
    console.log('\n[1/2] Testing uploadResume...');
    const pdfPath = path.join(__dirname, 'verify_test.pdf');
    if (fs.existsSync(pdfPath)) {
        const req = {
            file: {
                buffer: fs.readFileSync(pdfPath),
                mimetype: 'application/pdf',
                originalname: 'test_resume.pdf'
            }
        };
        const res = mockRes();
        await uploadResume(req, res);

        if (res.statusCode === 200 || !res.statusCode) {
            console.log('✅ PASS: Resume text extracted successfully.');
            // console.log('Sample text:', res.body.text.substring(0, 100) + '...');
        } else {
            console.error('❌ FAIL: Extraction failed with status', res.statusCode, res.body);
        }
    } else {
        console.log('PDF test file not found, skipping upload test.');
    }

    // 2. Test optimizeResume
    console.log('\n[2/2] Testing optimizeResume...');
    const reqOptimize = {
        body: {
            currentResumeText: 'Experienced software engineer skilled in React, Node.js, and JavaScript.',
            jobDescription: 'Seeking a Senior Developer with expertise in Python, React, and Cloud Computing.'
        }
    };
    const resOptimize = mockRes();
    await optimizeResume(reqOptimize, resOptimize);

    if (resOptimize.statusCode === 200 || !resOptimize.statusCode) {
        console.log('✅ PASS: Optimization logic executed successfully.');
        console.log('Suggestions:', resOptimize.body.suggestions);
    } else {
        console.error('❌ FAIL: Optimization failed with status', resOptimize.statusCode, resOptimize.body);
    }

    console.log('\n--- Resiliency Test Complete ---');
}

testResiliency().catch(console.error);
