import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OptimizeResume = () => {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [resumeText, setResumeText] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file || !jobDescription) {
            alert('Please upload a resume and provide a job description.');
            return;
        }

        setLoading(true);
        try {
            // Step 1: Upload and extract text
            const formData = new FormData();
            formData.append('resume', file);

            const uploadRes = await axios.post('http://localhost:5000/api/resume/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const text = uploadRes.data.text;
            setResumeText(text);

            // Step 2: Optimize/Analyze
            const optimizeRes = await axios.post('http://localhost:5000/api/resume/optimize', {
                currentResumeText: text,
                jobDescription: jobDescription
            });

            setAnalysis(optimizeRes.data);
        } catch (error) {
            console.error(error);
            alert('Error analyzing resume.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="mt-5 mb-5">
            <h2 className="text-center mb-4">Optimize Your Resume</h2>

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

            {analysis && (
                <Card className="mt-4 p-4 shadow-sm border-success">
                    <h3 className="text-success">Optimization Report</h3>
                    <Alert variant="info">
                        <strong>Suggestions:</strong> {analysis.suggestions}
                    </Alert>

                    <h5>Missing Keywords:</h5>
                    <ul>
                        {analysis.missingKeywords.map((kw, index) => (
                            <li key={index} className="text-danger">{kw}</li>
                        ))}
                    </ul>

                    <div className="mt-4 text-center">
                        <p>Use these insights to build your tailored resume.</p>
                        <Button variant="primary" onClick={() => navigate('/create')}>Go to Resume Builder</Button>
                    </div>
                </Card>
            )}
        </Container>
    );
};

export default OptimizeResume;

