import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { downloadCertificatePdf } from "../utils/certificate";
import { normalizeEvent } from "../utils/normalizers";

function formatRoleLabel(registration) {
  if (registration.participate && registration.volunteer) {
    return "Participant and Volunteer";
  }

  if (registration.volunteer) {
    return "Volunteer";
  }

  return "Participant";
}

export default function RegistrationsPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .getMyRegistrations()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setRegistrations(
          response.registrations.map((registration) => ({
            ...registration,
            event: normalizeEvent(registration.event)
          }))
        );
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () => ({
      total: registrations.length,
      active: registrations.filter((item) => item.event.status !== "finished").length,
      certificates: registrations.filter((item) => item.event.status === "finished").length
    }),
    [registrations]
  );

  function handleCertificateDownload(registration) {
    downloadCertificatePdf({
      studentName: user?.name || user?.enrollment || "Graphic Era Student",
      clubName: registration.event.club?.name || "Graphic Era Club",
      eventTitle: registration.event.title,
      roleLabel: formatRoleLabel(registration),
      venue: registration.event.venue,
      dateLabel: registration.event.date
    });
  }

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="registrations-page">
        <div className="profile-card registrations-hero">
          <p className="eyebrow">Registrations</p>
          <h1>Your event commitments</h1>
          <p>Track every event where you signed up, see the current status, and download certificates after completion.</p>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{stats.total}</strong>
              <span>Total Registrations</span>
            </div>
            <div className="profile-stat">
              <strong>{stats.active}</strong>
              <span>Active Events</span>
            </div>
            <div className="profile-stat">
              <strong>{stats.certificates}</strong>
              <span>Certificates Ready</span>
            </div>
          </div>
        </div>

        {loading ? <p>Loading registrations...</p> : null}

        {registrations.length > 0 ? (
          <div className="registration-grid">
            {registrations.map((registration, index) => (
              <article
                key={registration.id}
                className="registration-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="registration-card__header">
                  <div>
                    <p className="eyebrow">Registered Event</p>
                    <h2>{registration.event.title}</h2>
                    <p>{registration.event.club?.name}</p>
                  </div>
                  <span className={`event-status event-status--${registration.event.status}`}>
                    {registration.event.statusLabel}
                  </span>
                </div>

                <div className="registration-card__meta">
                  <span>{registration.event.date}</span>
                  <span>{registration.event.venue}</span>
                  <span>{formatRoleLabel(registration)}</span>
                </div>

                <p className="registration-card__caption">{registration.event.caption.split("\n")[0]}</p>

                {registration.event.status === "finished" ? (
                  <button
                    type="button"
                    className="primary-button registration-card__button"
                    onClick={() => handleCertificateDownload(registration)}
                  >
                    Generate Certificate PDF
                  </button>
                ) : (
                  <div className="registration-card__pending">
                    Certificate will unlock automatically after the event is finished.
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : !loading ? (
          <div className="placeholder-card">
            <p className="eyebrow">Nothing Registered</p>
            <h2>Your participation list is empty</h2>
            <p>Use the event feed to join or volunteer for events. They will then appear here automatically.</p>
          </div>
        ) : null}
      </section>
    </AppShell>
  );
}
