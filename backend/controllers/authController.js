import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const loginUser = async (req, res) => {
  try {
    const { rollNo, password } = req.body;

    // 🔍 Find user
    const user = await User.findOne({ rollNo });
    if (!user) {
      return res.status(400).json({ message: "Invalid roll number or password" });
    }

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid roll number or password" });
    }

    // 🎫 Generate token
    const token = generateToken(user._id);

    // ✅ SEND USER OBJECT (IMPORTANT)
    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        rollNo: user.rollNo,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
