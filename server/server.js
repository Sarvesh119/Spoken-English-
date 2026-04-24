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

// ✅ CORS
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://spoken-english-six.vercel.app/"
  ],
  credentials: true
}));

// ✅ Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/recordings", recordingRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.json({
    status: "Spoken English API running 🚀",
    time: new Date()
  });
});

// ✅ 404 handler (Express 5 safe)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ Error handler (MUST be last)
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ MongoDB + Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });