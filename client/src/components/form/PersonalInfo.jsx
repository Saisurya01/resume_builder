import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';

const PersonalInfo = ({ data, handleChange }) => {
    return (
        <div>
            <h4 className="mb-3">Personal Information</h4>
            <Row className="mb-3 g-3">
                <Col md={6}>
                    <Form.Group controlId="fullName">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="fullName"
                            value={data.personalInfo.fullName}
                            onChange={(e) => handleChange('personalInfo', 'fullName', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={data.personalInfo.email}
                            onChange={(e) => handleChange('personalInfo', 'email', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3 g-3">
                <Col md={6}>
                    <Form.Group controlId="phone">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="text"
                            name="phone"
                            value={data.personalInfo.phone}
                            onChange={(e) => handleChange('personalInfo', 'phone', e.target.value)}
                            required
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="city">
                        <Form.Label>City</Form.Label>
                        <Form.Control
                            type="text"
                            name="city"
                            value={data.personalInfo.city}
                            onChange={(e) => handleChange('personalInfo', 'city', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3 g-3">
                <Col md={6}>
                    <Form.Group controlId="state">
                        <Form.Label>State</Form.Label>
                        <Form.Control
                            type="text"
                            name="state"
                            value={data.personalInfo.state}
                            onChange={(e) => handleChange('personalInfo', 'state', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="country">
                        <Form.Label>Country</Form.Label>
                        <Form.Control
                            type="text"
                            name="country"
                            value={data.personalInfo.country}
                            onChange={(e) => handleChange('personalInfo', 'country', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3 g-3">
                <Col md={4}>
                    <Form.Group controlId="linkedin">
                        <Form.Label>LinkedIn (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="linkedin"
                            value={data.personalInfo.linkedin}
                            onChange={(e) => handleChange('personalInfo', 'linkedin', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="portfolio">
                        <Form.Label>Portfolio (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="portfolio"
                            value={data.personalInfo.portfolio}
                            onChange={(e) => handleChange('personalInfo', 'portfolio', e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="github">
                        <Form.Label>GitHub (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="github"
                            value={data.personalInfo.github}
                            onChange={(e) => handleChange('personalInfo', 'github', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-3 g-3">
                <Col md={4}>
                    <Form.Group controlId="youtube">
                        <Form.Label>YouTube (Optional)</Form.Label>
                        <Form.Control
                            type="text"
                            name="youtube"
                            value={data.personalInfo.youtube}
                            onChange={(e) => handleChange('personalInfo', 'youtube', e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </div>
    );
};

export default PersonalInfo;
