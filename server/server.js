import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import lessonRoutes from "./routes/lessons.js";
import recordingRoutes from "./routes/recordings.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",   // local frontend
  "https://your-new-vercel-app.vercel.app"  // your new project frontend
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));
app.use(express.json());

// static folder to serve uploaded files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/recordings", recordingRoutes);

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => console.log(`MongoDB Connect sucessfully \nServer running on port ${PORT}`));
  })
  .catch(err => console.error("MongoDB connection error:", err));
