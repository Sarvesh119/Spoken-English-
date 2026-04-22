import express from "express";
import Lesson from "../models/Lesson.js";

const router = express.Router();

// seed some sample lessons (call once or use admin UI)
router.post("/seed", async (req, res) => {
  const data = [
    { title: "Greeting", text: "Hello, how are you?" },
    { title: "Daily Routine", text: "I wake up at seven and have breakfast." },
    { title: "Weather", text: "It's a sunny day with a light breeze." }
  ];
  const created = await Lesson.insertMany(data);
  res.json(created);
});

// get all lessons
router.get("/", async (req, res) => {
  const lessons = await Lesson.find().sort({ createdAt: 1 });
  res.json(lessons);
});

// get one
router.get("/:id", async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) return res.status(404).json({ message: "Not found" });
  res.json(lesson);
});

export default router;
