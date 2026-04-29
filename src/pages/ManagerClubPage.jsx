import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { normalizeClub } from "../utils/normalizers";

export default function ManagerClubPage() {
  const { user } = useAuth();
  const [club, setClub] = useState(null);
  const [form, setForm] = useState({
    description: "",
    contactNumber: "",
    headName: "",
    enquiryInfo: "",
    teachers: ""
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const assignedClub = user?.clubs?.[0];

    if (!assignedClub?.slug) {
      return;
    }

    api
      .getClub(assignedClub.slug)
      .then((response) => {
        const normalizedClub = normalizeClub(response.club);
        setClub(normalizedClub);
        setForm({
          description: normalizedClub.description || "",
          contactNumber: normalizedClub.contactNumber || "",
          headName: normalizedClub.headName || "",
          enquiryInfo: normalizedClub.enquiryInfo || "",
          teachers: (normalizedClub.teachers || []).join(", ")
        });
      })
      .catch((loadError) => {
        setError(loadError.message || "Failed to load club settings.");
      });
  }, [user]);

  if (user?.role !== "manager") {
    return <Navigate to="/feed/all" replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setSaved(false);
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!club?.id) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await api.updateClub(club.id, form);
      const updatedClub = normalizeClub(response.club);
      setClub(updatedClub);
      setSaved(true);
    } catch (submitError) {
      setError(submitError.message || "Unable to save club details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="profile-page">
        <div className="profile-card">
          <p className="eyebrow">Manager Club Page</p>
          <h1>{club?.name || "Club Information"}</h1>
          <p>Fill in the details that students will see when they open the club page.</p>
        </div>

        <div className="profile-card">
          <form className="manager-post-form" onSubmit={handleSubmit}>
            <label>
              <span>Description</span>
              <textarea name="description" value={form.description} onChange={handleChange} rows="4" required />
            </label>
            <label>
              <span>Contact Number</span>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange} required />
            </label>
            <label>
              <span>Club Head Name</span>
              <input name="headName" value={form.headName} onChange={handleChange} required />
            </label>
            <label>
              <span>Teachers</span>
              <textarea
                name="teachers"
                value={form.teachers}
                onChange={handleChange}
                rows="3"
                placeholder="Separate teacher names with commas"
                required
              />
            </label>
            <label>
              <span>Enquiry Information</span>
              <textarea name="enquiryInfo" value={form.enquiryInfo} onChange={handleChange} rows="3" required />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            {saved ? <p className="profile-success">Club details updated successfully.</p> : null}
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save Club Details"}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
