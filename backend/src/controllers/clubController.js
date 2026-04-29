import Club from "../models/Club.js";
import Event from "../models/Event.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { serializeClub } from "../utils/serializers.js";

export const getClubs = asyncHandler(async (_request, response) => {
  const [clubs, eventCounts] = await Promise.all([
    Club.find().populate("managers", "name email enrollment").sort({ name: 1 }),
    Event.aggregate([{ $group: { _id: "$club", totalEvents: { $sum: 1 } } }])
  ]);

  const countsByClubId = new Map(eventCounts.map((item) => [String(item._id), item.totalEvents]));

  response.json({
    clubs: clubs.map((club) => ({
      ...serializeClub(club),
      managers: (club.managers || []).map((manager) => ({
        id: String(manager._id),
        name: manager.name,
        email: manager.email,
        enrollment: manager.enrollment
      })),
      totalEvents: countsByClubId.get(String(club._id)) || 0
    }))
  });
});

export const getClubBySlug = asyncHandler(async (request, response) => {
  const club = await Club.findOne({ slug: request.params.slug }).populate("managers", "name email enrollment");

  if (!club) {
    throw notFound("Club not found.");
  }

  const events = await Event.find({ club: club._id }).sort({ startDate: -1 });

  response.json({
    club: {
      ...serializeClub(club),
      managers: (club.managers || []).map((manager) => ({
        id: String(manager._id),
        name: manager.name,
        email: manager.email,
        enrollment: manager.enrollment
      })),
      totalEvents: events.length
    }
  });
});

export const updateClubDetails = asyncHandler(async (request, response) => {
  const club = await Club.findById(request.params.clubId).populate("managers", "name email enrollment");

  if (!club) {
    throw notFound("Club not found.");
  }

  const managesClub =
    request.user.role === "admin" ||
    request.user.clubs.some((managedClub) => String(managedClub._id) === String(club._id));

  if (!managesClub) {
    throw forbidden("You can only update your assigned club.");
  }

  const teachers = Array.isArray(request.body.teachers)
    ? request.body.teachers
    : typeof request.body.teachers === "string"
      ? request.body.teachers.split(",").map((item) => item.trim()).filter(Boolean)
      : club.teachers;

  if (
    request.body.description === undefined &&
    request.body.contactNumber === undefined &&
    request.body.headName === undefined &&
    request.body.enquiryInfo === undefined &&
    request.body.teachers === undefined
  ) {
    throw badRequest("At least one club detail must be provided.");
  }

  club.description = request.body.description ?? club.description;
  club.contactNumber = request.body.contactNumber ?? club.contactNumber;
  club.headName = request.body.headName ?? club.headName;
  club.enquiryInfo = request.body.enquiryInfo ?? club.enquiryInfo;
  club.teachers = teachers;

  await club.save();
  await club.populate("managers", "name email enrollment");

  response.json({
    club: {
      ...serializeClub(club),
      managers: (club.managers || []).map((manager) => ({
        id: String(manager._id),
        name: manager.name,
        email: manager.email,
        enrollment: manager.enrollment
      }))
    }
  });
});
