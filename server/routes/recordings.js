import express from "express";
import multer from "multer";
import Recording from "../models/Recording.js";
import path from "path";
import fs from "fs";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = "uploads";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`);
  }
});
const upload = multer({ storage });

// upload recording (multipart/form-data: file + JSON fields: userId, lessonId, transcript, similarity)
router.post("/upload", upload.single("audio"), async (req, res) => {
  try {
    const { userId, lessonId, transcript, similarity } = req.body;
    const recording = await Recording.create({
      userId, lessonId,
      filename: req.file.filename,
      transcript,
      similarity: parseFloat(similarity) || null
    });
    res.json(recording);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// list recordings (optionally by user)
router.get("/", async (req, res) => {
  const { userId } = req.query;
  const q = userId ? { userId } : {};
  const items = await Recording.find(q).sort({ createdAt: -1 });
  res.json(items);
});

export default router;
