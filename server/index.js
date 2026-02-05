require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - Enhanced CORS for production (allow all origins for debugging)
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all origins for now - you can restrict this later
        return callback(null, true);
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle preflight requests explicitly
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        cors(corsOptions)(req, res, next);
    } else {
        next();
    }
});
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
