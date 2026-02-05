import React, { useState } from 'react';
import { Container, Button, ProgressBar, Form } from 'react-bootstrap';
import api from '../utils/api';
import PersonalInfo from '../components/form/PersonalInfo';
import SummarySkills from '../components/form/SummarySkills';
import ExperienceEducation from '../components/form/ExperienceEducation';
import ProjectsOthers from '../components/form/ProjectsOthers';
import templateProfessional from '../assets/template_professional.png';
import templateAcademic from '../assets/template_academic.png';
import templateModern from '../assets/template_modern.png';

const CreateResume = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', city: '', state: '', country: '', linkedin: '', portfolio: '', github: '', youtube: '' },
        summary: '',
        skills: { technical: '', tools: '', softSkills: '' },
        experience: [],
        education: [{ qualification: '', institute: '', location: '', year: '', stream: '', score: '' }],
        projects: [],
        certifications: [],
        languages: [],
        template: 'professional'
    });

    const handleChange = (section, field, value) => {
        if (section === 'summary') {
            setFormData({ ...formData, summary: value });
        } else if (section === 'personalInfo') {
            setFormData({ ...formData, personalInfo: { ...formData.personalInfo, [field]: value } });
        } else if (section === 'template') {
            setFormData({ ...formData, template: value });
        }
    };

    const handleSkillChange = (type, value) => {
        setFormData({
            ...formData,
            skills: { ...formData.skills, [type]: value }
        });
    };

    const handleArrayChange = (section, index, field, value) => {
        const newArray = [...formData[section]];
        newArray[index][field] = value;
        setFormData({ ...formData, [section]: newArray });
    };

    const addArrayItem = (section, initialValue) => {
        setFormData({ ...formData, [section]: [...formData[section], initialValue] });
    };

    const removeArrayItem = (section, index) => {
        const newArray = [...formData[section]];
        newArray.splice(index, 1);
        setFormData({ ...formData, [section]: newArray });
    };

    const handleSubmit = async (format = 'pdf') => {
        try {
            // Validate required fields
            if (!formData.personalInfo.fullName.trim()) {
                alert('Please enter your full name.');
                return;
            }
            if (!formData.personalInfo.email.trim()) {
                alert('Please enter your email address.');
                return;
            }
            if (!formData.personalInfo.phone.trim()) {
                alert('Please enter your phone number.');
                return;
            }

            // Prepare data for API (Convert skill strings to arrays)
            const payload = {
                ...formData,
                skills: {
                    technical: String(formData.skills.technical || '').split(',').map(s => s.trim()).filter(Boolean),
                    tools: String(formData.skills.tools || '').split(',').map(s => s.trim()).filter(Boolean),
                    softSkills: String(formData.skills.softSkills || '').split(',').map(s => s.trim()).filter(Boolean)
                }
            };

            console.log('Sending payload:', payload);

            const response = await api.post(`/api/resume/generate?format=${format}`, payload, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume.${format === 'docx' ? 'docx' : 'pdf'}`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            alert(`${format.toUpperCase()} generated successfully!`);
        } catch (error) {
            console.error(`Error generating ${format}:`, error);
            
            let errorMessage = `Failed to generate ${format}.`;
            if (error.response) {
                console.error('Error response:', error.response.data);
                errorMessage = `Server error: ${error.response.status}. Please check your data and try again.`;
            } else if (error.request) {
                errorMessage = `Network error: Could not connect to the server. Please check your connection.`;
            }
            
            alert(errorMessage);
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <Container className="mt-5 mb-5">
            <h2 className="text-center mb-4">Create Your Resume</h2>
            <ProgressBar now={(step / 5) * 100} label={`Step ${step} of 5`} className="mb-4 animate-fade-in" />

            <div className="p-3 p-md-4 border rounded shadow-sm card animate-slide-up">
                {step === 1 && <PersonalInfo data={formData} handleChange={handleChange} />}
                {step === 2 && <SummarySkills data={formData} handleChange={handleChange} handleSkillChange={handleSkillChange} />}
                {step === 3 && <ExperienceEducation data={formData} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
                {step === 4 && <ProjectsOthers data={formData} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
                {step === 5 && (
                    <div className="text-center">
                        <h4 className="mb-4 fw-bold">Choose Your Resume Style</h4>
                        <p className="text-muted mb-4">Select a template that best fits your professional background. All templates are 100% ATS-friendly.</p>
                        <div className="row justify-content-center g-4">
                            {[
                                { id: 'professional', name: 'Professional', img: templateProfessional, desc: 'Clean, minimalist, and highly readable.' },
                                { id: 'academic', name: 'Academic', img: templateAcademic, desc: 'Structured for research and education.' },
                                { id: 'modern', name: 'Modern', img: templateModern, desc: 'Contemporary look with bold accents.' }
                            ].map((t) => (
                                <div key={t.id} className="col-12 col-md-4">
                                    <div
                                        className={`card h-100 template-card ${formData.template === t.id ? 'selected' : ''}`}
                                        onClick={() => handleChange('template', null, t.id)}
                                    >
                                        <div className="template-img-container">
                                            <img src={t.img} alt={t.name} className="card-img-top" />
                                            {formData.template === t.id && (
                                                <div className="selection-overlay">
                                                    <div className="check-icon">✓</div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="card-body">
                                            <h5 className="card-title fw-bold">{t.name}</h5>
                                            <p className="card-text small text-muted">{t.desc}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="d-grid gap-3 d-md-flex justify-content-md-between mt-4 mt-md-5">
                    <Button
                        variant="outline-secondary"
                        onClick={prevStep}
                        disabled={step === 1}
                        className="px-4 order-2 order-md-1"
                    >
                        Previous
                    </Button>
                    {step < 5 ? (
                        <Button
                            variant="primary"
                            onClick={nextStep}
                            className="px-4 order-1 order-md-2"
                        >
                            Next Step
                        </Button>
                    ) : (
                        <div className="d-flex flex-column flex-md-row gap-2 order-1 order-md-2">
                            <Button
                                variant="outline-info"
                                onClick={() => {
                                    console.log('Current form data:', JSON.stringify(formData, null, 2));
                                    alert('Form data logged to console. Press F12 to view.');
                                }}
                                className="px-md-4"
                            >
                                Debug Form Data
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => handleSubmit('docx')}
                                className="px-md-4 fw-bold"
                            >
                                Download DOCX
                            </Button>
                            <Button
                                variant="success"
                                onClick={() => handleSubmit('pdf')}
                                className="px-md-4 fw-bold"
                            >
                                Generate ATS PDF
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default CreateResume;

