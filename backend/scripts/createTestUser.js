require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createTestUser = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if test user already exists
        const existingUser = await User.findOne({ email: 'test@example.com' });
        if (existingUser) {
            console.log('Test user already exists');
            process.exit(0);
        }

        // Create test user
        const testUser = new User({
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User'
        });

        await testUser.save();
        console.log('Test user created successfully');
        console.log('Email: test@example.com');
        console.log('Password: password123');

    } catch (error) {
        console.error('Error creating test user:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createTestUser(); 