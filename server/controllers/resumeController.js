const Resume = require('../models/Resume');
const pdfGenerator = require('../utils/pdfGenerator');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

exports.createResume = async (req, res) => {
    try {
        console.log('Received resume generation request');
        const resumeData = req.body;

        // Save to DB (optional, but good for history)
        try {
            const newResume = new Resume(resumeData);
            await newResume.save();
            console.log('Resume saved to database');
        } catch (dbError) {
            console.warn('Failed to save to database, proceeding with PDF generation:', dbError.message);
        }

        // Generate PDF
        console.log('Starting PDF generation');
        pdfGenerator.generatePDF(resumeData, res);

        // Response is handled by the stream in generatePDF (piped to res)
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
