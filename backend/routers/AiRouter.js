require("dotenv").config(); // Load environment variables from .env file
const express = require("express");
const router = express.Router();
const generate = require("../utils/CodeGenerator"); // Ensure this path is correct
const Session = require("../models/Session");
const auth = require("../middleware/auth");

// Route to generate UI for a page based on a prompt
router.post("/generate-ui", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Valid prompt is required" });
  }

  try {
    const result = await generate(prompt.trim()); // Ensure `generate` is an async function
    res.status(200).json({ result }); // Adjusted response format
  } catch (error) {
    console.error("Error generating UI:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to generate UI. Please try again later." });
  }
});

// Route to correct UI based on additional prompt
router.post("/correct-ui", async (req, res) => {
  const { initialCode, correctionPrompt } = req.body;

  if (
    !initialCode ||
    !correctionPrompt ||
    typeof correctionPrompt !== "string" ||
    !correctionPrompt.trim()
  ) {
    return res
      .status(400)
      .json({ error: "Initial code and valid correction prompt are required" });
  }

  try {
    const result = await generate(
      `${correctionPrompt.trim()} based on the following code:\n\n${initialCode}`
    );
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error correcting UI:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to correct UI. Please try again later." });
  }
});

// Route to modify code based on client instructions
router.post("/modify-code", async (req, res) => {
  const { code, instructions } = req.body;

  if (
    !code ||
    !instructions ||
    typeof instructions !== "string" ||
    !instructions.trim()
  ) {
    return res
      .status(400)
      .json({ error: "Code and valid modification instructions are required" });
  }

  try {
    const result = await generate(
      `${instructions.trim()} based on the following code:\n\n${code}`
    );
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error modifying code:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to modify code. Please try again later." });
  }
});

// Route to save code session
router.post('/save-session', auth, async (req, res) => {
    const { name, files, framework, prompt, activeFile, hasGenerated } = req.body;
  
    // Validation
    if (!name?.trim() || !files || Object.keys(files).length === 0 || !framework) {
      return res.status(400).json({ error: 'Session name, valid files, and framework are required' });
    }
  
    if (!['tailwind', 'react', 'both'].includes(framework)) {
      return res.status(400).json({ error: 'Invalid framework value' });
    }
  
    // Content sanitization
    for (const [fileName, content] of Object.entries(files)) {
      if (typeof content !== 'string' || content.includes('<script>') || content.includes('eval(')) {
        return res.status(400).json({ error: 'Invalid code content detected' });
      }
    }
  
    try {
      // Existing duplicate check
      const existingSession = await Session.findOne({ 
        userId: req.user._id,
        name: name.trim()
      });
  
      if (existingSession) {
        return res.status(400).json({ error: 'Session name already exists' });
      }
  
      // Create new session with all required fields
      const session = new Session({
        userId: req.user._id,
        name: name.trim(),
        files,
        framework,
        prompt: prompt || '',
        activeFile: activeFile || '',
        hasGenerated: hasGenerated || false
      });
      await session.save();
      res.status(200).json({ message: 'Session saved', session });
  
    } catch (error) {
      console.error('Error saving session:', error);
      res.status(500).json({ error: 'Failed to save session' });
    }
  });



// The existing route is correct but let's ensure auth middleware is properly implemented
router.get("/sessions", auth, async (req, res) => {
  try {
    // This correctly finds sessions for the authenticated user
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("name framework createdAt updatedAt");

    res.status(200).json({ sessions });
  } catch (error) {
    console.error("Error fetching sessions:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to fetch sessions. Please try again later." });
    // ... error handling
  }
});

// Route to get a specific session
router.get("/sessions/:id", auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json({ session });
  } catch (error) {
    console.error("Error fetching session:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to fetch session. Please try again later." });
  }
});

// Route to update a session
router.put("/sessions/:id", auth, async (req, res) => {
  const { name, files, framework, prompt, activeFile, hasGenerated } = req.body;

  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Check if new name conflicts with existing session
    if (name && name !== session.name) {
      const existingSession = await Session.findOne({
        userId: req.user._id,
        name: name.trim(),
        _id: { $ne: req.params.id },
      });

      if (existingSession) {
        return res
          .status(400)
          .json({ error: "A session with this name already exists" });
      }
    }

    // Update session fields
    if (name) session.name = name.trim();
    if (files) session.files = files;
    if (framework) session.framework = framework;
    if (prompt !== undefined) session.prompt = prompt;
    if (activeFile !== undefined) session.activeFile = activeFile;
    if (hasGenerated !== undefined) session.hasGenerated = hasGenerated;

    await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    console.error("Error updating session:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to update session. Please try again later." });
  }
});

// Route to delete a session
router.delete("/sessions/:id", auth, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error.message || error);
    res
      .status(500)
      .json({ error: "Failed to delete session. Please try again later." });
  }
});

module.exports = router;
