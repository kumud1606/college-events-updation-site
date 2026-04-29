import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../utils/api";
import { clearAuthSession, getAuthToken, getStoredUser, saveAuthSession } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    api
      .getCurrentUser()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setUser(response.user);
        saveAuthSession({ token, user: response.user });
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        clearAuthSession();
        setUser(null);
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

  async function login(credentials) {
    const response = await api.login(credentials);
    saveAuthSession(response);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    clearAuthSession();
    setUser(null);
  }

  async function refreshUser() {
    const response = await api.getCurrentUser();
    saveAuthSession({ token: getAuthToken(), user: response.user });
    setUser(response.user);
    return response.user;
  }

  async function updateMyClubs(clubIds) {
    const response = await api.updateMyClubs(clubIds);
    saveAuthSession({ token: getAuthToken(), user: response.user });
    setUser(response.user);
    return response.user;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loading,
        login,
        logout,
        refreshUser,
        updateMyClubs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
