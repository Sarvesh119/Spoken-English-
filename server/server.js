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

// ✅ CORS FIX (handles Vercel + local properly)
const allowedOrigins = [
  "http://localhost:5173",
  "https://spoken-english-qaxnwyizo-sarveshs-projects-23626ae2.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (mobile apps, postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Fix preflight (important for POST requests)
app.options("*", cors());

// ✅ Static folder for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/recordings", recordingRoutes);

// ✅ Health check route (very useful for testing)
app.get("/", (req, res) => {
  res.send("Spoken English API is running 🚀");
});

// ✅ Database + Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });