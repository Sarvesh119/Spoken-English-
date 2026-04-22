import mongoose from "mongoose";

const RecordingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: "Lesson" },
  filename: String,
  transcript: String,
  similarity: Number
}, { timestamps: true });

export default mongoose.model("Recording", RecordingSchema);
