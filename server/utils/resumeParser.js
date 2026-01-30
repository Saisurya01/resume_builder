/**
 * Resume Parser - Extracts structured data from raw resume text.
 * Used for ATS optimization: parse uploaded resume → merge selected skills → regenerate PDF.
 * Output schema matches pdfGenerator/docxGenerator expectations.
 */

const SECTION_HEADERS = [
    'experience', 'work experience', 'employment', 'professional experience',
    'education', 'academic', 'qualification', 'qualifications',
    'skills', 'technical skills', 'core competencies', 'competencies',
    'summary', 'professional summary', 'objective', 'profile', 'about',
    'projects', 'key projects', 'selected projects',
    'certifications', 'certificates', 'licenses',
    'languages', 'language skills',
    'internships', 'volunteer', 'activities', 'achievements'
];

const SECTION_ALIAS = {
    'work experience': 'experience',
    'employment': 'experience',
    'professional experience': 'experience',
    'academic': 'education',
    'qualification': 'education',
    'qualifications': 'education',
    'technical skills': 'skills',
    'core competencies': 'skills',
    'competencies': 'skills',
    'professional summary': 'summary',
    'objective': 'summary',
    'profile': 'summary',
    'about': 'summary',
    'key projects': 'projects',
    'selected projects': 'projects',
    'certificates': 'certifications',
    'licenses': 'certifications',
    'language skills': 'languages'
};

function normalizeLine(line) {
    return (line || '').trim().replace(/\s+/g, ' ');
}

function isSectionHeader(line) {
    const normalized = normalizeLine(line).toLowerCase();
    if (normalized.length < 2 || normalized.length > 80) return false;
    // Must look like a title: no trailing punctuation, often all caps or title case
    const stripped = normalized.replace(/[:\-–—]/g, '').trim();
    return SECTION_HEADERS.some(h => stripped === h || stripped.startsWith(h + ' ') || stripped.endsWith(' ' + h)) ||
        SECTION_HEADERS.some(h => stripped.includes(h));
}

function getSectionKey(line) {
    const normalized = normalizeLine(line).toLowerCase();
    for (const header of SECTION_HEADERS) {
        if (normalized === header || normalized.startsWith(header + ' ') || normalized.includes(header)) {
            return SECTION_ALIAS[header] || header;
        }
    }
    return null;
}

function extractEmail(text) {
    const match = (text || '').match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/);
    return match ? match[0] : '';
}

function extractPhone(text) {
    const match = (text || '').match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{2,4})?|\d{10,}/);
    return match ? match[0].trim() : '';
}

function extractLinkedIn(text) {
    const match = (text || '').match(/(?:linkedin\.com\/in\/[\w-]+|linkedin\.com\/[\w-]+)/i);
    return match ? (match[0].startsWith('http') ? match[0] : 'https://' + match[0]) : '';
}

function extractGithub(text) {
    const match = (text || '').match(/(?:github\.com\/[\w-]+)/i);
    return match ? (match[0].startsWith('http') ? match[0] : 'https://' + match[0]) : '';
}

function parseSections(fullText) {
    const lines = fullText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const sections = { _preamble: [] };
    let currentKey = '_preamble';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const key = getSectionKey(line);
        if (key) {
            currentKey = key;
            if (!sections[currentKey]) sections[currentKey] = [];
            continue; // do not add the header line to content
        }
        if (!sections[currentKey]) sections[currentKey] = [];
        sections[currentKey].push(line);
    }

    return sections;
}

function parsePersonalInfo(preambleLines) {
    const text = (preambleLines || []).join(' ');
    const email = extractEmail(text);
    const phone = extractPhone(text);
    const linkedin = extractLinkedIn(text);
    const github = extractGithub(text);

    let fullName = '';
    for (const line of preambleLines || []) {
        const t = normalizeLine(line);
        if (!t) continue;
        if (email && t.includes(email)) continue;
        if (phone && t.replace(/\s/g, '').includes(phone.replace(/\s/g, ''))) continue;
        if (t.length >= 2 && t.length <= 80 && !t.includes('@') && !/^\d[\d.\s\-]+$/.test(t)) {
            fullName = t;
            break;
        }
    }
    if (!fullName && preambleLines && preambleLines.length > 0) {
        fullName = normalizeLine(preambleLines[0]) || 'Resume';
    }
    if (!fullName) fullName = 'Resume';

    return {
        fullName: fullName || 'Resume',
        email: email || '',
        phone: phone || '',
        city: '',
        state: '',
        country: '',
        linkedin: linkedin || '',
        github: github || '',
        portfolio: '',
        youtube: ''
    };
}

function parseSummary(lines) {
    if (!lines || lines.length === 0) return '';
    return lines.join(' ').trim();
}

function parseSkillsBlock(lines) {
    const text = lines.join(' ');
    const technical = [];
    const tools = [];
    const softSkills = [];

    const all = text.split(/[,|;]|\band\b/).map(s => s.trim()).filter(Boolean);
    const { categorizeKeyword } = require('./keywordCategorizer');
    for (const item of all) {
        const cat = categorizeKeyword(item);
        if (cat === 'Programming Languages' || cat === 'Technical Skills') technical.push(item);
        else if (cat === 'Tools & Technologies') tools.push(item);
        else if (cat === 'Soft Skills') softSkills.push(item);
        else technical.push(item);
    }

    return {
        technical: technical.join(', '),
        tools: tools.join(', '),
        softSkills: softSkills.join(', ')
    };
}

function parseExperienceBlock(lines) {
    const entries = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        const dashMatch = line.match(/^(.+?)\s*[–\-—|]\s*(.+?)(?:\s*,\s*(.+))?$/);
        if (dashMatch) {
            const title = dashMatch[1].trim();
            const company = dashMatch[2].trim();
            const location = (dashMatch[3] || '').trim();
            const datesMatch = line.match(/(\d{4}\s*[-–—to]+\s*\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}\s*[-–—]+\s*(?:present|current|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*\d{4}))|(\d{1,2}\/\d{4}\s*[-–—]\s*(?:present|\d{1,2}\/\d{4}))/i);
            const dates = datesMatch ? datesMatch[0] : '';
            const bullets = [];
            i++;
            while (i < lines.length && (lines[i].startsWith('•') || lines[i].startsWith('-') || lines[i].match(/^\d+\./) || (lines[i].length > 20 && !lines[i].match(/^.+?[–\-—|].+$/)))) {
                bullets.push(lines[i].replace(/^[•\-]\s*|\d+\.\s*/, '').trim());
                i++;
            }
            entries.push({
                title,
                company,
                location: location || '',
                dates: dates || '',
                description: bullets.length ? bullets : (bullets[0] || '')
            });
            continue;
        }
        i++;
    }
    return entries;
}

function parseEducationBlock(lines) {
    const entries = [];
    for (const line of lines) {
        const parts = line.split(/\s*[–\-—|]\s*/);
        if (parts.length >= 2) {
            const qualification = parts[0].trim();
            const rest = parts.slice(1).join(' – ');
            const yearMatch = rest.match(/\b(19|20)\d{2}\b/);
            const year = yearMatch ? yearMatch[0] : '';
            entries.push({
                qualification,
                stream: rest.replace(/\b(19|20)\d{2}\b.*$/, '').trim() || rest,
                institute: rest,
                location: '',
                year,
                score: ''
            });
        }
    }
    if (entries.length === 0 && lines.length > 0) {
        entries.push({
            qualification: lines[0],
            stream: '',
            institute: lines[0],
            location: '',
            year: '',
            score: ''
        });
    }
    return entries;
}

function parseProjectsBlock(lines) {
    const entries = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (line.length > 3 && !line.startsWith('•') && !line.startsWith('-')) {
            const bullets = [];
            i++;
            while (i < lines.length && (lines[i].startsWith('•') || lines[i].startsWith('-') || lines[i].match(/^\d+\./) || lines[i].length > 30)) {
                bullets.push(lines[i].replace(/^[•\-]\s*|\d+\.\s*/, '').trim());
                i++;
            }
            entries.push({
                title: line,
                link: '',
                github: '',
                tools: '',
                description: bullets.length ? bullets : (bullets[0] || ''),
                outcome: ''
            });
            continue;
        }
        i++;
    }
    return entries;
}

function parseCertificationsBlock(lines) {
    return (lines || []).map(line => {
        const parts = line.split(/\s*[–\-—|]\s*/);
        return {
            name: parts[0] || line,
            organization: parts[1] || '',
            year: (line.match(/\b(19|20)\d{2}\b/) || [])[0] || '',
            link: ''
        };
    }).filter(c => c.name);
}

function parseLanguagesBlock(lines) {
    return (lines || []).map(line => {
        const match = line.match(/^(.+?)\s*[–\-—:]\s*(.+)$/);
        return {
            language: match ? match[1].trim() : line,
            proficiency: match ? match[2].trim() : ''
        };
    }).filter(Boolean);
}

/**
 * Parse raw resume text into structured data for PDF/DOCX generation.
 * @param {string} rawText - Full resume text from PDF/DOCX upload
 * @returns {Object} - Resume data matching pdfGenerator schema
 */
function parseResumeText(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        return getEmptyResumeData();
    }

    const sections = parseSections(rawText);
    const preamble = sections._preamble || [];
    const personalInfo = parsePersonalInfo(preamble);

    let skills = { technical: '', tools: '', softSkills: '' };
    if (sections.skills && sections.skills.length > 0) {
        skills = parseSkillsBlock(sections.skills);
    }

    let summary = '';
    if (sections.summary && sections.summary.length > 0) {
        summary = parseSummary(sections.summary);
    }

    let experience = [];
    if (sections.experience && sections.experience.length > 0) {
        experience = parseExperienceBlock(sections.experience);
    }
    if (experience.length === 0 && sections.experience) {
        experience = sections.experience.slice(0, 5).map(line => ({
            title: 'Role',
            company: 'Company',
            location: '',
            dates: '',
            description: line.replace(/^[•\-]\s*/, '')
        }));
    }

    let education = [];
    if (sections.education && sections.education.length > 0) {
        education = parseEducationBlock(sections.education);
    }

    let projects = [];
    if (sections.projects && sections.projects.length > 0) {
        projects = parseProjectsBlock(sections.projects);
    }

    let certifications = [];
    if (sections.certifications && sections.certifications.length > 0) {
        certifications = parseCertificationsBlock(sections.certifications);
    }

    let languages = [];
    if (sections.languages && sections.languages.length > 0) {
        languages = parseLanguagesBlock(sections.languages);
    }

    return {
        personalInfo,
        summary,
        skills,
        experience,
        education,
        projects,
        certifications,
        languages,
        template: 'professional'
    };
}

function getEmptyResumeData() {
    return {
        personalInfo: {
            fullName: 'Resume',
            email: '',
            phone: '',
            city: '',
            state: '',
            country: '',
            linkedin: '',
            github: '',
            portfolio: '',
            youtube: ''
        },
        summary: '',
        skills: { technical: '', tools: '', softSkills: '' },
        experience: [],
        education: [],
        projects: [],
        certifications: [],
        languages: [],
        template: 'professional'
    };
}

module.exports = {
    parseResumeText,
    parseSections,
    getEmptyResumeData
};
