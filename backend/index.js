require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const AiRouter = require('./routers/AiRouter');
const UserRouter = require('./routers/UserRouter');

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Routes
app.use('/code', AiRouter);
app.use('/user', UserRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

