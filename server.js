require('dotenv').config();
const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const { Dropbox } = require('dropbox');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Dropbox client
const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_ACCESS_TOKEN
});

// Parse performances from environment variable
let performances = [];
try {
  performances = JSON.parse(process.env.PERFORMANCES || '[]');
} catch (error) {
  console.error('Failed to parse PERFORMANCES env variable:', error);
  console.log('Using empty performances list');
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WEBP) are allowed'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get performances endpoint
app.get('/performances', (req, res) => {
  res.json(performances);
});

// Upload endpoint
app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No photo uploaded' });
    }

    const performanceId = req.body.performance;
    if (!performanceId) {
      return res.status(400).json({ error: 'No performance selected' });
    }

    // Validate performance ID
    const validPerformance = performances.find(p => p.id === performanceId);
    if (!validPerformance) {
      return res.status(400).json({ error: 'Invalid performance selected' });
    }

    console.log('Received photo upload:', req.file.originalname);
    console.log('Performance:', validPerformance.display);

    // Process image with sharp - ensure it's exactly 480x640
    const processedImage = await sharp(req.file.buffer)
      .resize(480, 640, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `photo_${timestamp}_${randomSuffix}.jpg`;
    
    // Create path with performance subfolder
    const baseFolder = process.env.DROPBOX_FOLDER || '/My Joy is Heavy Photos';
    const dropboxPath = `${baseFolder}/${performanceId}/${filename}`;

    console.log('Uploading to Dropbox:', dropboxPath);

    // Upload to Dropbox
    const response = await dbx.filesUpload({
      path: dropboxPath,
      contents: processedImage,
      mode: 'add',
      autorename: true
    });

    console.log('Upload successful:', response.result.name);

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      filename: response.result.name,
      performance: validPerformance.display
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    if (error.error && error.error.error_summary) {
      return res.status(500).json({
        error: 'Dropbox upload failed',
        details: error.error.error_summary
      });
    }

    res.status(500).json({
      error: 'Upload failed',
      details: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the app at http://localhost:${PORT}`);
  console.log(`Or from another device at http://[YOUR_MAC_IP]:${PORT}`);
  console.log(`Configured performances: ${performances.length}`);
  performances.forEach(p => console.log(`  - ${p.display} (${p.id})`));
});
