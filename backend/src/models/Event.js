import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    club: { type: mongoose.Schema.Types.ObjectId, ref: "Club", required: true },
    title: { type: String, required: true, trim: true },
    caption: { type: String, trim: true },
    venue: { type: String, trim: true },
    place: { type: String, trim: true },
    additionalInfo: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      default: "image"
    },
    imageUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    posterUrl: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    participantLimit: { type: Number, min: 0 },
    volunteerLimit: { type: Number, min: 0 },
    registrationOpen: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

eventSchema.index({ club: 1, startDate: 1 });

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
