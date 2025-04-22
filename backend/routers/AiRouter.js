require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const generate = require('../utils/CodeGenerator');
const router = express.Router();

// Route to generate UI for a page based on a prompt
router.post('/generate-ui', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const result = await generate(prompt);
        res.status(200).json({ result }); // Adjusted response format
    } catch (error) {
        console.error('Error generating UI:', error);
        res.status(500).json({ error: 'Failed to generate UI' });
    }
});

module.exports = router;