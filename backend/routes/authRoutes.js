import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import sendEmail from "../utils/sendEmail.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/* =====================================================
   STUDENT REGISTER → SEND OTP
===================================================== */
router.post("/register", async (req, res) => {
  try {
    let { name, email, rollNo, phone, password } = req.body;

    if (!name || !email || !rollNo || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    email = email.toLowerCase().trim();

    if (!email.endsWith("@grietcollege.com")) {
      return res.status(400).json({
        message: "Only @grietcollege.com email addresses are allowed",
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { rollNo }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await Otp.create({ email, otp, expiresAt });

    await sendEmail({
      to: email,
      subject: "Your OTP for Registration",
      html: `
        <h2>OTP Verification</h2>
        <h1>${otp}</h1>
        <p>Valid for 5 minutes</p>
      `,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   VERIFY OTP → CREATE STUDENT
===================================================== */
router.post("/verify-otp", async (req, res) => {
  try {
    let { name, email, rollNo, phone, password, otp } = req.body;

    email = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await User.create({
      name,
      email,
      rollNo,
      phone,
      password,
      role: "student",       // ✅ IMPORTANT
      isVerified: true,
    });

    await Otp.deleteMany({ email });

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
    });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   LOGIN (STUDENT + ADMIN)
===================================================== */
router.post("/login", async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    if (!rollNo || !password) {
      return res.status(400).json({
        message: "Roll number and password required",
      });
    }

    const user = await User.findOne({ rollNo });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message:
          user.role === "admin"
            ? "Admin account pending verification"
            : "User not verified",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,     // ✅ embedded in JWT
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔥 THIS IS WHAT YOUR FRONTEND NEEDS
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
        role: user.role,      // ✅ THIS WAS MISSING BEFORE
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =====================================================
   ADMIN SIGNUP (DOCUMENT VERIFICATION)
===================================================== */
router.post(
  "/admin/signup",
  upload.single("proofDocument"),
  async (req, res) => {
    try {
      const {
        name,
        email,
        rollNo,
        phone,
        password,
        clubName,
      } = req.body;

      if (!name || !email || !rollNo || !password || !req.file) {
        return res.status(400).json({
          message:
            "All required fields and verification document must be provided",
        });
      }

      const existing = await User.findOne({
        $or: [{ email }, { rollNo }],
      });

      if (existing) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      await User.create({
        name,
        email,
        rollNo,
        phone,
        password,
        role: "admin",            // ✅ ADMIN
        isVerified: false,        // ❌ pending approval
        adminVerification: {
          proofDocument: req.file.path,
          clubName,
          submittedAt: new Date(),
        },
      });

      res.status(201).json({
        success: true,
        message: "Admin signup submitted for verification",
      });
    } catch (err) {
      console.error("ADMIN SIGNUP ERROR:", err);
      res.status(500).json({
        message: "Admin signup failed",
      });
    }
  }
);

export default router;
