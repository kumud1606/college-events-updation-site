import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["normal", "important", "urgent"],
      default: "important"
    },
    audience: {
      type: String,
      enum: ["all", "students", "managers"],
      default: "all"
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Notice || mongoose.model("Notice", noticeSchema);
