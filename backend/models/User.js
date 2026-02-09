import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    rollNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    /* ================= ROLE SYSTEM ================= */
    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      default: "student",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    /* ================= ADMIN VERIFICATION ================= */
    adminVerification: {
      proofDocument: {
        type: String, // file path / secure URL
      },

      clubName: {
        type: String,
        trim: true,
      },

      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },

      submittedAt: {
        type: Date,
      },

      verifiedAt: {
        type: Date,
      },

      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // superadmin
      },
    },

    /* ================= AUDIT SUPPORT ================= */
    lastLoginAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

/* ================= PASSWORD HASH ================= */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* ================= PASSWORD MATCH ================= */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
