import mongoose from "mongoose";

const eventRegistrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    status: {
      type: String,
      enum: ["registered", "paid", "checked_in"],
      default: "registered",
    },

    qrToken: {
      type: String,
      default: null,
    },

    checkedInAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("EventRegistration", eventRegistrationSchema);
