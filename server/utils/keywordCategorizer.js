/**
 * Keyword Categorization Utility
 * Categorizes keywords into 5 categories for ATS optimization
 */

// Comprehensive keyword databases (lowercase for case-insensitive matching)
const PROGRAMMING_LANGUAGES = [
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'csharp', 'c', 'ruby',
    'php', 'swift', 'kotlin', 'go', 'golang', 'rust', 'scala', 'r', 'matlab',
    'perl', 'shell', 'bash', 'powershell', 'sql', 'html', 'css', 'dart', 'lua',
    'objective-c', 'assembly', 'fortran', 'cobol', 'haskell', 'elixir', 'clojure'
];

const TOOLS_AND_TECHNOLOGIES = [
    // Version Control
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',

    // Databases
    'mongodb', 'postgresql', 'mysql', 'sqlite', 'redis', 'cassandra', 'dynamodb',
    'oracle', 'mariadb', 'elasticsearch', 'neo4j', 'couchdb', 'firebase',

    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform',
    'ansible', 'vagrant', 'circleci', 'travis', 'heroku', 'netlify', 'vercel',
    'digitalocean', 'cloudflare',

    // Development Tools
    'vscode', 'visual studio', 'intellij', 'pycharm', 'eclipse', 'sublime',
    'atom', 'vim', 'emacs', 'xcode', 'android studio',

    // Build Tools & Package Managers
    'npm', 'yarn', 'webpack', 'babel', 'gulp', 'grunt', 'maven', 'gradle',
    'pip', 'composer', 'nuget',

    // Testing
    'jest', 'mocha', 'chai', 'pytest', 'junit', 'selenium', 'cypress',
    'postman', 'insomnia',

    // Monitoring & Analytics
    'grafana', 'prometheus', 'datadog', 'newrelic', 'splunk', 'kibana',
    'google analytics', 'mixpanel',

    // Design & Collaboration
    'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator', 'jira',
    'confluence', 'trello', 'slack', 'notion', 'asana', 'monday'
];

const TECHNICAL_SKILLS = [
    // Frontend Frameworks & Libraries
    'react', 'reactjs', 'angular', 'vue', 'vuejs', 'svelte', 'nextjs', 'next.js',
    'gatsby', 'nuxt', 'redux', 'mobx', 'jquery', 'bootstrap', 'tailwind',
    'material-ui', 'mui', 'chakra',

    // Backend Frameworks
    'node.js', 'nodejs', 'express', 'expressjs', 'django', 'flask', 'fastapi',
    'spring', 'spring boot', 'laravel', 'rails', 'ruby on rails', 'asp.net',
    'nestjs', 'koa', 'hapi',

    // Mobile Development
    'react native', 'flutter', 'ionic', 'xamarin', 'cordova',

    // Concepts & Methodologies
    'rest', 'restful', 'graphql', 'grpc', 'soap', 'microservices', 'serverless',
    'api', 'oauth', 'jwt', 'websocket', 'oop', 'functional programming',
    'tdd', 'bdd', 'ci/cd', 'devops', 'agile', 'scrum', 'kanban', 'waterfall',
    'mvc', 'mvvm', 'solid', 'design patterns', 'data structures', 'algorithms',

    // Web Technologies
    'responsive design', 'progressive web app', 'pwa', 'spa', 'ssr', 'seo',
    'accessibility', 'wcag', 'cors', 'ajax', 'json', 'xml',

    // Security
    'authentication', 'authorization', 'encryption', 'ssl', 'tls', 'https',
    'penetration testing', 'owasp',

    // Data & AI/ML
    'machine learning', 'deep learning', 'neural networks', 'tensorflow',
    'pytorch', 'scikit-learn', 'pandas', 'numpy', 'data analysis',
    'data visualization', 'big data', 'hadoop', 'spark', 'etl',

    // Other
    'blockchain', 'web3', 'smart contracts', 'cryptocurrency'
];

const SOFT_SKILLS = [
    // Communication
    'communication', 'verbal communication', 'written communication',
    'presentation', 'public speaking', 'active listening', 'interpersonal',

    // Leadership & Management
    'leadership', 'team leadership', 'management', 'project management',
    'people management', 'mentoring', 'coaching', 'delegation',

    // Collaboration
    'teamwork', 'collaboration', 'cross-functional', 'stakeholder management',
    'relationship building', 'networking',

    // Problem Solving
    'problem solving', 'critical thinking', 'analytical', 'troubleshooting',
    'debugging', 'decision making', 'strategic thinking', 'innovation',
    'creativity', 'research',

    // Work Ethic
    'self-motivated', 'proactive', 'initiative', 'adaptability', 'flexibility',
    'time management', 'organization', 'multitasking', 'prioritization',
    'attention to detail', 'detail-oriented', 'reliable', 'dependable',

    // Emotional Intelligence
    'empathy', 'emotional intelligence', 'conflict resolution', 'negotiation',
    'persuasion', 'patience',

    // Learning & Growth
    'quick learner', 'continuous learning', 'self-learning', 'curiosity',
    'growth mindset', 'resilience'
];

// Domain keywords will be the fallback category

/**
 * Normalize keyword for matching
 * Handles variations like "Node.js" vs "NodeJS" vs "node"
 */
function normalizeKeyword(keyword) {
    return keyword
        .toLowerCase()
        .replace(/[.\-_]/g, '') // Remove dots, hyphens, underscores
        .replace(/\s+/g, ' ')   // Normalize spaces
        .trim();
}

/**
 * Check if keyword exists in database (with normalization)
 */
function isInDatabase(keyword, database) {
    const normalized = normalizeKeyword(keyword);
    return database.some(item => normalizeKeyword(item) === normalized);
}

/**
 * Categorize a single keyword
 * @param {string} keyword - The keyword to categorize
 * @returns {string} - Category name
 */
function categorizeKeyword(keyword) {
    if (!keyword || typeof keyword !== 'string') {
        return 'Domain Keywords';
    }

    // Check each category in priority order
    if (isInDatabase(keyword, PROGRAMMING_LANGUAGES)) {
        return 'Programming Languages';
    }

    if (isInDatabase(keyword, TOOLS_AND_TECHNOLOGIES)) {
        return 'Tools & Technologies';
    }

    if (isInDatabase(keyword, TECHNICAL_SKILLS)) {
        return 'Technical Skills';
    }

    if (isInDatabase(keyword, SOFT_SKILLS)) {
        return 'Soft Skills';
    }

    // Fallback for industry-specific or unknown terms
    return 'Domain Keywords';
}

/**
 * Categorize an array of keywords
 * @param {string[]} keywords - Array of keywords to categorize
 * @returns {Object} - Object with categories as keys and arrays of keywords as values
 */
function categorizeKeywords(keywords) {
    const categorized = {
        'Technical Skills': [],
        'Programming Languages': [],
        'Tools & Technologies': [],
        'Soft Skills': [],
        'Domain Keywords': []
    };

    keywords.forEach(keyword => {
        const category = categorizeKeyword(keyword);
        categorized[category].push(keyword);
    });

    return categorized;
}

/**
 * Get category icon for UI display
 */
function getCategoryIcon(category) {
    const icons = {
        'Technical Skills': '📊',
        'Programming Languages': '💻',
        'Tools & Technologies': '🛠️',
        'Soft Skills': '🤝',
        'Domain Keywords': '🎯'
    };
    return icons[category] || '📌';
}

module.exports = {
    categorizeKeyword,
    categorizeKeywords,
    getCategoryIcon,
    normalizeKeyword
};
