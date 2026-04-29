import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    enrollment: { type: String, trim: true, required: true, unique: true },
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "manager", "admin"],
      default: "student"
    },
    onboardingComplete: {
      type: Boolean,
      default: false
    },
    clubs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Club" }]
  },
  {
    timestamps: true
  }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
