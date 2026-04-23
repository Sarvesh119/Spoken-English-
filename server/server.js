import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";  // ✅ Import before use
import authRoutes from "./routes/auth.js";
import lessonRoutes from "./routes/lessons.js";
import recordingRoutes from "./routes/recordings.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// ✅ CORS FIRST - before all routes/middleware
app.use(cors({
  origin: "*",  // Allows Vercel + all for dev
  credentials: true,  // If using cookies/sessions later
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Handle all preflight requests
app.options("*", cors());

// ✅ Body parser next
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Error handling middleware - AFTER routes
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/recordings", recordingRoutes);

// ✅ Health check - wakes Render
app.get("/", (req, res) => {
  res.json({ status: "Spoken English API running 🚀", timestamp: new Date().toISOString() });
});

// ✅ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ✅ MongoDB + Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log(`📱 Health: https://your-app.onrender.com/`);  // Ping reminder
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });