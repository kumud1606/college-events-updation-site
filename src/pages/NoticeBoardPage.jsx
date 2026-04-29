import { useEffect, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

function formatAudience(audience) {
  if (audience === "students") {
    return "Students";
  }

  if (audience === "managers") {
    return "Managers";
  }

  return "Everyone";
}

export default function NoticeBoardPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .getNotices()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setNotices(response.notices);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError.message || "Failed to load notices.");
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

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="notice-board-page">
        <div className="notice-board-hero">
          <p className="eyebrow">Notice Board</p>
          <h1>Official Announcements</h1>
          <p>This section is visible to students and managers. Posting will be enabled later from the admin dashboard.</p>
        </div>

        {loading ? <p>Loading notices...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="notice-board-list">
          {notices.map((notice) => (
            <article key={notice.id} className={`notice-card notice-card--${notice.priority}`}>
              <div className="notice-card__top">
                <div>
                  <p className="eyebrow">Notice</p>
                  <h2>{notice.title}</h2>
                </div>
                <span className="notice-card__audience">{formatAudience(notice.audience)}</span>
              </div>
              <p>{notice.message}</p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
