const axios = require('axios');

async function testFrontendFlow() {
    try {
        // Simulate the exact payload the frontend would send
        const formData = {
            personalInfo: {
                fullName: 'Test User',
                email: 'test@example.com',
                phone: '123-456-7890',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                linkedin: '',
                portfolio: '',
                github: '',
                youtube: ''
            },
            summary: 'Test summary for resume generation',
            skills: {
                technical: 'JavaScript, React, Node.js',
                tools: 'Git, VS Code',
                softSkills: 'Communication, Teamwork'
            },
            experience: [],
            education: [{
                qualification: '',
                institute: '',
                location: '',
                year: '',
                stream: '',
                score: ''
            }],
            projects: [],
            certifications: [],
            languages: [],
            template: 'professional'
        };

        // Convert skills strings to arrays (like frontend does)
        const payload = {
            ...formData,
            skills: {
                technical: String(formData.skills.technical || '').split(',').map(s => s.trim()).filter(Boolean),
                tools: String(formData.skills.tools || '').split(',').map(s => s.trim()).filter(Boolean),
                softSkills: String(formData.skills.softSkills || '').split(',').map(s => s.trim()).filter(Boolean)
            }
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post('http://localhost:5000/api/resume/generate?format=pdf', payload, {
            responseType: 'blob'
        });

        console.log('Response status:', response.status);
        console.log('Response data type:', typeof response.data);
        console.log('Response data length:', response.data.length);
        
        // Save the PDF
        const fs = require('fs');
        fs.writeFileSync('test_frontend_flow.pdf', response.data);
        console.log('PDF saved successfully!');

    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testFrontendFlow();