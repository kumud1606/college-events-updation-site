import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const calendarIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <g transform="translate(10 10)">
      <rect x="10" y="10" width="56" height="58" rx="4" fill="#f4f0f2" stroke="#0f0f12" stroke-width="2.5"/>
      <path d="M10 10h56v13H10z" fill="#dd2d2d" stroke="#0f0f12" stroke-width="2.5"/>
      <path d="M20 10v-4M39 10v-4M58 10v-4" fill="none" stroke="#0f0f12" stroke-width="4.5" stroke-linecap="round"/>
      <rect x="18" y="24" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="31" y="24" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="44" y="24" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <path d="M57 28l4 4 7-8" fill="none" stroke="#0f0f12" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="18" y="37" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="31" y="37" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="44" y="37" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="57" y="37" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="18" y="50" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="31" y="50" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <rect x="44" y="50" width="8" height="8" rx="1.5" fill="#0f0f12"/>
      <path d="M60 58h12L60 70z" fill="#f4f0f2" stroke="#0f0f12" stroke-width="2.5" stroke-linejoin="round"/>
    </g>
  </svg>
`)}`;

const registrationsIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#0e9b82"/>
    <g transform="translate(18 16)" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 8h28l9 9v40H10z"/>
      <path d="M38 8v9h9"/>
      <rect x="18" y="23" width="4" height="4" fill="#ffffff" stroke="#ffffff"/>
      <path d="M28 25h7"/>
      <path d="M18 37h4v4h-4z" fill="#ffffff" stroke="#ffffff"/>
      <path d="M28 39h12"/>
      <path d="M18 51h4v4h-4z" fill="#ffffff" stroke="#ffffff"/>
      <path d="M28 53h14"/>
      <path d="M39 35l22-23"/>
      <path d="M54 12l7 7"/>
      <path d="M37 37l-2 8 8-2"/>
    </g>
  </svg>
`)}`;

const clubsIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <g transform="translate(48 48)">
      <g transform="rotate(0)">
        <path d="M0-28c7 0 14 1 22 5-5 6-10 11-12 18-6-2-12-7-16-12 2-4 4-7 6-11z" fill="#1466bf"/>
        <circle cx="0" cy="-14" r="3.5" fill="#1466bf"/>
      </g>
      <g transform="rotate(60)">
        <path d="M0-28c7 0 14 1 22 5-5 6-10 11-12 18-6-2-12-7-16-12 2-4 4-7 6-11z" fill="#f79f1d"/>
        <circle cx="0" cy="-14" r="3.5" fill="#f79f1d"/>
      </g>
      <g transform="rotate(120)">
        <path d="M0-28c7 0 14 1 22 5-5 6-10 11-12 18-6-2-12-7-16-12 2-4 4-7 6-11z" fill="#e73632"/>
        <circle cx="0" cy="-14" r="3.5" fill="#e73632"/>
      </g>
      <g transform="rotate(180)">
        <path d="M0-28c7 0 14 1 22 5-5 6-10 11-12 18-6-2-12-7-16-12 2-4 4-7 6-11z" fill="#7a3fb1"/>
        <circle cx="0" cy="-14" r="3.5" fill="#7a3fb1"/>
      </g>
      <g transform="rotate(240)">
        <path d="M0-28c7 0 14 1 22 5-5 6-10 11-12 18-6-2-12-7-16-12 2-4 4-7 6-11z" fill="#f1ca1f"/>
        <circle cx="0" cy="-14" r="3.5" fill="#f1ca1f"/>
      </g>
      <g transform="rotate(300)">
        <path d="M0-28c7 0 14 1 22 5-5 6-10 11-12 18-6-2-12-7-16-12 2-4 4-7 6-11z" fill="#34b84c"/>
        <circle cx="0" cy="-14" r="3.5" fill="#34b84c"/>
      </g>
    </g>
  </svg>
`)}`;

const certificatesIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <g transform="translate(48 42)">
      <path d="M-16 12l-14 30 10-3 8 9 13-29z" fill="#d71920"/>
      <path d="M16 12l14 30-10-3-8 9-13-29z" fill="#d71920"/>
      <circle cx="0" cy="0" r="25" fill="#c71317"/>
      <circle cx="0" cy="0" r="20" fill="#f4d159" stroke="#b88913" stroke-width="2"/>
      <circle cx="0" cy="0" r="15" fill="#f8eb9c" opacity="0.9"/>
      <path d="M-23 -7l-5 7 5 7-8 2-1 9 8-1 4 7 7-4 7 4 4-7 8 1-1-9 8-2-5-7 5-7-8-2 1-9-8 1-4-7-7 4-7-4-4 7-8-1 1 9z" fill="none" stroke="#8f1015" stroke-width="1.5" opacity="0.5"/>
    </g>
  </svg>
`)}`;

const createPostIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <circle cx="48" cy="48" r="26" fill="#0d6f76"/>
    <path d="M48 34v28M34 48h28" stroke="#ffffff" stroke-width="6" stroke-linecap="round"/>
  </svg>
`)}`;

const clubInfoIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <circle cx="48" cy="48" r="26" fill="#1466bf"/>
    <path d="M48 32h.01M40 44h16M40 52h16M40 60h10" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
  </svg>
`)}`;

const noticeBoardIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <rect x="24" y="20" width="48" height="56" rx="8" fill="#c71317"/>
    <rect x="32" y="31" width="32" height="5" rx="2.5" fill="#ffffff"/>
    <rect x="32" y="43" width="24" height="5" rx="2.5" fill="#ffffff"/>
    <rect x="32" y="55" width="28" height="5" rx="2.5" fill="#ffffff"/>
  </svg>
`)}`;

const profileIcon = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <rect width="96" height="96" rx="48" fill="#ffffff"/>
    <circle cx="48" cy="48" r="34" fill="#326c9f"/>
    <ellipse cx="48" cy="41" rx="13" ry="17" fill="#ffffff"/>
    <path d="M25 70c3-13 16-20 23-20s20 7 23 20" fill="#ffffff"/>
  </svg>
`)}`;

export default function SidebarNav() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const { logout, user } = useAuth();
  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";
  const sidebarItems = [
    {
      to: isAdmin ? "/admin" : isManager ? "/feed/all" : "/clubs",
      label: isAdmin ? "Admin" : isManager ? "Dashboard" : "Clubs",
      mark: "C",
      iconSrc: clubsIcon
    },
    ...(isManager
      ? [
          { to: "/manager/posts", label: "Create Post", mark: "+", iconSrc: createPostIcon },
          { to: "/manager/club", label: "Club Info", mark: "I", iconSrc: clubInfoIcon }
        ]
      : []),
    { to: "/notice-board", label: "Notice Board", mark: "N", iconSrc: noticeBoardIcon },
    { to: "/calendar", label: "Calendar", mark: "D", iconSrc: calendarIcon },
    { to: "/registrations", label: "Registrations", mark: "R", iconSrc: registrationsIcon },
    { to: "/certificates", label: "My Certificates", mark: "T", iconSrc: certificatesIcon },
    { to: "/profile", label: "Profile", mark: "P", iconSrc: profileIcon }
  ];

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <aside className={`side-nav ${expanded ? "expanded" : ""}`}>
      <div className="side-nav__inner">
        <button
          type="button"
          className="side-nav__toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          title={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <span className="side-nav__toggle-mark">{expanded ? "<" : ">"}</span>
          <span className="side-nav__label">{expanded ? "Collapse" : "Expand"}</span>
        </button>

        {sidebarItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `side-nav__item ${isActive ? "active" : ""}`}
            title={item.label}
            aria-label={item.label}
          >
            <span className="side-nav__mark">
              {item.iconSrc ? (
                <img className="side-nav__icon-image" src={item.iconSrc} alt="" aria-hidden="true" />
              ) : (
                item.mark
              )}
            </span>
            <span className="side-nav__label">{item.label}</span>
          </NavLink>
        ))}

        <button
          type="button"
          className="side-nav__item side-nav__logout"
          onClick={handleLogout}
          title="Logout"
          aria-label="Logout"
        >
          <span className="side-nav__mark">L</span>
          <span className="side-nav__label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
