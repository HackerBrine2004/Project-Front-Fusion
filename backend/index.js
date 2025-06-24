require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const AiRouter = require('./routers/AiRouter');
const UserRouter = require('./routers/UserRouter');
const ImageRouter = require('./routers/ImageRouter');

const app = express();

// Enable CORS for all routes
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

 //Serve static files from uploads directory
 app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Routes
 app.use('/code', AiRouter);
 app.use('/user', UserRouter);
 app.use('/upload', ImageRouter);

// Error handling middleware
 app.use((err, req, res, next) => {
     console.error(err.stack);
     res.status(500).json({ error: 'Something went wrong!' });
 });

 // Connect to MongoDB
 mongoose.connect(process.env.DB_URL)
     .then(() => console.log('Connected to MongoDB'))
     .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

