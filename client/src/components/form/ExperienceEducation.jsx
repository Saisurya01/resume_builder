import React from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';

const ExperienceEducation = ({ data, handleArrayChange, addArrayItem, removeArrayItem }) => {
    return (
        <div>
            <h4 className="mb-3">Work Experience (Optional)</h4>
            {data.experience.map((exp, index) => (
                <Card key={index} className="mb-3 p-3 bg-light">
                    <Row className="mb-2">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Job Title"
                                value={exp.title}
                                onChange={(e) => handleArrayChange('experience', index, 'title', e.target.value)}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Company Name"
                                value={exp.company}
                                onChange={(e) => handleArrayChange('experience', index, 'company', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Location"
                                value={exp.location}
                                onChange={(e) => handleArrayChange('experience', index, 'location', e.target.value)}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Dates (e.g. Jan 2020 - Present)"
                                value={exp.dates}
                                onChange={(e) => handleArrayChange('experience', index, 'dates', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Job Description (Bullet points separated by new lines)"
                        value={exp.description.join('\n')}
                        onChange={(e) => handleArrayChange('experience', index, 'description', e.target.value.split('\n'))}
                    />
                    <div className="text-end mt-2">
                        <Button variant="danger" size="sm" onClick={() => removeArrayItem('experience', index)}>Remove</Button>
                    </div>
                </Card>
            ))}
            <Button variant="outline-primary" size="sm" onClick={() => addArrayItem('experience', { title: '', company: '', location: '', dates: '', description: [] })}>
                + Add Experience
            </Button>

            <h4 className="mt-4 mb-3">Education</h4>
            {data.education.map((edu, index) => (
                <Card key={index} className="mb-3 p-3 bg-light">
                    <Row className="mb-2">
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Qualification (e.g. B.Tech)"
                                value={edu.qualification}
                                onChange={(e) => handleArrayChange('education', index, 'qualification', e.target.value)}
                            />
                        </Col>
                        <Col md={6}>
                            <Form.Control
                                type="text"
                                placeholder="Institute Name"
                                value={edu.institute}
                                onChange={(e) => handleArrayChange('education', index, 'institute', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <Row className="mb-2">
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Location"
                                value={edu.location}
                                onChange={(e) => handleArrayChange('education', index, 'location', e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Year"
                                value={edu.year}
                                onChange={(e) => handleArrayChange('education', index, 'year', e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <Form.Control
                                type="text"
                                placeholder="Stream"
                                value={edu.stream}
                                onChange={(e) => handleArrayChange('education', index, 'stream', e.target.value)}
                            />
                        </Col>
                    </Row>
                    <div className="text-end mt-2">
                        <Button variant="danger" size="sm" onClick={() => removeArrayItem('education', index)}>Remove</Button>
                    </div>
                </Card>
            ))}
            <Button variant="outline-primary" size="sm" onClick={() => addArrayItem('education', { qualification: '', institute: '', location: '', year: '', stream: '' })}>
                + Add Education
            </Button>
        </div>
    );
};

export default ExperienceEducation;
