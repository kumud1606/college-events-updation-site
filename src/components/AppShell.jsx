import { useEffect, useState } from "react";
import { useAppData } from "../context/AppDataContext";
import { useAuth } from "../context/AuthContext";
import { getSavedTheme, saveTheme } from "../utils/storage";
import HeaderNav from "./HeaderNav";
import SidebarNav from "./SidebarNav";

export default function AppShell({ myClubCount, children, hideHeaderNav = false }) {
  const [theme, setTheme] = useState(() => getSavedTheme());
  const { clubs } = useAppData();
  const { user } = useAuth();
  const shouldHideHeaderNav = hideHeaderNav || user?.role === "manager";

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    saveTheme(theme);
  }, [theme]);

  return (
    <main className="app-shell">
      <SidebarNav />
      <div className="app-shell__content">
        {!shouldHideHeaderNav ? (
          <HeaderNav
            clubs={clubs}
            myClubCount={myClubCount}
            theme={theme}
            onToggleTheme={() => setTheme((current) => (current === "dark" ? "light" : "dark"))}
          />
        ) : null}
        {children}
      </div>
    </main>
  );
}
