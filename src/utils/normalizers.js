export function getStatusLabel(status) {
  if (status === "going-on") {
    return "Going On";
  }

  if (status === "finished") {
    return "Finished";
  }

  return "Upcoming";
}

export function getClubBadge(club) {
  const source = club.shortName || club.name || "";
  return source
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function normalizeClub(club) {
  return {
    id: club.id,
    slug: club.slug,
    name: club.name,
    short: club.shortName,
    shortName: club.shortName,
    icon: getClubBadge(club),
    logo: club.logoUrl,
    logoUrl: club.logoUrl,
    color: club.color,
    description: club.description,
    totalEvents: club.totalEvents || 0,
    managers: club.managers || [],
    contactNumber: club.contactNumber || "",
    headName: club.headName || "",
    enquiryInfo: club.enquiryInfo || "",
    teachers: club.teachers || []
  };
}

export function normalizeEvent(event) {
  const club = event.club ? normalizeClub(event.club) : null;

  return {
    id: event.id,
    clubId: club?.slug || "",
    club,
    title: event.title,
    date: event.dateLabel,
    startDate: event.startDate,
    endDate: event.endDate,
    venue: event.venue,
    place: event.place,
    additionalInfo: event.additionalInfo || "",
    image: event.imageUrl,
    imageUrl: event.imageUrl,
    mediaType: event.mediaType,
    video: event.videoUrl,
    videoUrl: event.videoUrl,
    poster: event.posterUrl,
    posterUrl: event.posterUrl,
    caption: event.caption || "",
    tags: event.tags || [],
    participantLimit: event.participantLimit,
    volunteerLimit: event.volunteerLimit,
    status: event.status,
    statusLabel: getStatusLabel(event.status),
    registrationOpen: event.registrationOpen,
    registrations: event.registrationCounts || {
      participate: 0,
      volunteer: 0
    }
  };
}
