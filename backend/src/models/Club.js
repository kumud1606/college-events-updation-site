import mongoose from "mongoose";

const clubSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    shortName: { type: String, trim: true },
    description: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    color: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    headName: { type: String, trim: true },
    enquiryInfo: { type: String, trim: true },
    teachers: [{ type: String, trim: true }],
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  {
    timestamps: true
  }
);

export default mongoose.models.Club || mongoose.model("Club", clubSchema);
