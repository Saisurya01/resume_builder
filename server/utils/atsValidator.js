/**
 * ATS Validator - Ensures no keyword stuffing, resume remains truthful, ATS-readable.
 * Run before returning updated resume or before PDF generation.
 */

const { normalizeKeyword } = require('./keywordCategorizer');

const MAX_SAME_KEYWORD_IN_SECTION = 2;   // same keyword max 2 times in one section
const MAX_SKILLS_PER_SECTION = 25;      // cap to avoid stuffing

/**
 * Remove duplicate skills (case-insensitive) and trim. No fabrication.
 */
function dedupeSkills(skillsString) {
    if (!skillsString || typeof skillsString !== 'string') return '';
    const arr = skillsString.split(',').map(s => s.trim()).filter(Boolean);
    const seen = new Set();
    const out = [];
    for (const s of arr) {
        const norm = normalizeKeyword(s);
        if (seen.has(norm)) continue;
        seen.add(norm);
        out.push(s);
    }
    return out.slice(0, MAX_SKILLS_PER_SECTION).join(', ');
}

/**
 * Ensure resume data has no keyword stuffing: same keyword repeated too many times in one section.
 * Fix: dedupe skills sections and cap length.
 */
function validateNoKeywordStuffing(data) {
    const fixed = JSON.parse(JSON.stringify(data));
    if (fixed.skills) {
        if (fixed.skills.technical) fixed.skills.technical = dedupeSkills(fixed.skills.technical);
        if (fixed.skills.tools) fixed.skills.tools = dedupeSkills(fixed.skills.tools);
        if (fixed.skills.softSkills) fixed.skills.softSkills = dedupeSkills(fixed.skills.softSkills);
    }
    return fixed;
}

/**
 * Ensure required fields exist for ATS readability (section presence).
 */
function validateATSReadable(data) {
    const fixed = JSON.parse(JSON.stringify(data));
    if (!fixed.personalInfo) fixed.personalInfo = { fullName: 'Resume', email: '', phone: '', city: '', state: '', country: '', linkedin: '', github: '', portfolio: '', youtube: '' };
    if (!fixed.personalInfo.fullName) fixed.personalInfo.fullName = 'Resume';
    if (!fixed.skills) fixed.skills = { technical: '', tools: '', softSkills: '' };
    if (!Array.isArray(fixed.experience)) fixed.experience = [];
    if (!Array.isArray(fixed.education)) fixed.education = [];
    if (!Array.isArray(fixed.projects)) fixed.projects = [];
    if (!Array.isArray(fixed.certifications)) fixed.certifications = [];
    if (!Array.isArray(fixed.languages)) fixed.languages = [];
    return fixed;
}

/**
 * Run all validations and return fixed data. Does not fabricate experience.
 */
function validateAndFixResume(data) {
    let out = validateNoKeywordStuffing(data);
    out = validateATSReadable(out);
    return out;
}

module.exports = {
    validateNoKeywordStuffing,
    validateATSReadable,
    validateAndFixResume,
    dedupeSkills
};
