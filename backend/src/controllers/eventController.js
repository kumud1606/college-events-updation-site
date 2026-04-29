import Club from "../models/Club.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import fs from "fs/promises";
import path from "path";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { getEventStatus, serializeEvent } from "../utils/serializers.js";

async function attachRegistrationCounts(events) {
  const eventIds = events.map((event) => event._id);

  if (eventIds.length === 0) {
    return events;
  }

  const registrations = await Registration.aggregate([
    { $match: { event: { $in: eventIds } } },
    {
      $group: {
        _id: "$event",
        participate: { $sum: { $cond: ["$participate", 1, 0] } },
        volunteer: { $sum: { $cond: ["$volunteer", 1, 0] } }
      }
    }
  ]);

  const countsByEventId = new Map(
    registrations.map((registration) => [
      String(registration._id),
      {
        participate: registration.participate,
        volunteer: registration.volunteer
      }
    ])
  );

  return events.map((event) => {
    event.registrationCounts = countsByEventId.get(String(event._id)) || {
      participate: 0,
      volunteer: 0
    };
    return event;
  });
}

async function resolveClubForManager(request, clubId) {
  const club = await Club.findById(clubId);

  if (!club) {
    throw notFound("Club not found.");
  }

  if (request.user.role === "admin") {
    return club;
  }

  const managesClub = request.user.clubs.some((managedClub) => String(managedClub._id) === String(club._id));

  if (!managesClub) {
    throw forbidden("You can only manage events for clubs assigned to you.");
  }

  return club;
}

function validateEventPayload(payload) {
  const { clubId, title, startDate, endDate, mediaType, participantLimit, volunteerLimit } = payload;

  if (!clubId || !title || !startDate || !endDate) {
    throw badRequest("clubId, title, startDate, and endDate are required.");
  }

  if (new Date(startDate) > new Date(endDate)) {
    throw badRequest("startDate must be before endDate.");
  }

  if (mediaType && !["image", "video"].includes(mediaType)) {
    throw badRequest("mediaType must be image or video.");
  }

  if (participantLimit !== undefined && participantLimit !== null && Number(participantLimit) < 0) {
    throw badRequest("participantLimit must be 0 or greater.");
  }

  if (volunteerLimit !== undefined && volunteerLimit !== null && Number(volunteerLimit) < 0) {
    throw badRequest("volunteerLimit must be 0 or greater.");
  }
}

function normalizeTags(rawTags) {
  if (Array.isArray(rawTags)) {
    return rawTags;
  }

  if (typeof rawTags === "string") {
    return rawTags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function getUploadedMediaUrls(file, fallbackMediaType) {
  if (!file) {
    return {
      mediaType: fallbackMediaType || "image",
      imageUrl: null,
      videoUrl: null,
      posterUrl: null
    };
  }

  const relativeUrl = `/uploads/${file.filename}`;
  const mediaType = file.mimetype.startsWith("video/") ? "video" : "image";

  return {
    mediaType,
    imageUrl: mediaType === "image" ? relativeUrl : null,
    videoUrl: mediaType === "video" ? relativeUrl : null,
    posterUrl: null
  };
}

async function deleteUploadedFile(fileUrl) {
  if (!fileUrl || /^https?:\/\//i.test(fileUrl)) {
    return;
  }

  const fileName = path.basename(fileUrl);
  const absolutePath = path.resolve(process.cwd(), "uploads", fileName);

  try {
    await fs.unlink(absolutePath);
  } catch (_error) {
    // Ignore missing files during cleanup.
  }
}

export const getEvents = asyncHandler(async (request, response) => {
  const { club, status, search } = request.query;
  const filter = {};

  if (club) {
    const clubDocument = await Club.findOne({
      $or: [{ slug: club }, { _id: club }]
    });

    if (!clubDocument) {
      response.json({ events: [] });
      return;
    }

    filter.club = clubDocument._id;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { caption: { $regex: search, $options: "i" } },
      { venue: { $regex: search, $options: "i" } }
    ];
  }

  const events = await Event.find(filter)
    .populate("club")
    .populate("createdBy", "name email")
    .sort({ startDate: -1 });

  const eventsWithCounts = await attachRegistrationCounts(events);
  const filteredEvents =
    status && ["upcoming", "going-on", "finished"].includes(status)
      ? eventsWithCounts.filter((event) => getEventStatus(event.startDate, event.endDate) === status)
      : eventsWithCounts;

  response.json({
    events: filteredEvents.map(serializeEvent)
  });
});

export const getEventById = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.eventId)
    .populate("club")
    .populate("createdBy", "name email");

  if (!event) {
    throw notFound("Event not found.");
  }

  const [eventWithCounts] = await attachRegistrationCounts([event]);

  response.json({
    event: serializeEvent(eventWithCounts)
  });
});

export const createEvent = asyncHandler(async (request, response) => {
  validateEventPayload(request.body);

  const club = await resolveClubForManager(request, request.body.clubId);
  const uploadedMedia = getUploadedMediaUrls(request.file, request.body.mediaType);
  const event = await Event.create({
    club: club._id,
    title: request.body.title,
    caption: request.body.caption,
    venue: request.body.venue,
    place: request.body.place,
    additionalInfo: request.body.additionalInfo,
    startDate: request.body.startDate,
    endDate: request.body.endDate,
    mediaType: uploadedMedia.mediaType || request.body.mediaType || "image",
    imageUrl: uploadedMedia.imageUrl || request.body.imageUrl,
    videoUrl: uploadedMedia.videoUrl || request.body.videoUrl,
    posterUrl: uploadedMedia.posterUrl || request.body.posterUrl,
    tags: normalizeTags(request.body.tags),
    participantLimit: request.body.participantLimit !== undefined && request.body.participantLimit !== ""
      ? Number(request.body.participantLimit)
      : undefined,
    volunteerLimit: request.body.volunteerLimit !== undefined && request.body.volunteerLimit !== ""
      ? Number(request.body.volunteerLimit)
      : undefined,
    registrationOpen: request.body.registrationOpen ?? true,
    createdBy: request.user._id
  });

  const populatedEvent = await Event.findById(event._id)
    .populate("club")
    .populate("createdBy", "name email");

  response.status(201).json({
    event: serializeEvent(populatedEvent)
  });
});

export const updateEvent = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.eventId).populate("club");

  if (!event) {
    throw notFound("Event not found.");
  }

  await resolveClubForManager(request, request.body.clubId || event.club._id);

  const updates = {
    clubId: request.body.clubId || event.club._id,
    title: request.body.title ?? event.title,
    caption: request.body.caption ?? event.caption,
    venue: request.body.venue ?? event.venue,
    place: request.body.place ?? event.place,
    additionalInfo: request.body.additionalInfo ?? event.additionalInfo,
    startDate: request.body.startDate ?? event.startDate,
    endDate: request.body.endDate ?? event.endDate,
    mediaType: request.body.mediaType ?? event.mediaType,
    imageUrl: request.body.imageUrl ?? event.imageUrl,
    videoUrl: request.body.videoUrl ?? event.videoUrl,
    posterUrl: request.body.posterUrl ?? event.posterUrl,
    tags: request.body.tags !== undefined ? normalizeTags(request.body.tags) : event.tags,
    participantLimit:
      request.body.participantLimit !== undefined && request.body.participantLimit !== ""
        ? Number(request.body.participantLimit)
        : event.participantLimit,
    volunteerLimit:
      request.body.volunteerLimit !== undefined && request.body.volunteerLimit !== ""
        ? Number(request.body.volunteerLimit)
        : event.volunteerLimit,
    registrationOpen: request.body.registrationOpen ?? event.registrationOpen
  };

  validateEventPayload(updates);

  event.club = updates.clubId;
  event.title = updates.title;
  event.caption = updates.caption;
  event.venue = updates.venue;
  event.place = updates.place;
  event.additionalInfo = updates.additionalInfo;
  event.startDate = updates.startDate;
  event.endDate = updates.endDate;
  event.mediaType = updates.mediaType;
  event.imageUrl = updates.imageUrl;
  event.videoUrl = updates.videoUrl;
  event.posterUrl = updates.posterUrl;
  event.tags = updates.tags;
  event.participantLimit = updates.participantLimit;
  event.volunteerLimit = updates.volunteerLimit;
  event.registrationOpen = updates.registrationOpen;
  await event.save();
  await event.populate("club");
  await event.populate("createdBy", "name email");

  response.json({
    event: serializeEvent(event)
  });
});

export const deleteEvent = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.eventId).populate("club");

  if (!event) {
    throw notFound("Event not found.");
  }

  await resolveClubForManager(request, event.club._id);
  await Registration.deleteMany({ event: event._id });
  await deleteUploadedFile(event.imageUrl);
  await deleteUploadedFile(event.videoUrl);
  await event.deleteOne();

  response.status(204).send();
});
