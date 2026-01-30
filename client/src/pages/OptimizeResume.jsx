import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, ProgressBar, Badge, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OptimizeResume = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [resumeText, setResumeText] = useState('');

    // New state for categorized keywords
    const [categorizedKeywords, setCategorizedKeywords] = useState(null);
    const [selectedSkills, setSelectedSkills] = useState({});
    const [atsScore, setAtsScore] = useState(0);
    const [optimizedResumeData, setOptimizedResumeData] = useState(null);
    const [applyingSkills, setApplyingSkills] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file || !jobDescription) {
            alert('Please upload a resume and provide a job description.');
            return;
        }

        setLoading(true);
        setSuccessMessage('');
        try {
            // Step 1: Upload and extract text
            console.log('📤 Uploading resume for text extraction...');
            const formData = new FormData();
            formData.append('resume', file);

            const uploadRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/upload`, formData);
            console.log('✅ Resume uploaded successfully');

            const text = uploadRes.data.text;
            setResumeText(text);

            // Step 2: Optimize/Analyze
            console.log('🎯 Analyzing resume against job description...');
            const optimizeRes = await axios.post(`${import.meta.env.VITE_API_URL}/api/resume/optimize`, {
                currentResumeText: text,
                jobDescription: jobDescription
            });
            console.log('✅ Analysis complete');

            // Set new categorized data
            setCategorizedKeywords(optimizeRes.data.categorizedKeywords);
            setAtsScore(optimizeRes.data.atsScore);
            setAnalysis(optimizeRes.data);
            setSelectedSkills({}); // Reset selections
        } catch (error) {
            console.error('❌ Error during resume analysis:', error);

            let errorMessage = 'Error analyzing resume. Please check your connection and try again.';

            if (error.response) {
                errorMessage = error.response.data?.error || errorMessage;
                console.error(`Backend error (${error.response.status}):`, errorMessage);
            } else if (error.request) {
                errorMessage = 'Cannot connect to server. Please ensure the backend is running on http://localhost:5000';
                console.error('No response from server:', error.request);
            } else {
                errorMessage = error.message || errorMessage;
                console.error('Request setup error:', error.message);
            }

            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Handle checkbox toggle
    const handleSkillToggle = (category, skill) => {
        setSelectedSkills(prev => {
            const categorySkills = prev[category] || [];
            const isSelected = categorySkills.includes(skill);

            return {
                ...prev,
                [category]: isSelected
                    ? categorySkills.filter(s => s !== skill)
                    : [...categorySkills, skill]
            };
        });
    };

    // Calculate total selected skills
    const totalSelected = Object.values(selectedSkills)
        .reduce((sum, skills) => sum + skills.length, 0);

    // Apply selected skills to resume
    const handleApplySkills = async () => {
        if (totalSelected === 0) {
            alert('Please select at least one skill to add.');
            return;
        }

        setApplyingSkills(true);
        setSuccessMessage('');

        try {
            console.log('✨ Applying selected skills...');

            // Create resume data structure from extracted text
            // For now, we'll create a minimal structure
            const resumeData = {
                personalInfo: { fullName: '', email: '', phone: '' },
                summary: '',
                skills: {
                    technical: '',
                    tools: '',
                    softSkills: ''
                },
                experience: [],
                education: [],
                projects: [],
                certifications: [],
                languages: []
            };

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/resume/apply-optimizations`,
                {
                    resumeData,
                    selectedSkills
                }
            );

            console.log('✅ Skills applied successfully');

            setOptimizedResumeData(response.data.updatedResumeData);
            setSuccessMessage(response.data.message);

            // Update ATS score (estimate)
            const newScore = Math.min(100, atsScore + (totalSelected * 2));
            setAtsScore(newScore);

        } catch (error) {
            console.error('❌ Error applying skills:', error);
            const errorMessage = error.response?.data?.error || 'Failed to apply skills. Please try again.';
            alert(errorMessage);
        } finally {
            setApplyingSkills(false);
        }
    };

    // Download optimized resume
    const handleDownloadOptimized = async (format = 'pdf') => {
        if (!optimizedResumeData) {
            alert('Please apply skills first before downloading.');
            return;
        }

        try {
            console.log(`📥 Downloading optimized resume as ${format.toUpperCase()}...`);

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/resume/generate?format=${format}`,
                optimizedResumeData,
                { responseType: 'blob' }
            );

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `optimized_resume.${format}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            console.log('✅ Download complete');
        } catch (error) {
            console.error('❌ Error downloading resume:', error);
            alert('Failed to download resume. Please try again.');
        }
    };

    // Category icons
    const categoryIcons = {
        'Technical Skills': '📊',
        'Programming Languages': '💻',
        'Tools & Technologies': '🛠️',
        'Soft Skills': '🤝',
        'Domain Keywords': '🎯'
    };

    // Get ATS score color
    const getScoreVariant = (score) => {
        if (score < 50) return 'danger';
        if (score < 75) return 'warning';
        return 'success';
    };

    return (
        <Container className="mt-5 mb-5">
            <h2 className="text-center mb-4">ATS Resume Optimizer</h2>

            <Card className="p-4 shadow-sm">
                <Form.Group className="mb-3">
                    <Form.Label>Upload Current Resume (PDF/DOCX)</Form.Label>
                    <Form.Control type="file" onChange={handleFileChange} accept=".pdf,.docx" />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Job Description</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={10}
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button variant="success" size="lg" onClick={handleAnalyze} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Analyze & Optimize'}
                    </Button>
                </div>
            </Card>

            {/* ATS Score Display */}
            {analysis && (
                <Card className="mt-4 p-4 shadow-sm border-primary">
                    <h4 className="mb-3">ATS Score</h4>
                    <div className="d-flex align-items-center gap-3 mb-3">
                        <div style={{ flex: 1 }}>
                            <ProgressBar
                                now={atsScore}
                                variant={getScoreVariant(atsScore)}
                                label={`${atsScore}%`}
                                style={{ height: '30px', fontSize: '16px' }}
                            />
                        </div>
                        <Badge bg={getScoreVariant(atsScore)} style={{ fontSize: '18px', padding: '10px 15px' }}>
                            {atsScore}%
                        </Badge>
                    </div>
                    <p className="text-muted mb-0">
                        <strong>Matched:</strong> {analysis.matchedKeywords} / {analysis.totalKeywords} keywords
                        {atsScore < 50 && ' - Needs significant improvement'}
                        {atsScore >= 50 && atsScore < 75 && ' - Add more relevant keywords'}
                        {atsScore >= 75 && ' - Good ATS compatibility!'}
                    </p>
                </Card>
            )}

            {/* Categorized Keywords */}
            {categorizedKeywords && (
                <Card className="mt-4 p-4 shadow-sm border-success">
                    <h3 className="text-success mb-3">Missing Keywords by Category</h3>
                    <p className="text-muted mb-4">
                        Select the skills you want to add to your resume. All selections will be added to the appropriate sections.
                    </p>

                    {Object.entries(categorizedKeywords).map(([category, keywords]) => {
                        if (keywords.length === 0) return null;

                        return (
                            <div key={category} className="mb-4">
                                <h5 className="mb-3">
                                    <span className="me-2">{categoryIcons[category]}</span>
                                    {category}
                                    <Badge bg="secondary" className="ms-2">{keywords.length}</Badge>
                                </h5>
                                <Row>
                                    {keywords.map((keyword, index) => (
                                        <Col md={6} lg={4} key={index} className="mb-2">
                                            <Form.Check
                                                type="checkbox"
                                                id={`${category}-${index}`}
                                                label={keyword}
                                                checked={selectedSkills[category]?.includes(keyword) || false}
                                                onChange={() => handleSkillToggle(category, keyword)}
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            </div>
                        );
                    })}

                    {/* Selection Summary */}
                    {totalSelected > 0 && (
                        <Alert variant="info" className="mt-3">
                            <strong>{totalSelected}</strong> skill{totalSelected !== 1 ? 's' : ''} selected
                        </Alert>
                    )}

                    {/* Apply Button */}
                    <div className="d-grid gap-2 mt-4">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleApplySkills}
                            disabled={totalSelected === 0 || applyingSkills}
                        >
                            {applyingSkills ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Applying Skills...
                                </>
                            ) : (
                                `Add Selected Skills to Resume (${totalSelected})`
                            )}
                        </Button>
                    </div>
                </Card>
            )}

            {/* Success Message & Download */}
            {successMessage && optimizedResumeData && (
                <Card className="mt-4 p-4 shadow-sm border-success bg-light">
                    <Alert variant="success" className="mb-3">
                        <strong>✅ {successMessage}</strong>
                    </Alert>

                    <h5 className="mb-3">Download Your Optimized Resume</h5>
                    <p className="text-muted mb-3">
                        Your resume has been optimized with the selected skills. Download it in your preferred format.
                    </p>

                    <Row className="g-3">
                        <Col md={6}>
                            <Button
                                variant="outline-primary"
                                className="w-100"
                                onClick={() => handleDownloadOptimized('pdf')}
                            >
                                📄 Download as PDF
                            </Button>
                        </Col>
                        <Col md={6}>
                            <Button
                                variant="outline-primary"
                                className="w-100"
                                onClick={() => handleDownloadOptimized('docx')}
                            >
                                📝 Download as DOCX
                            </Button>
                        </Col>
                    </Row>

                    <div className="mt-4 text-center">
                        <Button variant="link" onClick={() => navigate('/create')}>
                            Or customize further in Resume Builder →
                        </Button>
                    </div>
                </Card>
            )}
        </Container>
    );
};

export default OptimizeResume;
