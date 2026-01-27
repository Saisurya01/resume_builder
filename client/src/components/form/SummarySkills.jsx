import React from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';

const SummarySkills = ({ data, handleChange, handleSkillChange }) => {

    const generateSummary = () => {
        // Simple logic for Basic/Fresher summary
        const summary = `Motivated ${data.personalInfo.fullName} aspiring to start a career in technology. Skilled in ${data.skills.technical}. Eager to contribute to team success through hard work and attention to detail.`;
        handleChange('summary', null, summary);
    };

    return (
        <div>
            <h4 className="mb-3">Summary & Skills</h4>

            <Form.Group className="mb-4" controlId="summary">
                <Form.Label>Professional Summary</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={4}
                    value={data.summary}
                    onChange={(e) => handleChange('summary', null, e.target.value)}
                />
                <Button variant="outline-secondary" size="sm" className="mt-2" onClick={generateSummary}>
                    Auto-Generate Summary
                </Button>
            </Form.Group>

            <h5 className="mb-3">Skills (Comma separated)</h5>
            <Row className="mb-3">
                <Col md={12}>
                    <Form.Group controlId="technicalSkills">
                        <Form.Label>Technical Skills</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. JavaScript, React, Node.js"
                            value={data.skills.technical}
                            onChange={(e) => handleSkillChange('technical', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Group controlId="tools">
                        <Form.Label>Tools & Software</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Git, VS Code, Figma"
                            value={data.skills.tools}
                            onChange={(e) => handleSkillChange('tools', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="softSkills">
                        <Form.Label>Soft Skills</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="e.g. Communication, Teamwork"
                            value={data.skills.softSkills}
                            onChange={(e) => handleSkillChange('softSkills', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default SummarySkills;
