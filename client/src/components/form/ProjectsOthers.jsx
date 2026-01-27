import React from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

const ProjectsOthers = ({ data, handleArrayChange, addArrayItem, removeArrayItem }) => {
    return (
        <div>
            <h4 className="mb-3">Projects</h4>
            {data.projects.map((proj, index) => (
                <Card key={index} className="mb-3 p-3 bg-light">
                    <Row className="mb-2 g-3">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Project Title"
                                value={proj.title}
                                onChange={(e) => handleArrayChange('projects', index, 'title', e.target.value)}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Tools Used"
                                value={proj.tools}
                                onChange={(e) => handleArrayChange('projects', index, 'tools', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-2 g-3">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="GitHub Link (Optional)"
                                value={proj.github}
                                onChange={(e) => handleArrayChange('projects', index, 'github', e.target.value)}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Live Demo Link (Optional)"
                                value={proj.link}
                                onChange={(e) => handleArrayChange('projects', index, 'link', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        className="mb-2"
                        placeholder="Description"
                        value={proj.description}
                        onChange={(e) => handleArrayChange('projects', index, 'description', e.target.value)}
                    />
                    <Form.Control
                        type="text"
                        placeholder="Outcome/Result"
                        value={proj.outcome}
                        onChange={(e) => handleArrayChange('projects', index, 'outcome', e.target.value)}
                    />
                    <div className="text-end mt-2">
                        <Button variant="danger" size="sm" onClick={() => removeArrayItem('projects', index)}>Remove</Button>
                    </div>
                </Card>
            ))}
            <Button variant="outline-primary" size="sm" className="mb-4" onClick={() => addArrayItem('projects', { title: '', tools: '', github: '', link: '', description: '', outcome: '' })}>
                + Add Project
            </Button>

            <h4 className="mb-3">Certifications (Optional)</h4>
            {data.certifications.map((cert, index) => (
                <Card key={index} className="mb-2 p-2">
                    <Row className="mb-2 g-3">
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Certificate Name"
                                value={cert.name}
                                onChange={(e) => handleArrayChange('certifications', index, 'name', e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Issuing Organization"
                                value={cert.organization}
                                onChange={(e) => handleArrayChange('certifications', index, 'organization', e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Control
                                type="text"
                                placeholder="Year"
                                value={cert.year}
                                onChange={(e) => handleArrayChange('certifications', index, 'year', e.target.value)}
                            />
                        </Col>
                        <Col md={2}>
                            <Button variant="danger" size="sm" className="w-100" onClick={() => removeArrayItem('certifications', index)}>Remove</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={12}>
                            <Form.Control
                                type="text"
                                placeholder="Certificate URL (Optional)"
                                value={cert.link}
                                onChange={(e) => handleArrayChange('certifications', index, 'link', e.target.value)}
                            />
                        </Col>
                    </Row>
                </Card>
            ))}
            <Button variant="outline-primary" size="sm" className="mb-4" onClick={() => addArrayItem('certifications', { name: '', organization: '', year: '', link: '' })}>
                + Add Certification
            </Button>

            <h4 className="mb-3">Languages</h4>
            {data.languages.map((lang, index) => (
                <Row key={index} className="mb-2">
                    <Col md={6}>
                        <Form.Control
                            type="text"
                            placeholder="Language"
                            value={lang.language}
                            onChange={(e) => handleArrayChange('languages', index, 'language', e.target.value)}
                        />
                    </Col>
                    <Col md={5}>
                        <Form.Control
                            as="select"
                            value={lang.proficiency}
                            onChange={(e) => handleArrayChange('languages', index, 'proficiency', e.target.value)}
                        >
                            <option value="">Select Proficiency</option>
                            <option value="Basic">Basic</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native">Native</option>
                        </Form.Control>
                    </Col>
                    <Col md={1}>
                        <Button variant="danger" size="sm" onClick={() => removeArrayItem('languages', index)}>X</Button>
                    </Col>
                </Row>
            ))}
            <Button variant="outline-primary" size="sm" onClick={() => addArrayItem('languages', { language: '', proficiency: '' })}>
                + Add Language
            </Button>
        </div>
    );
};

export default ProjectsOthers;
