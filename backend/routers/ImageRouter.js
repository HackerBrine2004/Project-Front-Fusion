const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Image = require('../models/Image');
const auth = require('../middleware/auth');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/images';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Route to upload an image
router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Create image record in database
    const image = new Image({
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/images/${req.file.filename}`,
      uploadedBy: req.user._id
    });

    await image.save();

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: {
        id: image._id,
        url: image.url,
        filename: image.filename
      }
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Route to get all images for a user
router.get('/images', auth, async (req, res) => {
  try {
    const images = await Image.find({ uploadedBy: req.user._id })
      .sort({ uploadedAt: -1 });
    res.status(200).json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Route to delete an image
router.delete('/images/:id', auth, async (req, res) => {
  try {
    const image = await Image.findOne({
      _id: req.params.id,
      uploadedBy: req.user._id
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete file from filesystem
    const filePath = path.join(__dirname, '..', image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete record from database
    await image.remove();

    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

module.exports = router; 