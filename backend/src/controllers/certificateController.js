import Certificate from "../models/Certificate.js";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";
import asyncHandler from "../utils/asyncHandler.js";
import { badRequest, forbidden, notFound } from "../utils/errors.js";
import { getEventStatus, serializeCertificate } from "../utils/serializers.js";

function deriveRoleLabel(registration) {
  if (registration.participate && registration.volunteer) {
    return "Participant and Volunteer";
  }

  if (registration.volunteer) {
    return "Volunteer";
  }

  return "Participant";
}

export const getCertificates = asyncHandler(async (request, response) => {
  const completedRegistrations = await Registration.find({
    student: request.user._id
  })
    .populate({
      path: "event",
      populate: {
        path: "club"
      }
    });

  for (const registration of completedRegistrations) {
    if (!registration.event) {
      continue;
    }

    const status = getEventStatus(registration.event.startDate, registration.event.endDate);

    if (status !== "finished") {
      continue;
    }

    await Certificate.findOneAndUpdate(
      {
        event: registration.event._id,
        student: request.user._id
      },
      {
        event: registration.event._id,
        student: request.user._id,
        roleLabel: deriveRoleLabel(registration),
        $setOnInsert: {
          issuedAt: new Date()
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );
  }

  const certificates = await Certificate.find({ student: request.user._id })
    .populate({
      path: "event",
      populate: {
        path: "club"
      }
    })
    .sort({ issuedAt: -1, createdAt: -1 });

  response.json({
    certificates: certificates.map((certificate) => ({
      ...serializeCertificate(certificate),
      canDownload: getEventStatus(certificate.event.startDate, certificate.event.endDate) === "finished"
    }))
  });
});

export const issueCertificate = asyncHandler(async (request, response) => {
  const { eventId, studentId, roleLabel, certificateUrl } = request.body;

  if (!eventId || !studentId || !roleLabel) {
    throw badRequest("eventId, studentId, and roleLabel are required.");
  }

  const [event, registration] = await Promise.all([
    Event.findById(eventId).populate("club"),
    Registration.findOne({ event: eventId, student: studentId })
  ]);

  if (!event) {
    throw notFound("Event not found.");
  }

  if (!registration) {
    throw badRequest("The selected student is not registered for this event.");
  }

  const userManagesClub =
    request.user.role === "admin" ||
    request.user.clubs.some((club) => String(club._id) === String(event.club._id));

  if (!userManagesClub) {
    throw forbidden("You can only issue certificates for your own club events.");
  }

  const certificate = await Certificate.findOneAndUpdate(
    {
      event: eventId,
      student: studentId
    },
    {
      event: eventId,
      student: studentId,
      roleLabel,
      certificateUrl,
      issuedAt: new Date()
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
    certificate: serializeCertificate(certificate)
  });
});

export const markCertificateDownloaded = asyncHandler(async (request, response) => {
  const certificate = await Certificate.findById(request.params.certificateId).populate({
    path: "event",
    populate: {
      path: "club"
    }
  });

  if (!certificate) {
    throw notFound("Certificate not found.");
  }

  if (String(certificate.student) !== String(request.user._id)) {
    throw forbidden("You can only update your own certificates.");
  }

  certificate.downloadedAt = new Date();
  await certificate.save();

  response.json({
    certificate: serializeCertificate(certificate)
  });
});
