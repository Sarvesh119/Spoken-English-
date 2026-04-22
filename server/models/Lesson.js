import mongoose from "mongoose";

const LessonSchema = new mongoose.Schema({
  title: String,
  text: String, // the target sentence(s) to practice
  difficulty: { type: String, default: "easy" }
}, { timestamps: true });

export default mongoose.model("Lesson", LessonSchema);
