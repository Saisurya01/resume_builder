require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const corsOptions = {
    origin: [
        'https://resume-builder-frontend-6vmo.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000',
        process.env.FRONTEND_URL
    ].filter(Boolean),
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
