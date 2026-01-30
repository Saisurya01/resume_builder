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

        // Import categorization utility
        const { categorizeKeywords } = require('../utils/keywordCategorizer');

        // Extract keywords from job description (filter words > 4 chars)
        const jdKeywords = jobDescription
            .split(/\W+/)
            .filter(w => w.length > 4)
            .map(w => w.trim())
            .filter(Boolean);

        // Extract keywords from resume
        const resumeWords = currentResumeText
            .split(/\W+/)
            .map(w => w.toLowerCase().trim());

        const resumeKeywordsSet = new Set(resumeWords);

        // Find missing keywords (case-insensitive comparison)
        const missingKeywords = jdKeywords.filter(keyword =>
            !resumeKeywordsSet.has(keyword.toLowerCase())
        );

        // Remove duplicates and limit to top 30 most relevant
        const uniqueMissing = [...new Set(missingKeywords)].slice(0, 30);

        console.log(`🔍 [OPTIMIZE] Found ${uniqueMissing.length} missing keywords`);

        // Categorize missing keywords
        const categorizedKeywords = categorizeKeywords(uniqueMissing);

        // Calculate ATS score
        const totalKeywords = [...new Set(jdKeywords)].length;
        const matchedKeywords = totalKeywords - uniqueMissing.length;
        const atsScore = totalKeywords > 0
            ? Math.round((matchedKeywords / totalKeywords) * 100)
            : 0;

        console.log(`✅ [OPTIMIZE] Analysis complete. ATS Score: ${atsScore}%`);
        console.log(`📊 [OPTIMIZE] Matched: ${matchedKeywords}/${totalKeywords} keywords`);

        res.json({
            categorizedKeywords,
            atsScore,
            totalKeywords,
            matchedKeywords,
            missingCount: uniqueMissing.length,
            // Legacy support
            suggestions: `Your resume matches ${atsScore}% of the job requirements. Consider adding the missing keywords below.`,
            missingKeywords: uniqueMissing
        });
    } catch (err) {
        console.error('❌ [OPTIMIZE] Unexpected error:', err);
        res.status(500).json({ error: `Error optimizing resume: ${err.message || 'Please try again.'}` });
    }
};

/**
 * Apply selected skills to resume data safely
 * POST /api/resume/apply-optimizations
 */
exports.applyOptimizations = async (req, res) => {
    try {
        console.log('✨ [APPLY] Apply optimizations request received');

        const { resumeData, selectedSkills } = req.body;

        if (!resumeData) {
            console.error('❌ [APPLY] Missing resume data');
            return res.status(400).json({ error: 'Resume data is required' });
        }

        if (!selectedSkills || typeof selectedSkills !== 'object') {
            console.error('❌ [APPLY] Invalid selected skills');
            return res.status(400).json({ error: 'Selected skills must be an object' });
        }

        console.log(`📝 [APPLY] Processing skill insertion...`);

        // Initialize updated resume data
        const updatedResumeData = JSON.parse(JSON.stringify(resumeData)); // Deep clone
        const addedSkills = [];
        const skippedDuplicates = [];

        // Helper function to add skill safely (no duplicates)
        const addSkillSafely = (existingSkills, newSkill) => {
            if (!existingSkills) existingSkills = '';

            const skillsArray = existingSkills
                .split(',')
                .map(s => s.trim())
                .filter(Boolean);

            const lowerSkills = skillsArray.map(s => s.toLowerCase());

            // Check for duplicate (case-insensitive)
            if (lowerSkills.includes(newSkill.toLowerCase())) {
                skippedDuplicates.push(newSkill);
                return existingSkills;
            }

            // Add new skill
            skillsArray.push(newSkill);
            return skillsArray.join(', ');
        };

        // Ensure skills object exists
        if (!updatedResumeData.skills) {
            updatedResumeData.skills = {
                technical: '',
                tools: '',
                softSkills: ''
            };
        }

        // Process each category
        const MAX_SKILLS_PER_SECTION = 20;

        // Technical Skills → skills.technical
        if (selectedSkills['Technical Skills'] && Array.isArray(selectedSkills['Technical Skills'])) {
            const currentCount = (updatedResumeData.skills.technical || '').split(',').filter(Boolean).length;

            if (currentCount >= MAX_SKILLS_PER_SECTION) {
                console.warn(`⚠️ [APPLY] Technical skills section at maximum capacity`);
            } else {
                selectedSkills['Technical Skills'].forEach(skill => {
                    updatedResumeData.skills.technical = addSkillSafely(
                        updatedResumeData.skills.technical,
                        skill
                    );
                    if (!skippedDuplicates.includes(skill)) {
                        addedSkills.push(skill);
                    }
                });
            }
        }

        // Programming Languages → skills.technical
        if (selectedSkills['Programming Languages'] && Array.isArray(selectedSkills['Programming Languages'])) {
            const currentCount = (updatedResumeData.skills.technical || '').split(',').filter(Boolean).length;

            if (currentCount >= MAX_SKILLS_PER_SECTION) {
                console.warn(`⚠️ [APPLY] Technical skills section at maximum capacity`);
            } else {
                selectedSkills['Programming Languages'].forEach(skill => {
                    updatedResumeData.skills.technical = addSkillSafely(
                        updatedResumeData.skills.technical,
                        skill
                    );
                    if (!skippedDuplicates.includes(skill)) {
                        addedSkills.push(skill);
                    }
                });
            }
        }

        // Tools & Technologies → skills.tools
        if (selectedSkills['Tools & Technologies'] && Array.isArray(selectedSkills['Tools & Technologies'])) {
            const currentCount = (updatedResumeData.skills.tools || '').split(',').filter(Boolean).length;

            if (currentCount >= MAX_SKILLS_PER_SECTION) {
                console.warn(`⚠️ [APPLY] Tools section at maximum capacity`);
            } else {
                selectedSkills['Tools & Technologies'].forEach(skill => {
                    updatedResumeData.skills.tools = addSkillSafely(
                        updatedResumeData.skills.tools,
                        skill
                    );
                    if (!skippedDuplicates.includes(skill)) {
                        addedSkills.push(skill);
                    }
                });
            }
        }

        // Soft Skills → skills.softSkills
        if (selectedSkills['Soft Skills'] && Array.isArray(selectedSkills['Soft Skills'])) {
            const currentCount = (updatedResumeData.skills.softSkills || '').split(',').filter(Boolean).length;

            if (currentCount >= MAX_SKILLS_PER_SECTION) {
                console.warn(`⚠️ [APPLY] Soft skills section at maximum capacity`);
            } else {
                selectedSkills['Soft Skills'].forEach(skill => {
                    updatedResumeData.skills.softSkills = addSkillSafely(
                        updatedResumeData.skills.softSkills,
                        skill
                    );
                    if (!skippedDuplicates.includes(skill)) {
                        addedSkills.push(skill);
                    }
                });
            }
        }

        // Domain Keywords → optionally add to summary (contextual)
        // For now, we'll skip this to avoid fabricating experience
        if (selectedSkills['Domain Keywords'] && Array.isArray(selectedSkills['Domain Keywords'])) {
            console.log(`ℹ️ [APPLY] Domain keywords skipped (manual addition recommended)`);
        }

        console.log(`✅ [APPLY] Added ${addedSkills.length} skills`);
        console.log(`⏭️ [APPLY] Skipped ${skippedDuplicates.length} duplicates`);

        res.json({
            success: true,
            updatedResumeData,
            addedSkills,
            skippedDuplicates,
            message: `Successfully added ${addedSkills.length} skill(s) to your resume`
        });
    } catch (err) {
        console.error('❌ [APPLY] Unexpected error:', err);
        res.status(500).json({ error: `Error applying optimizations: ${err.message || 'Please try again.'}` });
    }
};
