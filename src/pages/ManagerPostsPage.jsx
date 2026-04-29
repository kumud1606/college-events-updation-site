import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import EventCard from "../components/EventCard";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { normalizeEvent } from "../utils/normalizers";

function getDefaultDateTime(offsetHours = 0) {
  const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export default function ManagerPostsPage() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    caption: "",
    venue: "",
    place: "",
    startDate: getDefaultDateTime(),
    endDate: getDefaultDateTime(2),
    participantLimit: "",
    volunteerLimit: "",
    tags: "",
    additionalInfo: ""
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const assignedClub = user?.clubs?.[0] || null;

  useEffect(() => {
    let isMounted = true;

    api
      .getEvents()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setEvents(response.events.map(normalizeEvent));
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError.message || "Failed to load posts.");
        }
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

  const myPosts = useMemo(() => {
    const clubSlugs = new Set((user?.clubs || []).map((club) => club.slug));
    return events.filter((event) => clubSlugs.has(event.clubId));
  }, [events, user]);

  if (user?.role !== "manager" && user?.role !== "admin") {
    return <Navigate to="/feed/all" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!assignedClub?.id) {
      setError("No club is assigned to this manager.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const body = new FormData();
      body.append("clubId", assignedClub.id);
      body.append("title", form.title);
      body.append("caption", form.caption);
      body.append("venue", form.venue);
      body.append("place", form.place);
      body.append("startDate", new Date(form.startDate).toISOString());
      body.append("endDate", new Date(form.endDate).toISOString());
      body.append("participantLimit", form.participantLimit);
      body.append("volunteerLimit", form.volunteerLimit);
      body.append("tags", form.tags);
      body.append("additionalInfo", form.additionalInfo);

      if (mediaFile) {
        body.append("media", mediaFile);
      }

      const response = await api.createEvent(body);
      setEvents((current) => [normalizeEvent(response.event), ...current]);
      setForm({
        title: "",
        caption: "",
        venue: "",
        place: "",
        startDate: getDefaultDateTime(),
        endDate: getDefaultDateTime(2),
        participantLimit: "",
        volunteerLimit: "",
        tags: "",
        additionalInfo: ""
      });
      setMediaFile(null);
    } catch (submitError) {
      setError(submitError.message || "Unable to create post.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(eventItem) {
    const confirmed = window.confirm(`Delete "${eventItem.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteEvent(eventItem.id);
      setEvents((current) => current.filter((item) => item.id !== eventItem.id));
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete post.");
    }
  }

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="profile-page manager-posts-page">
        <div className="profile-card">
          <p className="eyebrow">Create Post</p>
          <h1>{assignedClub?.name || "Club Posting"}</h1>
          <p>Upload an image or video, add event details, and publish it to the student feed.</p>

          <form className="manager-post-form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input name="title" value={form.title} onChange={handleChange} required />
            </label>

            <label>
              <span>Caption</span>
              <textarea name="caption" value={form.caption} onChange={handleChange} rows="5" required />
            </label>

            <div className="manager-post-form__grid">
              <label>
                <span>Venue</span>
                <input name="venue" value={form.venue} onChange={handleChange} required />
              </label>
              <label>
                <span>Place</span>
                <input name="place" value={form.place} onChange={handleChange} />
              </label>
            </div>

            <div className="manager-post-form__grid">
              <label>
                <span>Start Time</span>
                <input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required />
              </label>
              <label>
                <span>End Time</span>
                <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required />
              </label>
            </div>

            <div className="manager-post-form__grid">
              <label>
                <span>Participant Limit</span>
                <input type="number" min="0" name="participantLimit" value={form.participantLimit} onChange={handleChange} />
              </label>
              <label>
                <span>Volunteer Limit</span>
                <input type="number" min="0" name="volunteerLimit" value={form.volunteerLimit} onChange={handleChange} />
              </label>
            </div>

            <label>
              <span>Additional Information</span>
              <textarea
                name="additionalInfo"
                value={form.additionalInfo}
                onChange={handleChange}
                rows="3"
                placeholder="Rules, contacts, notes, links, or anything else students should know."
              />
            </label>

            <label>
              <span>Tags</span>
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="Hackathon, Auditions, Workshop"
              />
            </label>

            <label>
              <span>Image or Video</span>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(event) => setMediaFile(event.target.files?.[0] || null)}
              />
            </label>

            {error ? <p className="form-error">{error}</p> : null}

            <button type="submit" className="primary-button" disabled={submitting}>
              {submitting ? "Posting..." : "Publish Post"}
            </button>
          </form>
        </div>

        <div className="profile-card">
          <h2>Your Posts</h2>
          {loading ? <p>Loading posts...</p> : null}
          <div className="feed-posts">
            {myPosts.map((eventItem) => (
              <EventCard
                key={eventItem.id}
                event={eventItem}
                registrationState={{}}
                viewerRole={user?.role}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
