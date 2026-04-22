import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email exists" });

    const pwdHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash: pwdHash });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

export default router;
