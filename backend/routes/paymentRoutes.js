import express from "express";
import crypto from "crypto";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

import protect from "../middleware/authMiddleware.js";
import razorpay from "../config/razorpay.js";
import Event from "../models/Event.js";
import Payment from "../models/Payment.js";
import EventRegistration from "../models/EventRegistration.js";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

/* =========================================================
   CREATE PAYMENT ORDER
========================================================= */
router.post("/create-order/:eventId", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { eventId } = req.params;

    /* --------------------------------------------------
       1️⃣ Fetch Event
    -------------------------------------------------- */
    const event = await Event.findById(eventId).populate("createdBy");

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    /* --------------------------------------------------
       2️⃣ ⏰ REGISTRATION DEADLINE CHECK (CRITICAL)
    -------------------------------------------------- */
    const now = new Date();
    const deadline = new Date(event.registrationDeadline);

    if (now > deadline) {
      return res.status(400).json({
        message: "Registrations are closed for this event",
      });
    }

    /* --------------------------------------------------
       3️⃣ Prevent duplicate PAID registration
    -------------------------------------------------- */
    const alreadyPaid = await EventRegistration.findOne({
      user: userId,
      event: eventId,
      status: { $in: ["paid", "checked_in"] },
    });

    if (alreadyPaid) {
      return res.status(400).json({
        message: "You have already registered and paid for this event",
      });
    }

    /* --------------------------------------------------
       4️⃣ Create Razorpay Order
    -------------------------------------------------- */
    const order = await razorpay.orders.create({
  amount: Math.round(event.price * 100), // paise
  currency: "INR",
  receipt: `r_${Math.floor(Date.now() / 1000)}`, // ✅ FIX
});

    /* --------------------------------------------------
       5️⃣ Save Payment (SOURCE OF TRUTH)
    -------------------------------------------------- */
    const payment = await Payment.create({
      user: userId,
      event: eventId,
      admin: event.createdBy._id,
      amount: event.price,
      razorpayOrderId: order.id,
      status: "created",
    });

    /* --------------------------------------------------
       6️⃣ Respond to Frontend
    -------------------------------------------------- */
    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: event.price,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
      paymentId: payment._id,
    });

  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({
      message: "Failed to create payment order",
    });
  }
});
// ... other imports remain the same
// Make sure you have: import QRCode from "qrcode";



/* ================= VERIFY PAYMENT ================= */
router.post("/verify", protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    // ❌ Missing fields
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId
    ) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // ✅ 1️⃣ Fetch payment from DB (SOURCE OF TRUTH)
    const payment = await Payment.findById(paymentId)
      .populate("user")
      .populate("event");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // ❌ Already verified
    if (payment.status === "paid") {
      return res.status(400).json({ message: "Payment already verified" });
    }

    // ✅ 2️⃣ Razorpay signature verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // ✅ 3️⃣ Mark payment paid
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();

    // ✅ 4️⃣ Create / fetch registration
    let registration = await EventRegistration.findOne({
      user: payment.user._id,
      event: payment.event._id,
    });

    if (!registration) {
      registration = await EventRegistration.create({
        user: payment.user._id,
        event: payment.event._id,
        payment: payment._id,
        status: "paid",
      });
    }

    // ✅ 5️⃣ Generate QR TOKEN (JWT)
    const qrToken = jwt.sign(
      { registrationId: registration._id.toString() },
      process.env.QR_SECRET_KEY,
      { expiresIn: "2d" }
    );

    registration.qrToken = qrToken;
    await registration.save();

    // ✅ 6️⃣ Generate QR IMAGE
    const qrBuffer = await QRCode.toBuffer(qrToken, {
      width: 800,
      margin: 4,
      errorCorrectionLevel: "H",
    });

    // ✅ 7️⃣ Email QR as ATTACHMENT (mobile-safe)
    await sendEmail({
      to: payment.user.email,
      subject: "🎟 Event Ticket QR",
      html: `
        <h2>Payment Successful ✅</h2>
        <p>Hello ${payment.user.name},</p>
        <p>Your QR ticket is attached.</p>
        <p><b>Do not share. One-time entry only.</b></p>
      `,
      attachments: [
        {
          filename: "event-ticket.png",
          content: qrBuffer,
          contentType: "image/png",
        },
      ],
    });

    return res.json({
      success: true,
      message: "Payment verified & QR generated",
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ message: "Verification failed" });
  }
});
export default router;