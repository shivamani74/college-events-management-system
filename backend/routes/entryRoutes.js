import express from "express";
import jwt from "jsonwebtoken";
import protect from "../middleware/authMiddleware.js";
import EventRegistration from "../models/EventRegistration.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* =========================================================
   ADMIN QR SCAN — FINAL & CORRECT
========================================================= */
router.post("/scan", protect, async (req, res) => {
  try {
    // Only admins
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access only" });
    }

    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ message: "QR token missing" });
    }

    // Verify QR JWT
    let decoded;
    try {
      decoded = jwt.verify(qrToken, process.env.QR_SECRET_KEY);
    } catch {
      return res.status(400).json({ message: "Invalid or expired QR" });
    }

    const registration = await EventRegistration.findById(
      decoded.registrationId
    )
      .populate("user", "name phone email")
      .populate("event", "title");

    if (!registration) {
      return res.status(404).json({ message: "Invalid ticket" });
    }

    if (registration.status === "checked_in") {
      return res.status(400).json({ message: "Ticket already used" });
    }

    if (registration.status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    registration.status = "checked_in";
    registration.checkedInAt = new Date();
    await registration.save();

    await sendEmail({
      to: registration.user.email,
      subject: "🎉 Entry Confirmed",
      html: `
        <h3>Welcome ${registration.user.name}</h3>
        <p>Your entry for <b>${registration.event.title}</b> is confirmed.</p>
      `,
    });

    res.json({
      success: true,
      student: {
        name: registration.user.name,
        phone: registration.user.phone,
      },
      event: registration.event.title,
    });
  } catch (err) {
    console.error("SCAN ERROR:", err);
    res.status(500).json({ message: "Scan failed" });
  }
});

export default router;
