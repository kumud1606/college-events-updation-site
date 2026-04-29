import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import EventCard from "../components/EventCard";
import EventStatusNav from "../components/EventStatusNav";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { downloadCertificatePdf } from "../utils/certificate";
import { normalizeEvent } from "../utils/normalizers";

function toRegistrationStateMap(registrations) {
  return Object.fromEntries(
    registrations.map((registration) => [
      String(registration.event.id),
      {
        participate: {
          active: Boolean(registration.participate),
          registeredAt: registration.updatedAt
        },
        volunteer: {
          active: Boolean(registration.volunteer),
          registeredAt: registration.updatedAt
        }
      }
    ])
  );
}

function ManagerRosterModal({ rosterState, onClose }) {
  if (!rosterState) {
    return null;
  }

  const students =
    rosterState.type === "participants" ? rosterState.data.participants : rosterState.data.volunteers;
  const title = rosterState.type === "participants" ? "Participants" : "Volunteers";

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div className="modal-card manager-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="manager-modal__header">
          <div>
            <p className="eyebrow">{title}</p>
            <h2>{rosterState.data.event.title}</h2>
          </div>
          <button type="button" className="ghost-button" onClick={onClose}>
            Close
          </button>
        </div>

        {students.length > 0 ? (
          <div className="manager-student-list">
            {students.map((student) => (
              <article key={`${rosterState.type}-${student.id}`} className="manager-student-card">
                <strong>{student.name}</strong>
                <span>{student.enrollment}</span>
                <span>{student.email}</span>
              </article>
            ))}
          </div>
        ) : (
          <p className="certificate-empty">No students found in this list yet.</p>
        )}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const { sectionId = "all" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const myClubs = user?.clubs || [];
  const myClubSlugs = myClubs.map((club) => club.slug);
  const managerMode = user?.role === "manager";
  const [events, setEvents] = useState([]);
  const [clubDetails, setClubDetails] = useState(null);
  const [registrations, setRegistrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rosterState, setRosterState] = useState(null);
  const activeStatus = searchParams.get("status") || "all";
  const managerClub = myClubs[0] || null;

  useEffect(() => {
    let isMounted = true;

    async function loadFeed() {
      try {
        setLoading(true);
        const [eventsResponse, registrationsResponse] = await Promise.all([
          api.getEvents(),
          api.getMyRegistrations()
        ]);

        if (!isMounted) {
          return;
        }

        setEvents(eventsResponse.events.map(normalizeEvent));
        setRegistrations(toRegistrationStateMap(registrationsResponse.registrations));
        setError("");
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Failed to load feed.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadFeed();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (managerMode || sectionId === "all" || sectionId === "my-clubs") {
      setClubDetails(null);
      return;
    }

    let isMounted = true;

    api
      .getClub(sectionId)
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setClubDetails(response.club);
      })
      .catch(() => {
        if (isMounted) {
          setClubDetails(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [managerMode, sectionId]);

  const accessibleEvents = useMemo(() => {
    if (!managerMode) {
      return events;
    }

    return events.filter((event) => myClubSlugs.includes(event.clubId));
  }, [events, managerMode, myClubSlugs]);

  const sectionEvents = useMemo(() => {
    if (managerMode) {
      return accessibleEvents;
    }

    if (sectionId === "all") {
      return accessibleEvents;
    }

    if (sectionId === "my-clubs") {
      return accessibleEvents.filter((event) => myClubSlugs.includes(event.clubId));
    }

    return accessibleEvents.filter((event) => event.clubId === sectionId);
  }, [accessibleEvents, managerMode, myClubSlugs, sectionId]);

  const statusCounts = useMemo(
    () =>
      sectionEvents.reduce(
        (counts, event) => ({
          ...counts,
          all: counts.all + 1,
          [event.status]: counts[event.status] + 1
        }),
        { all: 0, finished: 0, "going-on": 0, upcoming: 0 }
      ),
    [sectionEvents]
  );

  const filteredEvents = useMemo(() => {
    if (activeStatus === "all") {
      return sectionEvents;
    }

    return sectionEvents.filter((event) => event.status === activeStatus);
  }, [activeStatus, sectionEvents]);

  function handleStatusChange(statusId) {
    const nextParams = new URLSearchParams(searchParams);
    if (statusId === "all") {
      nextParams.delete("status");
    } else {
      nextParams.set("status", statusId);
    }
    setSearchParams(nextParams);
  }

  async function handleRegister(eventId, registrationType) {
    const currentState = registrations[String(eventId)] || {
      participate: { active: false, registeredAt: null },
      volunteer: { active: false, registeredAt: null }
    };

    const nextState = {
      participate:
        registrationType === "participate" ? !currentState.participate.active : currentState.participate.active,
      volunteer:
        registrationType === "volunteer" ? !currentState.volunteer.active : currentState.volunteer.active
    };

    try {
      const response = await api.saveRegistration({
        eventId,
        participate: nextState.participate,
        volunteer: nextState.volunteer
      });

      setRegistrations((current) => {
        const nextRegistrations = { ...current };

        if (!response.registration) {
          delete nextRegistrations[String(eventId)];
          return nextRegistrations;
        }

        nextRegistrations[String(eventId)] = {
          participate: {
            active: Boolean(response.registration.participate),
            registeredAt: response.registration.updatedAt
          },
          volunteer: {
            active: Boolean(response.registration.volunteer),
            registeredAt: response.registration.updatedAt
          }
        };

        return nextRegistrations;
      });
    } catch (registrationError) {
      setError(registrationError.message || "Unable to update registration.");
    }
  }

  function handleGenerateCertificate(event) {
    const eventRegistration = registrations[String(event.id)] || {};
    const roleLabel =
      eventRegistration.participate?.active && eventRegistration.volunteer?.active
        ? "Participant and Volunteer"
        : eventRegistration.volunteer?.active
          ? "Volunteer"
          : "Participant";

    downloadCertificatePdf({
      studentName: user?.name || user?.enrollment || "Graphic Era Student",
      clubName: event.club?.name || "Graphic Era Club",
      eventTitle: event.title,
      roleLabel,
      venue: event.venue,
      dateLabel: event.date
    });
  }

  async function handleOpenRoster(event, type) {
    try {
      const response = await api.getEventRegistrations(event.id);
      setRosterState({
        type,
        data: response
      });
    } catch (rosterError) {
      setError(rosterError.message || "Unable to load student list.");
    }
  }

  return (
    <AppShell myClubCount={myClubs.length} hideHeaderNav={managerMode}>
      <section className="feed-main">
        {managerMode ? (
          <section className="manager-dashboard-head">
            <div>
              <p className="eyebrow">Manager Dashboard</p>
              <h1>{managerClub?.name || "Assigned Club"}</h1>
            </div>
          </section>
        ) : null}

        <EventStatusNav
          activeStatus={activeStatus}
          counts={statusCounts}
          onStatusChange={handleStatusChange}
        />

        {clubDetails ? (
          <section className="club-preview-card">
            <div className="club-preview-card__header">
              <div className="club-preview-card__badge" style={{ backgroundColor: clubDetails.color }}>
                {clubDetails.logoUrl ? (
                  <img src={clubDetails.logoUrl} alt={`${clubDetails.name} logo`} />
                ) : (
                  (clubDetails.shortName || clubDetails.name || "C")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join("")
                    .toUpperCase()
                )}
              </div>
              <div>
                <p className="eyebrow">Club Snapshot</p>
                <h2>{clubDetails.name}</h2>
              </div>
            </div>
            <p>{clubDetails.description}</p>
            <div className="club-preview-card__meta">
              {clubDetails.headName ? <span>Head: {clubDetails.headName}</span> : null}
              {clubDetails.contactNumber ? <span>Contact: {clubDetails.contactNumber}</span> : null}
            </div>
            <Link className="club-preview-card__link" to={`/clubs/${clubDetails.slug}`}>
              Open full club page
            </Link>
          </section>
        ) : null}

        {loading ? <p>Loading events...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="feed-posts">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                registrationState={registrations[String(event.id)] || {}}
                onRegister={handleRegister}
                onGenerateCertificate={handleGenerateCertificate}
                viewerRole={user?.role}
                onOpenRoster={handleOpenRoster}
              />
            ))
          ) : !loading ? (
            <div className="empty-feed">
              <h3>No events match this section yet.</h3>
              <p>Try switching the event status bar or creating a new event for this club.</p>
            </div>
          ) : null}
        </div>
      </section>

      <ManagerRosterModal rosterState={rosterState} onClose={() => setRosterState(null)} />
    </AppShell>
  );
}
