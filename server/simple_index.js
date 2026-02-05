require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Simple CORS - allow everything for now
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log('No MONGO_URI found in .env (Running in offline mode)');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected Successfully');
    } catch (err) {
        console.log('⚠️ MongoDB Connection Failed (Running in offline mode):', err.message || 'ECONNREFUSED');
    }
};

connectDB();

// Routes
app.use('/api/resume', require('./routes/resumeRoutes'));

app.get('/', (req, res) => {
    res.send('Resume Builder API is running');
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});