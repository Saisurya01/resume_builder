const pdfGenerator = require('../utils/pdfGenerator');
const docxGenerator = require('../utils/docxGenerator');
const { validateAndCleanData } = require('../utils/cleaners');
const fs = require('fs');
const pdfParse = require('pdf-parse-fork');
const mammoth = require('mammoth');
const path = require('path');

exports.createResume = async (req, res) => {
    try {
        console.log('Received resume generation request');
        let resumeData = req.body;
        const format = req.query.format || 'pdf';

        // Ensure personalInfo exists for ATS-optimized resume flow
        if (!resumeData.personalInfo) resumeData.personalInfo = {};
        if (!resumeData.personalInfo.fullName) resumeData.personalInfo.fullName = 'Resume';

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
        console.log('📤 [UPLOAD] Resume upload request received');

        if (!req.file) {
            console.error('❌ [UPLOAD] No file in request');
            return res.status(400).json({ error: 'No resume file uploaded' });
        }

        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname.toLowerCase();
        const fileSize = req.file.buffer.length;

        console.log(`📄 [UPLOAD] Processing file: ${originalName}`);
        console.log(`📊 [UPLOAD] MIME type: ${mimeType}, Size: ${(fileSize / 1024).toFixed(2)} KB`);

        // File size validation (10MB limit)
        if (fileSize > 10 * 1024 * 1024) {
            console.error('❌ [UPLOAD] File too large');
            return res.status(400).json({ error: 'File size exceeds 10MB limit' });
        }

        let extractedText = '';

        // Use req.file.buffer for memory storage
        if (mimeType === 'application/pdf' || originalName.endsWith('.pdf')) {
            console.log('🔍 [UPLOAD] Parsing PDF...');
            try {
                const data = await pdfParse(req.file.buffer);
                extractedText = data.text;
                console.log(`✅ [UPLOAD] PDF parsed successfully, extracted ${extractedText.length} characters`);
            } catch (pdfError) {
                console.error('❌ [UPLOAD] PDF parsing failed:', pdfError.message);
                return res.status(400).json({
                    error: 'Failed to parse PDF. The file may be corrupted or password-protected.'
                });
            }
        } else if (
            mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
            originalName.endsWith('.docx')
        ) {
            console.log('🔍 [UPLOAD] Parsing DOCX...');
            try {
                const result = await mammoth.extractRawText({ buffer: req.file.buffer });
                extractedText = result.value;
                console.log(`✅ [UPLOAD] DOCX parsed successfully, extracted ${extractedText.length} characters`);
            } catch (docxError) {
                console.error('❌ [UPLOAD] DOCX parsing failed:', docxError.message);
                return res.status(400).json({
                    error: 'Failed to parse DOCX. The file may be corrupted.'
                });
            }
        } else {
            console.error(`❌ [UPLOAD] Unsupported format: ${mimeType}`);
            return res.status(400).json({ error: 'Unsupported file format. Please upload PDF or DOCX.' });
        }

        // Validation
        if (!extractedText || extractedText.trim().length < 50) {
            console.error(`❌ [UPLOAD] Insufficient text extracted (${extractedText.trim().length} chars)`);
            return res.status(400).json({
                error: 'Resume text could not be extracted. Please upload a text-based PDF or DOCX (not a scanned image).'
            });
        }

        console.log(`✅ [UPLOAD] Successfully extracted ${extractedText.trim().length} characters`);
        res.json({ text: extractedText.trim() });
    } catch (err) {
        console.error('❌ [UPLOAD] Unexpected error:', err);
        res.status(500).json({ error: `Failed to parse resume file: ${err.message || 'Unknown error'}` });
    }
};


exports.optimizeResume = async (req, res) => {
    try {
        console.log('🎯 [OPTIMIZE] Resume optimization request received');

        const { currentResumeText, jobDescription } = req.body;

        if (!currentResumeText || currentResumeText.trim().length === 0) {
            console.error('❌ [OPTIMIZE] Missing resume text');
            return res.status(400).json({ error: 'Resume text is missing or empty.' });
        }

        if (!jobDescription || jobDescription.trim().length === 0) {
            console.error('❌ [OPTIMIZE] Missing job description');
            return res.status(400).json({ error: 'Job description is missing or empty.' });
        }

        console.log(`📝 [OPTIMIZE] Resume length: ${currentResumeText.length} chars`);
        console.log(`📋 [OPTIMIZE] JD length: ${jobDescription.length} chars`);

        const atsAnalyzer = require('../utils/atsAnalyzer');
        const { parseResumeText } = require('../utils/resumeParser');

        // Extract JD keywords (categorized)
        const jdCategorized = atsAnalyzer.extractKeywordsFromText(jobDescription);
        const resumeSet = atsAnalyzer.resumeKeywordSet(currentResumeText);
        const { matched: matchedCategorized, missing: missingCategorized } = atsAnalyzer.compareKeywords(jdCategorized, resumeSet);

        // Only return MISSING keywords for the checklist (user selects which they have)
        const categorizedKeywords = missingCategorized;

        const totalKeywords = atsAnalyzer.totalJdKeywords(jdCategorized);
        const matchedKeywords = atsAnalyzer.totalMatchedKeywords(matchedCategorized);
        const parsedResume = parseResumeText(currentResumeText);
        const atsScore = atsAnalyzer.computeATSScore(matchedKeywords, totalKeywords, parsedResume);

        const missingCount = Object.values(missingCategorized).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
        console.log(`🔍 [OPTIMIZE] Found ${missingCount} missing keywords`);
        console.log(`✅ [OPTIMIZE] Analysis complete. ATS Score: ${atsScore}%`);
        console.log(`📊 [OPTIMIZE] Matched: ${matchedKeywords}/${totalKeywords} keywords`);

        res.json({
            categorizedKeywords,
            atsScore,
            totalKeywords,
            matchedKeywords,
            missingCount,
            suggestions: `Your resume matches ${atsScore}% of the job requirements. Select only the skills you actually have below.`,
            missingKeywords: Object.values(missingCategorized).flat()
        });
    } catch (err) {
        console.error('❌ [OPTIMIZE] Unexpected error:', err);
        res.status(500).json({ error: `Error optimizing resume: ${err.message || 'Please try again.'}` });
    }
};

/**
 * Apply selected skills to resume data safely. User approval is mandatory — only selected skills are added.
 * POST /api/resume/apply-optimizations
 * Body: { resumeText, selectedSkills, jobDescription? }
 */
exports.applyOptimizations = async (req, res) => {
    try {
        console.log('✨ [APPLY] Apply optimizations request received');

        const { resumeText, selectedSkills, jobDescription } = req.body;

        if (!resumeText || typeof resumeText !== 'string' || resumeText.trim().length === 0) {
            console.error('❌ [APPLY] Missing resume text');
            return res.status(400).json({ error: 'Resume text is required.' });
        }

        if (!selectedSkills || typeof selectedSkills !== 'object') {
            console.error('❌ [APPLY] Invalid selected skills');
            return res.status(400).json({ error: 'Selected skills must be an object.' });
        }

        const { parseResumeText } = require('../utils/resumeParser');
        const atsAnalyzer = require('../utils/atsAnalyzer');
        const { validateAndFixResume } = require('../utils/atsValidator');

        // Parse uploaded resume into structured data
        let updatedResumeData = parseResumeText(resumeText.trim());
        const addedSkills = [];
        const skippedDuplicates = [];

        // ATS score BEFORE (for before/after)
        let atsScoreBefore = 0;
        if (jobDescription && jobDescription.trim()) {
            const jdCategorized = atsAnalyzer.extractKeywordsFromText(jobDescription);
            const resumeSetBefore = atsAnalyzer.resumeKeywordSet(resumeText);
            const totalJd = atsAnalyzer.totalJdKeywords(jdCategorized);
            const matchedBefore = atsAnalyzer.totalMatchedKeywords(
                atsAnalyzer.compareKeywords(jdCategorized, resumeSetBefore).matched
            );
            atsScoreBefore = atsAnalyzer.computeATSScore(matchedBefore, totalJd, updatedResumeData);
        }

        // Helper: add skill safely (no duplicates, clean comma-separated)
        const addSkillSafely = (existingSkills, newSkill) => {
            if (!existingSkills) existingSkills = '';
            const skillsArray = existingSkills.split(',').map(s => s.trim()).filter(Boolean);
            const lowerSkills = skillsArray.map(s => s.toLowerCase());
            if (lowerSkills.includes((newSkill || '').toLowerCase())) {
                skippedDuplicates.push(newSkill);
                return existingSkills;
            }
            skillsArray.push(newSkill);
            return skillsArray.join(', ');
        };

        if (!updatedResumeData.skills) {
            updatedResumeData.skills = { technical: '', tools: '', softSkills: '' };
        }

        const MAX_SKILLS_PER_SECTION = 20;

        // Technical Skills & Programming Languages → skills.technical
        ['Technical Skills', 'Programming Languages'].forEach(cat => {
            if (selectedSkills[cat] && Array.isArray(selectedSkills[cat])) {
                selectedSkills[cat].forEach(skill => {
                    updatedResumeData.skills.technical = addSkillSafely(updatedResumeData.skills.technical, skill);
                    if (!skippedDuplicates.includes(skill)) addedSkills.push(skill);
                });
            }
        });

        // Tools & Technologies → skills.tools
        if (selectedSkills['Tools & Technologies'] && Array.isArray(selectedSkills['Tools & Technologies'])) {
            selectedSkills['Tools & Technologies'].forEach(skill => {
                updatedResumeData.skills.tools = addSkillSafely(updatedResumeData.skills.tools, skill);
                if (!skippedDuplicates.includes(skill)) addedSkills.push(skill);
            });
        }

        // Soft Skills → skills.softSkills
        if (selectedSkills['Soft Skills'] && Array.isArray(selectedSkills['Soft Skills'])) {
            selectedSkills['Soft Skills'].forEach(skill => {
                updatedResumeData.skills.softSkills = addSkillSafely(updatedResumeData.skills.softSkills, skill);
                if (!skippedDuplicates.includes(skill)) addedSkills.push(skill);
            });
        }

        // Domain Keywords: do not auto-inject; skip to avoid fabricating experience
        if (selectedSkills['Domain Keywords'] && Array.isArray(selectedSkills['Domain Keywords'])) {
            console.log('ℹ️ [APPLY] Domain keywords not auto-added (manual addition recommended)');
        }

        // Optional safe context enhancement: add ONE selected skill into an existing bullet if it fits (no fabrication)
        const technicalAndTools = [
            ...(selectedSkills['Technical Skills'] || []),
            ...(selectedSkills['Programming Languages'] || []),
            ...(selectedSkills['Tools & Technologies'] || [])
        ];
        if (technicalAndTools.length > 0 && updatedResumeData.experience && updatedResumeData.experience.length > 0) {
            const used = new Set();
            for (const exp of updatedResumeData.experience) {
                const desc = Array.isArray(exp.description) ? exp.description : (exp.description ? [exp.description] : []);
                for (let i = 0; i < desc.length; i++) {
                    const bullet = (desc[i] || '').trim();
                    if (bullet.length < 20) continue;
                    for (const skill of technicalAndTools) {
                        if (used.has(skill)) continue;
                        const skillLower = skill.toLowerCase();
                        if (bullet.toLowerCase().includes(skillLower)) { used.add(skill); continue; }
                        // Only add if bullet is clearly technical (e.g. "Built", "Developed", "Implemented")
                        if (/\b(built|developed|implemented|used|wrote|designed|created)\b/i.test(bullet)) {
                            const newBullet = bullet.replace(/([.!])\s*$/, '') + ` using ${skill}.`;
                            desc[i] = newBullet;
                            used.add(skill);
                            break; // one keyword per bullet max
                        }
                    }
                }
                exp.description = desc;
            }
        }

        // Validate: no stuffing, ATS-readable
        updatedResumeData = validateAndFixResume(updatedResumeData);

        // Recalculate ATS score AFTER
        let atsScoreAfter = atsScoreBefore;
        if (jobDescription && jobDescription.trim()) {
            const resumeTextAfter = buildResumeTextForScoring(updatedResumeData);
            const jdCategorized = atsAnalyzer.extractKeywordsFromText(jobDescription);
            const resumeSetAfter = atsAnalyzer.resumeKeywordSet(resumeTextAfter);
            const totalJd = atsAnalyzer.totalJdKeywords(jdCategorized);
            const matchedAfter = atsAnalyzer.totalMatchedKeywords(
                atsAnalyzer.compareKeywords(jdCategorized, resumeSetAfter).matched
            );
            atsScoreAfter = atsAnalyzer.computeATSScore(matchedAfter, totalJd, updatedResumeData);
        }

        console.log(`✅ [APPLY] Added ${addedSkills.length} skills. ATS: ${atsScoreBefore}% → ${atsScoreAfter}%`);

        res.json({
            success: true,
            updatedResumeData,
            addedSkills,
            skippedDuplicates,
            atsScoreBefore,
            atsScoreAfter,
            message: `Successfully added ${addedSkills.length} skill(s). ATS score: ${atsScoreBefore}% → ${atsScoreAfter}%.`
        });
    } catch (err) {
        console.error('❌ [APPLY] Unexpected error:', err);
        res.status(500).json({ error: `Error applying optimizations: ${err.message || 'Please try again.'}` });
    }
};

/** Build a flat text representation of resume for ATS re-scoring */
function buildResumeTextForScoring(data) {
    const parts = [];
    if (data.personalInfo) {
        parts.push(data.personalInfo.fullName, data.personalInfo.email, data.personalInfo.phone);
    }
    if (data.summary) parts.push(data.summary);
    if (data.skills) {
        parts.push(data.skills.technical, data.skills.tools, data.skills.softSkills);
    }
    if (data.experience && data.experience.length) {
        data.experience.forEach(e => {
            const desc = Array.isArray(e.description) ? e.description.join(' ') : (e.description || '');
            parts.push(e.title, e.company, desc);
        });
    }
    if (data.education && data.education.length) {
        data.education.forEach(e => parts.push(e.qualification, e.stream, e.institute));
    }
    if (data.projects && data.projects.length) {
        data.projects.forEach(p => parts.push(p.title, p.description));
    }
    return parts.filter(Boolean).join(' ');
}
