require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/resume-builder')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.log('MongoDB Connection Failed (Running in offline mode):', err.codeName || 'ECONNREFUSED');
        // Suppress full stack trace for cleaner dev experience unless needed
    });

// Routes
app.use('/api/resume', require('./routes/resumeRoutes'));

app.get('/', (req, res) => {
    res.send('Resume Builder API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
