import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import ClubChip from "../components/ClubChip";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

export default function ProfilePage() {
  const { user, updateMyClubs } = useAuth();
  const { clubs } = useAppData();
  const managerMode = user?.role === "manager";
  const visibleClubs =
    managerMode
      ? clubs.filter((club) => user?.clubs?.some((selectedClub) => selectedClub.id === club.id))
      : clubs;
  const [selectedClubs, setSelectedClubs] = useState([]);
  const [saved, setSaved] = useState(false);
  const [registrationsCount, setRegistrationsCount] = useState(0);

  useEffect(() => {
    setSelectedClubs((user?.clubs || []).map((club) => club.id));
  }, [user]);

  useEffect(() => {
    api.getMyRegistrations().then((response) => {
      setRegistrationsCount(response.registrations.length);
    });
  }, []);

  const selectedCount = useMemo(() => selectedClubs.length, [selectedClubs]);

  function toggleClub(clubId) {
    setSaved(false);
    setSelectedClubs((current) =>
      current.includes(clubId) ? current.filter((item) => item !== clubId) : [...current, clubId]
    );
  }

  async function handleSave() {
    await updateMyClubs(selectedClubs);
    setSaved(true);
  }

  return (
    <AppShell myClubCount={selectedCount}>
      <section className="profile-page">
        <div className="profile-card">
          <p className="eyebrow">Student Profile</p>
          <h1>{user?.name || user?.enrollment || "Student Profile"}</h1>
          <p>
            {managerMode
              ? "Your club assignment is controlled by the admin account."
              : "You can update your preferences here whenever needed."}
          </p>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{selectedCount}</strong>
              <span>Selected Clubs</span>
            </div>
            <div className="profile-stat">
              <strong>{clubs.length}</strong>
              <span>Total Clubs</span>
            </div>
            <div className="profile-stat">
              <strong>{registrationsCount}</strong>
              <span>Registrations</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2>{managerMode ? "Assigned club" : "Choose or update your preferences"}</h2>
          <div className="club-grid">
            {visibleClubs.map((club) => (
              <ClubChip
                key={club.id}
                club={club}
                selected={selectedClubs.includes(club.id)}
                onClick={managerMode ? undefined : () => toggleClub(club.id)}
              />
            ))}
          </div>

          {managerMode ? (
            <p className="profile-success">Managers are restricted to their assigned club view.</p>
          ) : (
            <div className="profile-actions">
              <button type="button" className="primary-button" onClick={handleSave}>
                Save Preferences
              </button>
              {saved ? <p className="profile-success">Your clubs were updated successfully.</p> : null}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
