import React, { useState } from 'react';
import { Container, Button, ProgressBar, Form } from 'react-bootstrap';
import axios from 'axios';
import PersonalInfo from '../components/form/PersonalInfo';
import SummarySkills from '../components/form/SummarySkills';
import ExperienceEducation from '../components/form/ExperienceEducation';
import ProjectsOthers from '../components/form/ProjectsOthers';

const CreateResume = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        personalInfo: { fullName: '', email: '', phone: '', city: '', state: '', country: '', linkedin: '', portfolio: '' },
        summary: '',
        skills: { technical: '', tools: '', softSkills: '' },
        experience: [],
        education: [{ qualification: '', institute: '', location: '', year: '', stream: '' }],
        projects: [],
        certifications: [],
        languages: [],
        template: 'classic'
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

    const handleSubmit = async () => {
        try {
            // Prepare data for API (Convert skill strings to arrays)
            const payload = {
                ...formData,
                skills: {
                    technical: formData.skills.technical.split(',').map(s => s.trim()).filter(Boolean),
                    tools: formData.skills.tools.split(',').map(s => s.trim()).filter(Boolean),
                    softSkills: formData.skills.softSkills.split(',').map(s => s.trim()).filter(Boolean)
                }
            };

            const response = await axios.post('http://localhost:5000/api/resume/generate', payload, {
                responseType: 'blob'
            });

            // Create blob link to download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'resume.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            alert('Resume generated successfully!');
        } catch (error) {
            console.error('Error generating resume:', error);
            alert('Failed to generate resume.');
        }
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    return (
        <Container className="mt-5 mb-5">
            <h2 className="text-center mb-4">Create Your Resume</h2>
            <ProgressBar now={(step / 4) * 100} label={`Step ${step} of 4`} className="mb-4 animate-fade-in" />

            <div className="p-4 border rounded shadow-sm card animate-slide-up">
                {step === 1 && <PersonalInfo data={formData} handleChange={handleChange} />}
                {step === 2 && <SummarySkills data={formData} handleChange={handleChange} handleSkillChange={handleSkillChange} />}
                {step === 3 && <ExperienceEducation data={formData} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />}
                {step === 4 && (
                    <>
                        <ProjectsOthers data={formData} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />
                        <hr className="my-4" />
                        <div className="mb-3">
                            <h4>Select Resume Template</h4>
                            <div className="d-flex gap-3">
                                <Form.Check
                                    type="radio"
                                    label="Classic (Helvetica, Left-align)"
                                    name="template"
                                    value="classic"
                                    checked={formData.template === 'classic'}
                                    onChange={(e) => handleChange('template', null, e.target.value)}
                                />
                                <Form.Check
                                    type="radio"
                                    label="Professional (Serif, Clean)"
                                    name="template"
                                    value="professional"
                                    checked={formData.template === 'professional'}
                                    onChange={(e) => handleChange('template', null, e.target.value)}
                                />
                                <Form.Check
                                    type="radio"
                                    label="Executive (Centered Headers)"
                                    name="template"
                                    value="executive"
                                    checked={formData.template === 'executive'}
                                    onChange={(e) => handleChange('template', null, e.target.value)}
                                />
                            </div>
                        </div>
                    </>
                )}

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={prevStep} disabled={step === 1}>Previous</Button>
                    {step < 4 ? (
                        <Button variant="primary" onClick={nextStep}>Next</Button>
                    ) : (
                        <Button variant="success" onClick={handleSubmit}>Generate PDF</Button>
                    )}
                </div>
            </div>
        </Container>
    );
};

export default CreateResume;

