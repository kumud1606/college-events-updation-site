import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { normalizeClub } from "../utils/normalizers";

export default function ClubDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    api
      .getClub(slug)
      .then((response) => {
        if (isMounted) {
          setClub(normalizeClub(response.club));
        }
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError.message || "Failed to load club details.");
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
  }, [slug]);

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="profile-page">
        {loading ? <p>Loading club details...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {club ? (
          <>
            <div className="profile-card club-detail-hero">
              <p className="eyebrow">Club Details</p>
              <div className="club-detail-hero__top">
                <div className="club-detail-hero__badge" style={{ backgroundColor: club.color }}>
                  {club.logo || club.logoUrl ? (
                    <img src={club.logo || club.logoUrl} alt={`${club.name} logo`} />
                  ) : (
                    club.icon
                  )}
                </div>
                <h1>{club.name}</h1>
              </div>
              <p>{club.description}</p>
            </div>

            <div className="profile-card">
              <h2>Contact and Leadership</h2>
              <div className="profile-stats">
                <div className="profile-stat">
                  <strong>{club.contactNumber || "Not added"}</strong>
                  <span>Contact Number</span>
                </div>
                <div className="profile-stat">
                  <strong>{club.headName || "Not added"}</strong>
                  <span>Head of Club</span>
                </div>
              </div>
              <p>{club.enquiryInfo || "Enquiry information will be added by the club manager."}</p>
            </div>

            <div className="profile-card">
              <h2>Teachers</h2>
              {club.teachers.length > 0 ? (
                <div className="teacher-list">
                  {club.teachers.map((teacher) => (
                    <span key={teacher} className="teacher-pill">
                      {teacher}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No teachers have been added yet.</p>
              )}
            </div>
          </>
        ) : null}
      </section>
    </AppShell>
  );
}
