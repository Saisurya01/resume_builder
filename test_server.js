const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000']
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Test server is running');
});

app.post('/api/resume/generate', (req, res) => {
    console.log('Request received:', req.body);
    res.setHeader('Content-Type', 'application/json');
    res.send({ message: 'Test successful', data: req.body });
});

app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});