const AUTH_TOKEN_KEY = "geu-clubs-auth-token";
const AUTH_USER_KEY = "geu-clubs-auth-user";
const THEME_KEY = "geu-clubs-theme";

export function getAuthToken() {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function saveAuthSession({ token, user }) {
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }

  if (user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  }
}

export function getStoredUser() {
  const raw = window.localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
}

export function getSavedTheme() {
  return window.localStorage.getItem(THEME_KEY) || "light";
}

export function saveTheme(theme) {
  window.localStorage.setItem(THEME_KEY, theme);
}
