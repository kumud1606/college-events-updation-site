import AppShell from "../components/AppShell";
import ClubChip from "../components/ClubChip";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";

export default function ClubsPage() {
  const { clubs, loadingClubs } = useAppData();
  const { user } = useAuth();
  const visibleClubs =
    user?.role === "manager"
      ? clubs.filter((club) => user?.clubs?.some((selectedClub) => selectedClub.id === club.id))
      : clubs;

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="profile-page">
        <div className="profile-card">
          <p className="eyebrow">Club Directory</p>
          <h1>{user?.role === "manager" ? "Your club workspace" : "Explore student communities"}</h1>
          <p>
            {user?.role === "manager"
              ? "Managers only see the club they are assigned to."
              : "Every club shown here is now coming from the backend and can be managed centrally."}
          </p>

          <div className="profile-stats">
            <div className="profile-stat">
              <strong>{visibleClubs.length}</strong>
              <span>{user?.role === "manager" ? "Assigned Clubs" : "Total Clubs"}</span>
            </div>
            <div className="profile-stat">
              <strong>{user?.clubs?.length || 0}</strong>
              <span>Your Preferences</span>
            </div>
          </div>
        </div>

        <div className="profile-card">
          <h2>Available clubs</h2>
          {loadingClubs ? (
            <p>Loading clubs...</p>
          ) : (
            <div className="club-grid">
              {visibleClubs.map((club) => (
                <ClubChip
                  key={club.id}
                  club={club}
                  selected={user?.clubs?.some((selectedClub) => selectedClub.id === club.id)}
                  compact={false}
                  href={`/clubs/${club.slug}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}
