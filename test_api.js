// Test script to check API configuration
console.log('Testing API Configuration...');

// Test the API URL that should be configured
const API_URL = 'https://resume-builder-backend-0ith.onrender.com';

async function testAPI() {
    try {
        console.log('Testing API URL:', API_URL);
        
        // Test health endpoint
        const healthResponse = await fetch(API_URL);
        console.log('Health status:', healthResponse.status);
        const healthData = await healthResponse.text();
        console.log('Health data:', healthData);
        
        // Test resume generation
        const resumeResponse = await fetch(`${API_URL}/api/resume/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                personalInfo: {
                    fullName: 'Test User',
                    email: 'test@example.com',
                    phone: '123-456-7890'
                },
                summary: 'Test resume',
                template: 'professional'
            })
        });
        
        console.log('Resume generation status:', resumeResponse.status);
        
        if (resumeResponse.ok) {
            const blob = await resumeResponse.blob();
            console.log('✅ Resume generated successfully! Size:', blob.size, 'bytes');
        } else {
            const errorText = await resumeResponse.text();
            console.log('❌ Resume generation failed:', errorText);
        }
        
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testAPI();