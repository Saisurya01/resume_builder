const pdfGenerator = require('../utils/pdfGenerator');
const docxGenerator = require('../utils/docxGenerator');
const { validateAndCleanData } = require('../utils/cleaners');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

exports.createResume = async (req, res) => {
    try {
        console.log('Received resume generation request');
        let resumeData = req.body;
        const format = req.query.format || 'pdf';

        // 1. HARD VALIDATION & CLEANING
        console.log('[Controller] Validating and cleaning data...');
        try {
            resumeData = validateAndCleanData(resumeData);
            console.log('[Controller] Validation successful.');
        } catch (validationError) {
            console.error('[Controller] Validation FAILED:', validationError.message);
            return res.status(400).json({ error: validationError.message });
        }

        // 2. Generate Document
        if (format === 'docx') {
            console.log('Starting DOCX generation');
            await docxGenerator.generateDocx(resumeData, res);
        } else {
            console.log('Starting PDF generation');
            pdfGenerator.generatePDF(resumeData, res);
        }

    } catch (err) {
        console.error('Error in createResume:', err);
        if (!res.headersSent) {
            res.status(500).send('Server Error');
        }
    }
};

exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);

        // Cleanup
        fs.unlinkSync(req.file.path);

        res.json({ text: data.text });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error parsing PDF');
    }
};

exports.optimizeResume = async (req, res) => {
    try {
        const { currentResumeText, jobDescription } = req.body;

        // logic to extract keywords from JD and compare with resume
        // Simple keyword extraction (naive)
        const jdKeywords = jobDescription.split(/\W+/).filter(w => w.length > 4);
        const resumeKeywords = new Set(currentResumeText.split(/\W+/));

        const missingKeywords = jdKeywords.filter(k => !resumeKeywords.has(k));
        const uniqueMissing = [...new Set(missingKeywords)].slice(0, 10);

        res.json({
            suggestions: `Consider adding these keywords: ${uniqueMissing.join(', ')}`,
            missingKeywords: uniqueMissing
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error optimizing resume');
    }
};
