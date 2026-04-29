import { clearAuthSession, getAuthToken } from "./storage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    throw new Error(payload?.message || "Request failed.");
  }

  return payload;
}

export const api = {
  login(credentials) {
    return request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  },

  register(payload) {
    return request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getCurrentUser() {
    return request("/auth/me");
  },

  updateMyClubs(clubIds) {
    return request("/auth/me/clubs", {
      method: "PATCH",
      body: JSON.stringify({ clubIds })
    });
  },

  getClubs() {
    return request("/clubs");
  },

  getClub(slug) {
    return request(`/clubs/${slug}`);
  },

  updateClub(clubId, payload) {
    return request(`/clubs/${clubId}`, {
      method: "PATCH",
      body: JSON.stringify(payload)
    });
  },

  getNotices() {
    return request("/notices");
  },

  createNotice(payload) {
    return request("/notices", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  deleteNotice(noticeId) {
    return request(`/notices/${noticeId}`, {
      method: "DELETE"
    });
  },

  getEvents(query = "") {
    return request(`/events${query}`);
  },

  createEvent(formData) {
    return request("/events", {
      method: "POST",
      body: formData
    });
  },

  deleteEvent(eventId) {
    return request(`/events/${eventId}`, {
      method: "DELETE"
    });
  },

  getMyRegistrations() {
    return request("/registrations/mine");
  },

  getEventRegistrations(eventId) {
    return request(`/registrations/event/${eventId}`);
  },

  saveRegistration(payload) {
    return request("/registrations", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  getCertificates() {
    return request("/certificates");
  },

  markCertificateDownloaded(certificateId) {
    return request(`/certificates/${certificateId}/download`, {
      method: "PATCH"
    });
  }
};
