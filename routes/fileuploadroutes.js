const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Video } = require("../models/Fileuploadmodel");
const fs = require('fs');
// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up Multer storage for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB limit
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== '.mp4' && ext !== '.mkv') {
            return cb(new Error('Only MP4 and MKV formats are supported'), false);
        }
        cb(null, true);
    }
}).single('file');

// Route to upload a video
router.post("/uploadfiles", (req, res) => {
    upload(req, res, err => {
        if (err) {
            return res.json({ success: false, err });
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename });
    });
});

// Route to create a new video document in the database
router.post("/uploadVideo", async (req, res) => {
    try {
        const { filePath, title } = req.body;

        // Check if a video with the same filePath or title already exists
        const existingVideo = await Video.findOne({ $or: [{ filePath }, { title }] });
        if (existingVideo) {
            return res.status(400).json({ success: false, message: 'A video with this file path or title already exists.' });
        }

        // If not, create a new video document
        const video = new Video(req.body);
        const savedVideo = await video.save();

        return res.status(200).json({ success: true, video: savedVideo });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'An error occurred while uploading the video.', err });
    }
});

// Route to fetch all videos
router.get("/getVideos", (req, res) => {
    Video.find()
        .exec((err, videos) => {
            if (err) {
                return res.status(400).send(err);
            }
            return res.status(200).json({ success: true, videos });
        });
});

// Route to delete a video by ID
router.delete("/deleteVideo/:id", (req, res) => {
    Video.findByIdAndDelete(req.params.id, (err) => {
        if (err) {
            return res.status(400).json({ success: false, err });
        }
        return res.status(200).json({ success: true });
    });
});

module.exports = router;
