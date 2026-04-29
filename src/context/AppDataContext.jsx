import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { api } from "../utils/api";
import { normalizeClub } from "../utils/normalizers";

const AppDataContext = createContext(null);

export function AppDataProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  async function refreshClubs() {
    if (!isAuthenticated) {
      setClubs([]);
      return [];
    }

    setLoadingClubs(true);

    try {
      const response = await api.getClubs();
      const normalizedClubs = response.clubs.map(normalizeClub);
      setClubs(normalizedClubs);
      return normalizedClubs;
    } finally {
      setLoadingClubs(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      setClubs([]);
      return;
    }

    refreshClubs().catch(() => {
      setClubs([]);
    });
  }, [isAuthenticated]);

  return (
    <AppDataContext.Provider
      value={{
        clubs,
        loadingClubs,
        refreshClubs
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error("useAppData must be used inside AppDataProvider.");
  }

  return context;
}
