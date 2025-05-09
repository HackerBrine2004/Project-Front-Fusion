const jwt = require('jsonwebtoken');
const User = require('../models/UserModels');

const auth = async (req, res, next) => {
    try {
        // Get token from either Authorization header or x-auth-token
        let token = req.header('Authorization')?.replace('Bearer ', '') || req.header('x-auth-token');
        
        if (!token) {
            return res.status(401).json({ error: 'No authentication token, access denied' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user
        const user = await User.findOne({ _id: decoded._id });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ error: 'Please authenticate' });
    }
};

module.exports = auth;