import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDatabase from "../config/db.js";
import Club from "../models/Club.js";
import Event from "../models/Event.js";
import Notice from "../models/Notice.js";
import User from "../models/User.js";
import { seedClubs, seedEvents, seedNotices, seedUsers } from "../data/seedData.js";
import { hashPassword } from "../utils/auth.js";

dotenv.config();

async function seed() {
  await connectDatabase();

  await Promise.all([Club.deleteMany({}), Event.deleteMany({}), Notice.deleteMany({}), User.deleteMany({})]);

  const createdClubs = await Club.insertMany(seedClubs);
  const clubBySlug = new Map(createdClubs.map((club) => [club.slug, club]));

  const createdUsers = [];
  for (const user of seedUsers) {
    const passwordHash = await hashPassword(user.password);
    const createdUser = await User.create({
      enrollment: user.enrollment,
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
      onboardingComplete: Boolean(user.onboardingComplete),
      clubs: user.clubs.map((clubSlug) => clubBySlug.get(clubSlug)?._id).filter(Boolean)
    });

    createdUsers.push(createdUser);
  }

  for (const user of createdUsers.filter((item) => item.role === "manager")) {
    await Club.updateMany(
      {
        _id: { $in: user.clubs }
      },
      {
        $addToSet: { managers: user._id }
      }
    );
  }

  const adminUser = createdUsers.find((user) => user.role === "admin");

  await Event.insertMany(
    seedEvents.map((event) => ({
      club: clubBySlug.get(event.clubSlug)?._id,
      title: event.title,
      caption: event.caption,
      venue: event.venue,
      startDate: event.startDate,
      endDate: event.endDate,
      mediaType: event.mediaType || "image",
      imageUrl: event.imageUrl,
      videoUrl: event.videoUrl,
      posterUrl: event.posterUrl,
      tags: event.tags,
      createdBy: adminUser?._id
    }))
  );

  await Notice.insertMany(
    seedNotices.map((notice) => ({
      ...notice,
      createdBy: adminUser?._id
    }))
  );

  console.log("Database seeded successfully.");
  console.log("Admin login: GEU2026001 / Admin@123");
  console.log("Manager login: GEU2026101 / Manager@123");
  console.log("Student login: GEU2026201 / Student@123");
}

seed()
  .catch((error) => {
    console.error("Failed to seed database:", error);
    process.exit(1);
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });
