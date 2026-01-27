const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
    personalInfo: {
        fullName: String,
        email: String,
        phone: String,
        city: String,
        state: String,
        country: String,
        linkedin: String,
        portfolio: String
    },
    summary: String,
    skills: {
        technical: [String],
        tools: [String],
        softSkills: [String]
    },
    experience: [{
        title: String,
        company: String,
        location: String,
        dates: String,
        description: [String] // Bullet points
    }],
    education: [{
        qualification: String,
        institute: String,
        location: String,
        year: String,
        stream: String
    }],
    projects: [{
        title: String,
        tools: String,
        github: String,
        link: String,
        description: String,
        outcome: String
    }],
    certifications: [{
        name: String,
        organization: String,
        year: String,
        link: String
    }],
    internships: [{
        role: String,
        organization: String,
        duration: String,
        description: String
    }],
    languages: [{
        language: String,
        proficiency: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Resume', ResumeSchema);
