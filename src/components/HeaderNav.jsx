import { useRef } from "react";
import { NavLink } from "react-router-dom";

export default function HeaderNav({ clubs = [], myClubCount = 0, theme = "light", onToggleTheme }) {
  const navRef = useRef(null);
  const managerMode = myClubCount > 0 && clubs.length === myClubCount;
  const items = managerMode
    ? clubs.map((club) => ({
        id: club.slug,
        label: club.short || club.shortName || club.name
      }))
    : [
        { id: "all", label: "All" },
        { id: "my-clubs", label: "My Preferences", count: myClubCount },
        ...clubs.map((club) => ({
          id: club.slug,
          label: club.short || club.shortName || club.name
        }))
      ];

  function scrollNav(direction) {
    if (!navRef.current) {
      return;
    }

    navRef.current.scrollBy({
      left: direction * 240,
      behavior: "smooth"
    });
  }

  return (
    <div className="top-strip">
      <div className="top-strip__row">
        <div className="top-strip__scroller">
          <button
            type="button"
            className="top-strip__arrow"
            aria-label="Scroll club tabs left"
            onClick={() => scrollNav(-1)}
          >
            {"<"}
          </button>
          <nav ref={navRef} className="top-strip__nav" aria-label="Club filters">
            {items.map((item) => (
              <NavLink
                key={item.id}
                to={`/feed/${item.id}`}
                className={({ isActive }) => `top-strip__link ${isActive ? "active" : ""}`}
              >
                {item.label}
                {item.count !== undefined ? <span>{item.count}</span> : null}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            className="top-strip__arrow"
            aria-label="Scroll club tabs right"
            onClick={() => scrollNav(1)}
          >
            {">"}
          </button>
        </div>

        <button type="button" className="theme-toggle" onClick={onToggleTheme}>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
      </div>
    </div>
  );
}
