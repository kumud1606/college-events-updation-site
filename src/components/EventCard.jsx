import { Link } from "react-router-dom";
import { getClubBadge } from "../utils/normalizers";

export default function EventCard({
  event,
  registrationState,
  onRegister,
  onGenerateCertificate,
  viewerRole = "student",
  onOpenRoster,
  onDelete
}) {
  const club = event.club;
  const participateActive = Boolean(registrationState.participate?.active);
  const volunteerActive = Boolean(registrationState.volunteer?.active);
  const captionParagraphs = event.caption.split("\n\n").filter(Boolean);
  const canGenerateCertificate = event.status === "finished" && (participateActive || volunteerActive);
  const registrationClosed = event.status === "finished" || !event.registrationOpen;
  const closedMessage =
    event.status === "finished" ? "This event is no longer ongoing." : "Registrations are closed.";
  const managerMode = viewerRole === "manager" || viewerRole === "admin";
  const participateFull =
    typeof event.participantLimit === "number" &&
    !participateActive &&
    event.registrations.participate >= event.participantLimit;
  const volunteerFull =
    typeof event.volunteerLimit === "number" &&
    !volunteerActive &&
    event.registrations.volunteer >= event.volunteerLimit;

  return (
    <article className="event-card">
      <div className="event-card__header">
        {club?.slug ? (
          <Link className="event-card__club-link" to={`/clubs/${club.slug}`}>
            <div className="event-card__club-mark" style={{ backgroundColor: club?.color }}>
              {club?.logo ? (
                <img className="event-card__club-logo" src={club.logo} alt={`${club.name} logo`} />
              ) : (
                getClubBadge(club || {})
              )}
            </div>
          </Link>
        ) : (
          <div className="event-card__club-mark" style={{ backgroundColor: club?.color }}>
            {club?.logo ? (
              <img className="event-card__club-logo" src={club.logo} alt={`${club.name} logo`} />
            ) : (
              getClubBadge(club || {})
            )}
          </div>
        )}
        <div>
          <h3>{event.title}</h3>
          <p>
            {club?.slug ? (
              <Link className="event-card__club-name-link" to={`/clubs/${club.slug}`}>
                {club?.name}
              </Link>
            ) : (
              club?.name
            )}
          </p>
        </div>
      </div>

      <div className={`event-card__post ${event.mediaType === "video" ? "event-card__post--video" : ""}`}>
        {event.mediaType === "video" ? (
          <video
            className="event-card__image event-card__video"
            controls
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={event.poster}
          >
            <source src={event.video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img className="event-card__image" src={event.image} alt={event.title} />
        )}

        <div className="event-card__body">
          <div className="event-card__meta">
            <span>{event.date}</span>
            <span>{event.venue}</span>
            {event.place ? <span>{event.place}</span> : null}
            <span className={`event-status event-status--${event.status}`}>{event.statusLabel}</span>
            {typeof event.participantLimit === "number" ? (
              <span>Participants {event.registrations.participate}/{event.participantLimit}</span>
            ) : null}
            {typeof event.volunteerLimit === "number" ? (
              <span>Volunteers {event.registrations.volunteer}/{event.volunteerLimit}</span>
            ) : null}
          </div>
          <div className="event-card__caption">
            <div className="event-card__caption-copy">
              {captionParagraphs.map((paragraph) => (
                <p key={paragraph}>
                  {paragraph.startsWith("Register now:") ? (
                    <>
                      Register now:{" "}
                      <a href={paragraph.replace("Register now:", "").trim()} target="_blank" rel="noreferrer">
                        {paragraph.replace("Register now:", "").trim()}
                      </a>
                    </>
                  ) : (
                    paragraph
                  )}
                </p>
              ))}
              {event.additionalInfo ? <p>{event.additionalInfo}</p> : null}
            </div>
          </div>
          <div className="event-card__actions">
            {managerMode ? (
              <>
                {onOpenRoster ? (
                  <>
                    <button
                      type="button"
                      className="event-action-button"
                      onClick={() => onOpenRoster(event, "participants")}
                    >
                      Participants ({event.registrations.participate || 0})
                    </button>
                    <button
                      type="button"
                      className="event-action-button event-action-button--volunteer"
                      onClick={() => onOpenRoster(event, "volunteers")}
                    >
                      Volunteers ({event.registrations.volunteer || 0})
                    </button>
                  </>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    className="event-action-button event-action-button--delete"
                    onClick={() => onDelete(event)}
                  >
                    Delete Post
                  </button>
                ) : null}
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`event-action-button ${participateActive ? "active" : ""}`}
                  onClick={() => onRegister(event.id, "participate")}
                  disabled={registrationClosed || participateFull}
                  title={registrationClosed ? closedMessage : participateFull ? "Participant limit reached." : ""}
                >
                  {participateActive ? "Participating" : participateFull ? "Participant Full" : "Participate"}
                </button>
                <button
                  type="button"
                  className={`event-action-button event-action-button--volunteer ${volunteerActive ? "active" : ""}`}
                  onClick={() => onRegister(event.id, "volunteer")}
                  disabled={registrationClosed || volunteerFull}
                  title={registrationClosed ? closedMessage : volunteerFull ? "Volunteer limit reached." : ""}
                >
                  {volunteerActive ? "Volunteering" : volunteerFull ? "Volunteer Full" : "Volunteer"}
                </button>
                {canGenerateCertificate ? (
                  <button
                    type="button"
                    className="event-action-button event-action-button--certificate"
                    onClick={() => onGenerateCertificate(event)}
                  >
                    Generate Certificate
                  </button>
                ) : null}
              </>
            )}
          </div>
          <div className="event-card__tags">
            {event.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
