import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClubChip from "../components/ClubChip";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { clubs, loadingClubs } = useAppData();
  const { user, updateMyClubs } = useAuth();
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelectedClubs((user?.clubs || []).map((club) => club.id));
  }, [user]);

  useEffect(() => {
    if (user?.role === "manager" || user?.role === "admin") {
      navigate("/feed/all", { replace: true });
    }
  }, [navigate, user]);

  const selectedCount = selectedClubs.length;

  function toggleClub(clubId) {
    setSelectedClubs((current) =>
      current.includes(clubId) ? current.filter((item) => item !== clubId) : [...current, clubId]
    );
  }

  async function handleContinue() {
    try {
      setSaving(true);
      await updateMyClubs(selectedClubs);
      navigate("/feed/all");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-panel">
        <div className="onboarding-panel__intro">
          <h1>Welcome</h1>
          <p>
            Are you already part of any club or student group? Pick all that apply. This is now
            saved to your real profile and you can change it later from Profile.
          </p>
        </div>

        {loadingClubs ? (
          <p>Loading clubs...</p>
        ) : (
          <div className="club-grid">
            {clubs.map((club) => (
              <ClubChip
                key={club.id}
                club={club}
                selected={selectedClubs.includes(club.id)}
                onClick={() => toggleClub(club.id)}
              />
            ))}
          </div>
        )}

        <div className="onboarding-panel__footer">
          <p>{selectedCount} club(s) selected</p>
          <div className="onboarding-panel__actions">
            <button type="button" className="ghost-button" onClick={() => navigate("/")}>
              Back
            </button>
            <button type="button" className="primary-button" onClick={handleContinue} disabled={saving}>
              {saving ? "Saving..." : "Continue to Clubs Feed"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
