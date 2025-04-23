require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const router = express.Router();
const generate = require('../utils/CodeGenerator'); // Ensure this path is correct

// Route to generate UI for a page based on a prompt
router.post('/generate-ui', async (req, res) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        return res.status(400).json({ error: 'Valid prompt is required' });
    }

    try {
        const result = await generate(prompt.trim()); // Ensure `generate` is an async function
        res.status(200).json({ result }); // Adjusted response format
    } catch (error) {
        console.error('Error generating UI:', error.message || error);
        res.status(500).json({ error: 'Failed to generate UI. Please try again later.' });
    }
});

// Route to correct UI based on additional prompt
router.post('/correct-ui', async (req, res) => {
    const { initialCode, correctionPrompt } = req.body;

    if (!initialCode || !correctionPrompt || typeof correctionPrompt !== 'string' || !correctionPrompt.trim()) {
        return res.status(400).json({ error: 'Initial code and valid correction prompt are required' });
    }

    try {
        const result = await generate(`${correctionPrompt.trim()} based on the following code:\n\n${initialCode}`);
        res.status(200).json({ result });
    } catch (error) {
        console.error('Error correcting UI:', error.message || error);
        res.status(500).json({ error: 'Failed to correct UI. Please try again later.' });
    }
});

module.exports = router;