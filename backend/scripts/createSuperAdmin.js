import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/User.js";

/* ================= FIX ENV PATH ================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This resolves to: backend/.env
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

/* ================= DEBUG (TEMPORARY) ================= */
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);

/* ================= CONNECT DB ================= */
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI not found in backend/.env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ MongoDB connected");

const superAdmin = await User.create({
  name: "Superadmin",
  email: "shivamani23241a1274@grietcollege.com",
  rollNo: "SUPERADMIN",
  phone: "7207514035",
  password: "SuperAdmin@123",
  role: "superadmin",
  isVerified: true,
});

console.log("✅ SuperAdmin created successfully");
process.exit();
