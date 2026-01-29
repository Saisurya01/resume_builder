/**
 * Centralized utility for cleaning text and formatting URLs.
 * Enforces strict label rules and strips raw URLs from visible text.
 */

const ALLOWED_LABELS = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portfolio',
    youtube: 'YouTube',
    link: 'Live Demo',
    repo: 'Repo',
    certificate: 'Certificate Link'
};

/**
 * Strips raw URLs and "Link:" prefixes from text.
 * Used for visible text fields like summary, experience description, etc.
 */
const cleanText = (text) => {
    if (!text) return '';
    return text.toString()
        .replace(/Link:\s*(https?:\/\/|www\.)\S+/gi, '')
        .replace(/(https?:\/\/|www\.)\S+/gi, '')
        .trim();
};

/**
 * Ensures a URL has a protocol (http/https).
 */
const formatUrl = (url) => {
    if (!url) return '';
    let formatted = url.trim();
    if (!/^https?:\/\//i.test(formatted)) {
        formatted = 'https://' + formatted;
    }
    return formatted;
};

/**
 * Scans a data object for raw URLs in fields where they shouldn't be.
 * Blocks or cleans invalid data.
 */
const validateAndCleanData = (data) => {
    const errors = [];

    // Helper to recursively walk and clean strings
    const processNode = (node, path = '') => {
        if (typeof node === 'string') {
            // Check for raw URLs in visible text fields
            // Fields that ARE allowed to have raw URLs are the specific link fields
            const isLinkField = path.toLowerCase().includes('link') ||
                path.toLowerCase().includes('url') ||
                ['linkedin', 'github', 'portfolio', 'youtube'].includes(path.split('.').pop());

            if (!isLinkField && /(https?:\/\/|www\.)\S+/i.test(node)) {
                // If it's not a designated link field, we strip it
                console.warn(`[Validator] Raw URL detected in ${path}. Stripping.`);
                return cleanText(node);
            }
            return node;
        } else if (Array.isArray(node)) {
            return node.map((item, i) => processNode(item, `${path}[${i}]`));
        } else if (node !== null && typeof node === 'object') {
            const newNode = {};
            for (const key in node) {
                newNode[key] = processNode(node[key], path ? `${path}.${key}` : key);
            }
            return newNode;
        }
        return node;
    };

    const cleanedData = processNode(data);

    // Hard Validation: Ensure personal links have targets if labels are implied
    const { personalInfo } = cleanedData;
    if (personalInfo) {
        ['linkedin', 'github', 'portfolio', 'youtube'].forEach(key => {
            if (personalInfo[key] && !/^https?:\/\//i.test(formatUrl(personalInfo[key]))) {
                errors.push(`Invalid URL for ${key}`);
            }
        });
    }

    if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return cleanedData;
};

module.exports = {
    cleanText,
    formatUrl,
    validateAndCleanData,
    ALLOWED_LABELS
};
