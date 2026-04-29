import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { serializeRegistration } from "../utils/serializers.js";

export const getMyRegistrations = asyncHandler(async (request, response) => {
  const registrations = await Registration.find({ student: request.user._id })
    .populate({
      path: "event",
      populate: {
        path: "club"
      }
    })
    .sort({ updatedAt: -1 });

  response.json({
    registrations: registrations.map(serializeRegistration)
  });
});

export const getEventRegistrationsForManager = asyncHandler(async (request, response) => {
  const event = await Event.findById(request.params.eventId).populate("club");

  if (!event) {
    throw notFound("Event not found.");
  }

  const managesClub =
    request.user.role === "admin" ||
    request.user.clubs.some((club) => String(club._id) === String(event.club._id));

  if (!managesClub) {
    throw forbidden("You can only view registrations for your assigned club events.");
  }

  const registrations = await Registration.find({ event: event._id })
    .populate("student", "name enrollment email")
    .sort({ updatedAt: -1 });

  const students = registrations.map((registration) => ({
    id: String(registration.student?._id),
    name: registration.student?.name || "Student",
    enrollment: registration.student?.enrollment || "",
    email: registration.student?.email || "",
    participate: Boolean(registration.participate),
    volunteer: Boolean(registration.volunteer),
    updatedAt: registration.updatedAt
  }));

  response.json({
    event: {
      id: String(event._id),
      title: event.title
    },
    participants: students.filter((student) => student.participate),
    volunteers: students.filter((student) => student.volunteer)
  });
});

export const createRegistration = asyncHandler(async (request, response) => {
  const { eventId, participate = false, volunteer = false } = request.body;

  if (!eventId) {
    throw badRequest("eventId is required.");
  }

  const event = await Event.findById(eventId);

  if (!event) {
    throw notFound("Event not found.");
  }

  if (!event.registrationOpen) {
    throw badRequest("Registrations are closed for this event.");
  }

  const existingRegistration = await Registration.findOne({
    event: event._id,
    student: request.user._id
  });

  const [participantCount, volunteerCount] = await Promise.all([
    Registration.countDocuments({ event: event._id, participate: true }),
    Registration.countDocuments({ event: event._id, volunteer: true })
  ]);

  const alreadyParticipating = Boolean(existingRegistration?.participate);
  const alreadyVolunteering = Boolean(existingRegistration?.volunteer);

  if (
    participate &&
    !alreadyParticipating &&
    typeof event.participantLimit === "number" &&
    participantCount >= event.participantLimit
  ) {
    throw badRequest("Participant limit has been reached for this event.");
  }

  if (
    volunteer &&
    !alreadyVolunteering &&
    typeof event.volunteerLimit === "number" &&
    volunteerCount >= event.volunteerLimit
  ) {
    throw badRequest("Volunteer limit has been reached for this event.");
  }

  if (!participate && !volunteer) {
    await Registration.findOneAndDelete({ event: event._id, student: request.user._id });

    response.json({
      registration: null
    });
    return;
  }

  const registration = await Registration.findOneAndUpdate(
    { event: event._id, student: request.user._id },
    {
      event: event._id,
      student: request.user._id,
      participate: Boolean(participate),
      volunteer: Boolean(volunteer)
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  ).populate({
    path: "event",
    populate: {
      path: "club"
    }
  });

  response.status(201).json({
    registration: serializeRegistration(registration)
  });
});
