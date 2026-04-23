import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import lessonRoutes from "./routes/lessons.js";
import recordingRoutes from "./routes/recordings.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

import cors from "cors";

// ✅ APPLY THIS BEFORE EVERYTHING
app.use(cors({
  origin: "*"
}));

// ✅ HANDLE PREFLIGHT
app.options("*", cors());



// ✅ Middleware
app.use(express.json());

// ✅ Static uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/lessons", lessonRoutes);
app.use("/api/recordings", recordingRoutes);

// ✅ Health route
app.get("/", (req, res) => {
  res.send("Spoken English API is running 🚀");
});

// ✅ MongoDB + Server
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));