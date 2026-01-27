import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    return (
        <Container className="mt-5">
            <div className="text-center mb-5 animate-fade-in">
                <h1 className="display-4 fw-bold text-primary mb-3">AI Resume Builder</h1>
                <p className="lead text-secondary">
                    Create a professional, ATS-friendly resume in minutes.
                    <br />
                    Choose a workflow that suits you best.
                </p>
            </div>

            <Row className="justify-content-center">
                <Col md={5} className="mb-4 animate-slide-up delay-100">
                    <Card className="h-100 border-0 shadow-lg text-center p-5 scale-hover">
                        <Card.Body>
                            <Card.Title as="h3" className="mb-3">New Resume</Card.Title>
                            <Card.Text className="text-muted mb-4">
                                Build a fresh resume from scratch with our step-by-step professional wizard. Perfect for students and freshers.
                            </Card.Text>
                            <Button variant="primary" size="lg" className="w-100 rounded-pill" onClick={() => navigate('/create')}>
                                Start Building
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={5} className="mb-4 animate-slide-up delay-200">
                    <Card className="h-100 border-0 shadow-lg text-center p-5 scale-hover">
                        <Card.Body>
                            <Card.Title as="h3" className="mb-3">Optimize Existing</Card.Title>
                            <Card.Text className="text-muted mb-4">
                                Upload your current resume and a job description. We'll analyze keywords and help you tailor it for the ATS.
                            </Card.Text>
                            <Button variant="outline-success" size="lg" className="w-100 rounded-pill" onClick={() => navigate('/optimize')}>
                                Optimize Now
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Home;
