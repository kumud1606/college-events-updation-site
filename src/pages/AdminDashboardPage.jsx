import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import EventCard from "../components/EventCard";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { normalizeEvent } from "../utils/normalizers";

function getDefaultDateTime(offsetHours = 0) {
  const date = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { clubs } = useAppData();
  const [postForm, setPostForm] = useState({
    clubId: "",
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
  const [noticeForm, setNoticeForm] = useState({
    title: "",
    message: "",
    priority: "important",
    audience: "all"
  });
  const [mediaFile, setMediaFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submittingPost, setSubmittingPost] = useState(false);
  const [submittingNotice, setSubmittingNotice] = useState(false);

  useEffect(() => {
    if (!postForm.clubId && clubs.length > 0) {
      setPostForm((current) => ({ ...current, clubId: clubs[0].id }));
    }
  }, [clubs, postForm.clubId]);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      const [eventsResponse, noticesResponse] = await Promise.all([api.getEvents(), api.getNotices()]);

      if (!isMounted) {
        return;
      }

      setEvents(eventsResponse.events.map(normalizeEvent));
      setNotices(noticesResponse.notices);
    }

    loadAdminData()
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError.message || "Failed to load admin data.");
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

  const stats = useMemo(
    () => ({
      clubs: clubs.length,
      posts: events.length,
      notices: notices.length
    }),
    [clubs.length, events.length, notices.length]
  );

  if (user?.role !== "admin") {
    return <Navigate to="/feed/all" replace />;
  }

  function handlePostChange(event) {
    const { name, value } = event.target;
    setPostForm((current) => ({ ...current, [name]: value }));
  }

  function handleNoticeChange(event) {
    const { name, value } = event.target;
    setNoticeForm((current) => ({ ...current, [name]: value }));
  }

  async function handlePostSubmit(event) {
    event.preventDefault();

    try {
      setSubmittingPost(true);
      setError("");

      const body = new FormData();
      body.append("clubId", postForm.clubId);
      body.append("title", postForm.title);
      body.append("caption", postForm.caption);
      body.append("venue", postForm.venue);
      body.append("place", postForm.place);
      body.append("startDate", new Date(postForm.startDate).toISOString());
      body.append("endDate", new Date(postForm.endDate).toISOString());
      body.append("participantLimit", postForm.participantLimit);
      body.append("volunteerLimit", postForm.volunteerLimit);
      body.append("tags", postForm.tags);
      body.append("additionalInfo", postForm.additionalInfo);

      if (mediaFile) {
        body.append("media", mediaFile);
      }

      const response = await api.createEvent(body);
      setEvents((current) => [normalizeEvent(response.event), ...current]);
      setPostForm({
        clubId: clubs[0]?.id || "",
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
      setSubmittingPost(false);
    }
  }

  async function handleNoticeSubmit(event) {
    event.preventDefault();

    try {
      setSubmittingNotice(true);
      setError("");
      const response = await api.createNotice(noticeForm);
      setNotices((current) => [response.notice, ...current]);
      setNoticeForm({
        title: "",
        message: "",
        priority: "important",
        audience: "all"
      });
    } catch (submitError) {
      setError(submitError.message || "Unable to create notice.");
    } finally {
      setSubmittingNotice(false);
    }
  }

  async function handleDeleteEvent(eventItem) {
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

  async function handleDeleteNotice(notice) {
    const confirmed = window.confirm(`Delete notice "${notice.title}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.deleteNotice(notice.id);
      setNotices((current) => current.filter((item) => item.id !== notice.id));
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete notice.");
    }
  }

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="profile-page">
        <div className="profile-card">
          <p className="eyebrow">Admin Dashboard</p>
          <h1>{user?.name || "Admin"}</h1>
          <p>Control all clubs, all posts, and the Notice Board from one place.</p>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{stats.clubs}</strong>
              <span>Clubs</span>
            </div>
            <div className="profile-stat">
              <strong>{stats.posts}</strong>
              <span>Posts</span>
            </div>
            <div className="profile-stat">
              <strong>{stats.notices}</strong>
              <span>Notices</span>
            </div>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}
        {loading ? <p>Loading admin data...</p> : null}

        <div className="admin-grid">
          <div className="profile-card">
            <h2>Create Post For Any Club</h2>
            <form className="manager-post-form" onSubmit={handlePostSubmit}>
              <label>
                <span>Club</span>
                <select name="clubId" value={postForm.clubId} onChange={handlePostChange} required>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Title</span>
                <input name="title" value={postForm.title} onChange={handlePostChange} required />
              </label>

              <label>
                <span>Caption</span>
                <textarea name="caption" value={postForm.caption} onChange={handlePostChange} rows="5" required />
              </label>

              <div className="manager-post-form__grid">
                <label>
                  <span>Venue</span>
                  <input name="venue" value={postForm.venue} onChange={handlePostChange} required />
                </label>
                <label>
                  <span>Place</span>
                  <input name="place" value={postForm.place} onChange={handlePostChange} />
                </label>
              </div>

              <div className="manager-post-form__grid">
                <label>
                  <span>Start Time</span>
                  <input type="datetime-local" name="startDate" value={postForm.startDate} onChange={handlePostChange} required />
                </label>
                <label>
                  <span>End Time</span>
                  <input type="datetime-local" name="endDate" value={postForm.endDate} onChange={handlePostChange} required />
                </label>
              </div>

              <div className="manager-post-form__grid">
                <label>
                  <span>Participant Limit</span>
                  <input type="number" min="0" name="participantLimit" value={postForm.participantLimit} onChange={handlePostChange} />
                </label>
                <label>
                  <span>Volunteer Limit</span>
                  <input type="number" min="0" name="volunteerLimit" value={postForm.volunteerLimit} onChange={handlePostChange} />
                </label>
              </div>

              <label>
                <span>Additional Information</span>
                <textarea name="additionalInfo" value={postForm.additionalInfo} onChange={handlePostChange} rows="3" />
              </label>

              <label>
                <span>Tags</span>
                <input name="tags" value={postForm.tags} onChange={handlePostChange} />
              </label>

              <label>
                <span>Image or Video</span>
                <input type="file" accept="image/*,video/*" onChange={(event) => setMediaFile(event.target.files?.[0] || null)} />
              </label>

              <button type="submit" className="primary-button" disabled={submittingPost}>
                {submittingPost ? "Posting..." : "Publish Post"}
              </button>
            </form>
          </div>

          <div className="profile-card">
            <h2>Add Notice</h2>
            <form className="manager-post-form" onSubmit={handleNoticeSubmit}>
              <label>
                <span>Title</span>
                <input name="title" value={noticeForm.title} onChange={handleNoticeChange} required />
              </label>

              <label>
                <span>Message</span>
                <textarea name="message" value={noticeForm.message} onChange={handleNoticeChange} rows="5" required />
              </label>

              <div className="manager-post-form__grid">
                <label>
                  <span>Priority</span>
                  <select name="priority" value={noticeForm.priority} onChange={handleNoticeChange}>
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </label>
                <label>
                  <span>Audience</span>
                  <select name="audience" value={noticeForm.audience} onChange={handleNoticeChange}>
                    <option value="all">Everyone</option>
                    <option value="students">Students</option>
                    <option value="managers">Managers</option>
                  </select>
                </label>
              </div>

              <button type="submit" className="primary-button" disabled={submittingNotice}>
                {submittingNotice ? "Adding..." : "Publish Notice"}
              </button>
            </form>
          </div>
        </div>

        <div className="profile-card">
          <h2>All Club Posts</h2>
          <div className="feed-posts">
            {events.map((eventItem) => (
              <EventCard
                key={eventItem.id}
                event={eventItem}
                registrationState={{}}
                viewerRole={user?.role}
                onDelete={handleDeleteEvent}
              />
            ))}
          </div>
        </div>

        <div className="profile-card">
          <h2>Notice Board Control</h2>
          <div className="notice-board-list">
            {notices.map((notice) => (
              <article key={notice.id} className={`notice-card notice-card--${notice.priority}`}>
                <div className="notice-card__top">
                  <div>
                    <p className="eyebrow">Notice</p>
                    <h2>{notice.title}</h2>
                  </div>
                  <button type="button" className="event-action-button event-action-button--delete" onClick={() => handleDeleteNotice(notice)}>
                    Delete Notice
                  </button>
                </div>
                <p>{notice.message}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
