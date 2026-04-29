function buildAbsoluteUrl(value) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function formatEventDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const sameDay =
    start.getUTCFullYear() === end.getUTCFullYear() &&
    start.getUTCMonth() === end.getUTCMonth() &&
    start.getUTCDate() === end.getUTCDate();

  if (sameDay) {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(start);
  }

  return `${new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(start)} - ${new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(end)}`;
}

export function getEventStatus(startDate, endDate, now = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now > end) {
    return "finished";
  }

  if (now >= start && now <= end) {
    return "going-on";
  }

  return "upcoming";
}

export function serializeClub(club) {
  return {
    id: String(club._id),
    code: club.code,
    slug: club.slug,
    name: club.name,
    shortName: club.shortName,
    description: club.description,
    logoUrl: buildAbsoluteUrl(club.logoUrl),
    color: club.color,
    contactNumber: club.contactNumber,
    headName: club.headName,
    enquiryInfo: club.enquiryInfo,
    teachers: club.teachers || [],
    managerIds: (club.managers || []).map((manager) =>
      typeof manager === "string" ? manager : String(manager._id || manager)
    )
  };
}

export function serializeUser(user) {
  return {
    id: String(user._id),
    enrollment: user.enrollment,
    name: user.name,
    email: user.email,
    role: user.role,
    onboardingComplete: Boolean(user.onboardingComplete),
    clubs: Array.isArray(user.clubs) ? user.clubs.map(serializeClub) : []
  };
}

export function serializeEvent(event) {
  const club = event.club && typeof event.club === "object" ? serializeClub(event.club) : null;

  return {
    id: String(event._id),
    club,
    title: event.title,
    caption: event.caption,
    venue: event.venue,
    place: event.place,
    additionalInfo: event.additionalInfo,
    startDate: event.startDate,
    endDate: event.endDate,
    dateLabel: formatEventDateRange(event.startDate, event.endDate),
    mediaType: event.mediaType,
    imageUrl: buildAbsoluteUrl(event.imageUrl),
    videoUrl: buildAbsoluteUrl(event.videoUrl),
    posterUrl: buildAbsoluteUrl(event.posterUrl),
    tags: event.tags || [],
    participantLimit: event.participantLimit,
    volunteerLimit: event.volunteerLimit,
    registrationOpen: event.registrationOpen,
    status: getEventStatus(event.startDate, event.endDate),
    registrationCounts: event.registrationCounts || {
      participate: 0,
      volunteer: 0
    },
    createdBy: event.createdBy ? String(event.createdBy._id || event.createdBy) : null,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt
  };
}

export function serializeRegistration(registration) {
  return {
    id: String(registration._id),
    event: registration.event && typeof registration.event === "object"
      ? serializeEvent(registration.event)
      : String(registration.event),
    student: registration.student ? String(registration.student._id || registration.student) : null,
    participate: registration.participate,
    volunteer: registration.volunteer,
    createdAt: registration.createdAt,
    updatedAt: registration.updatedAt
  };
}

export function serializeCertificate(certificate) {
  return {
    id: String(certificate._id),
    event: certificate.event && typeof certificate.event === "object"
      ? serializeEvent(certificate.event)
      : String(certificate.event),
    student: certificate.student ? String(certificate.student._id || certificate.student) : null,
    roleLabel: certificate.roleLabel,
    certificateUrl: buildAbsoluteUrl(certificate.certificateUrl),
    issuedAt: certificate.issuedAt,
    downloadedAt: certificate.downloadedAt,
    createdAt: certificate.createdAt,
    updatedAt: certificate.updatedAt
  };
}
