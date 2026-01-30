/**
 * ATS Analyzer - JD/Resume keyword extraction, matching, and score calculation.
 * Used for: extract JD keywords (categorized), extract resume keywords, compute match and ATS score.
 */

const { categorizeKeyword, normalizeKeyword } = require('./keywordCategorizer');

// Display names for common abbreviations (for UI)
const NORMALIZE_DISPLAY = {
    js: 'JavaScript', javascript: 'JavaScript',
    ts: 'TypeScript', typescript: 'TypeScript',
    py: 'Python', python: 'Python',
    java: 'Java', node: 'Node.js', nodejs: 'Node.js', 'node.js': 'Node.js',
    react: 'React', reactjs: 'React',
    html: 'HTML', css: 'CSS', sql: 'SQL',
    aws: 'AWS', gcp: 'GCP', azure: 'Azure',
    ml: 'Machine Learning', ai: 'Artificial Intelligence',
    api: 'API', rest: 'REST', graphql: 'GraphQL',
    ci: 'CI/CD', cd: 'CI/CD', 'ci/cd': 'CI/CD',
    devops: 'DevOps', agile: 'Agile', scrum: 'Scrum',
    pm: 'Project Management', 'project management': 'Project Management'
};

function toDisplayName(keyword) {
    if (!keyword || typeof keyword !== 'string') return keyword;
    const lower = keyword.toLowerCase().trim();
    return NORMALIZE_DISPLAY[lower] || (keyword.charAt(0).toUpperCase() + keyword.slice(1).toLowerCase());
}

/**
 * Extract words and short phrases (2-3 words) from text for keyword matching.
 * Returns deduplicated list of tokens (words length >= 2, and known phrases).
 */
function tokenizeForKeywords(text) {
    if (!text || typeof text !== 'string') return [];
    const normalized = text.replace(/\s+/g, ' ').trim();
    const words = normalized.split(/\W+/).map(w => w.trim()).filter(w => w.length >= 2);
    const phrases = [];
    const phrasePatterns = [
        /\b(machine learning|deep learning|data science|project management|problem solving|critical thinking|team (work|leadership)|cross[- ]?functional|time management|communication skills)\b/gi,
        /\b(react native|node\.?js|angular|vue\.?js|ruby on rails|asp\.?net|spring boot)\b/gi,
        /\b(rest api|graphql|microservices|cloud computing|aws|azure|gcp|ci\/cd|devops)\b/gi
    ];
    phrasePatterns.forEach(re => {
        let m;
        while ((m = re.exec(normalized)) !== null) {
            phrases.push(m[1].toLowerCase().replace(/\s+/g, ' '));
        }
    });
    const all = [...words.map(w => w.toLowerCase()), ...phrases];
    return [...new Set(all)];
}

/**
 * Extract and categorize keywords from job description or resume text.
 * @param {string} text - JD or resume text
 * @returns {Object} - { 'Technical Skills': [], 'Programming Languages': [], 'Tools & Technologies': [], 'Soft Skills': [], 'Domain Keywords': [] }
 */
function extractKeywordsFromText(text) {
    const tokens = tokenizeForKeywords(text);
    const categorized = {
        'Technical Skills': [],
        'Programming Languages': [],
        'Tools & Technologies': [],
        'Soft Skills': [],
        'Domain Keywords': []
    };
    const seen = new Set();
    for (const token of tokens) {
        const norm = normalizeKeyword(token);
        if (seen.has(norm)) continue;
        seen.add(norm);
        const category = categorizeKeyword(token);
        const display = toDisplayName(token);
        if (!categorized[category].includes(display) && !categorized[category].some(k => normalizeKeyword(k) === norm)) {
            categorized[category].push(display);
        }
    }
    return categorized;
}

/**
 * Build a set of normalized keywords from resume text (for matching).
 */
function resumeKeywordSet(resumeText) {
    const categorized = extractKeywordsFromText(resumeText);
    const set = new Set();
    Object.values(categorized).forEach(arr => {
        arr.forEach(k => set.add(normalizeKeyword(k)));
    });
    const words = (resumeText || '').split(/\W+/).filter(w => w.length >= 2);
    words.forEach(w => set.add(normalizeKeyword(w)));
    return set;
}

/**
 * Compare JD keywords vs resume: matched and missing per category.
 * @param {Object} jdCategorized - Categorized JD keywords
 * @param {Set} resumeSet - Normalized resume keyword set
 * @returns {Object} - { matched: categorized, missing: categorized }
 */
function compareKeywords(jdCategorized, resumeSet) {
    const matched = {
        'Technical Skills': [],
        'Programming Languages': [],
        'Tools & Technologies': [],
        'Soft Skills': [],
        'Domain Keywords': []
    };
    const missing = {
        'Technical Skills': [],
        'Programming Languages': [],
        'Tools & Technologies': [],
        'Soft Skills': [],
        'Domain Keywords': []
    };
    for (const [category, keywords] of Object.entries(jdCategorized)) {
        if (!Array.isArray(keywords)) continue;
        for (const kw of keywords) {
            const norm = normalizeKeyword(kw);
            if (resumeSet.has(norm)) {
                matched[category].push(kw);
            } else {
                missing[category].push(kw);
            }
        }
    }
    return { matched, missing };
}

/**
 * Compute ATS score (0-100) based on:
 * - Skill/keyword match (primary)
 * - Section presence (summary, skills, experience, education)
 */
function computeATSScore(matchedKeywords, totalJdKeywords, parsedResume) {
    let score = 0;
    const total = totalJdKeywords || 1;
    const matchRatio = matchedKeywords / total;
    score += Math.round(matchRatio * 75); // 75% weight on keyword match

    let sectionScore = 0;
    if (parsedResume) {
        if (parsedResume.summary && parsedResume.summary.trim().length > 20) sectionScore += 5;
        if (parsedResume.skills && (parsedResume.skills.technical || parsedResume.skills.tools || parsedResume.skills.softSkills)) sectionScore += 5;
        if (parsedResume.experience && parsedResume.experience.length > 0) sectionScore += 10;
        if (parsedResume.education && parsedResume.education.length > 0) sectionScore += 5;
        if (parsedResume.personalInfo && (parsedResume.personalInfo.email || parsedResume.personalInfo.phone)) sectionScore += 5;
    }
    score += Math.min(sectionScore, 25); // cap 25% for sections
    return Math.min(100, Math.max(0, score));
}

/**
 * Count total unique JD keywords (across categories).
 */
function totalJdKeywords(jdCategorized) {
    const set = new Set();
    Object.values(jdCategorized).forEach(arr => {
        (arr || []).forEach(k => set.add(normalizeKeyword(k)));
    });
    return set.size;
}

/**
 * Count matched keywords (across categories).
 */
function totalMatchedKeywords(matchedCategorized) {
    return Object.values(matchedCategorized || {}).reduce((sum, arr) => sum + (arr ? arr.length : 0), 0);
}

module.exports = {
    extractKeywordsFromText,
    resumeKeywordSet,
    compareKeywords,
    computeATSScore,
    totalJdKeywords,
    totalMatchedKeywords,
    toDisplayName,
    tokenizeForKeywords
};
