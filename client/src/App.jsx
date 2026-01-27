import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import Home from './pages/Home';
import CreateResume from './pages/CreateResume';
import OptimizeResume from './pages/OptimizeResume';
import './App.css';

function App() {
  // Initialize from localStorage or default to false
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  useEffect(() => {
    // Apply class
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <Router>
      <Navbar bg={darkMode ? 'dark' : 'white'} variant={darkMode ? 'dark' : 'light'} expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">Resume Builder</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/create">Create</Nav.Link>
              <Nav.Link as={Link} to="/optimize">Optimize</Nav.Link>
            </Nav>
            <Button
              variant={darkMode ? 'outline-light' : 'outline-dark'}
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Button>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateResume />} />
        <Route path="/optimize" element={<OptimizeResume />} />
      </Routes>
    </Router>
  );
}

export default App;
