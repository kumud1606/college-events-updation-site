import { useEffect, useMemo, useState } from "react";
import AppShell from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import { normalizeEvent } from "../utils/normalizers";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, monthIndex) => ({
  value: monthIndex,
  label: new Date(2026, monthIndex, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  })
}));

function getMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cells = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function getDateKey(date) {
  return date.toLocaleDateString("en-CA");
}

function getRoleLabel(registration) {
  if (registration.participate && registration.volunteer) {
    return "Participating + Volunteering";
  }

  if (registration.volunteer) {
    return "Volunteering";
  }

  return "Participating";
}

function getDayTone(dayEvents) {
  const hasParticipating = dayEvents.some((event) => event.participate);
  const hasVolunteering = dayEvents.some((event) => event.volunteer);

  if (hasParticipating && hasVolunteering) {
    return "mixed";
  }

  if (hasVolunteering) {
    return "volunteer";
  }

  return "participate";
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [activeMonth, setActiveMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const currentMonthIndex = new Date().getMonth();

  useEffect(() => {
    api.getMyRegistrations().then((response) => {
      setRegistrations(
        response.registrations.map((registration) => ({
          ...registration,
          event: normalizeEvent(registration.event)
        }))
      );
    });
  }, []);

  const eventsByDate = useMemo(
    () =>
      registrations.reduce((grouped, registration) => {
        const key = getDateKey(new Date(registration.event.startDate));
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(registration);
        return grouped;
      }, {}),
    [registrations]
  );

  const monthCells = useMemo(() => getMonthGrid(activeMonth), [activeMonth]);
  const monthLabel = activeMonth.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric"
  });
  const todayKey = getDateKey(new Date());

  return (
    <AppShell myClubCount={user?.clubs?.length || 0}>
      <section className="calendar-page">
        <div className="calendar-board">
          <div className="calendar-board__header">
            <div>
              <p className="eyebrow">Personal Calendar</p>
              <h1>{monthLabel}</h1>
              <p>Hover on a marked date to see the club name and your role for that event.</p>
            </div>

            <div className="calendar-board__controls">
              <div className="calendar-board__month-picker">
                <span className="calendar-board__month-icon" aria-hidden="true">
                  Month
                </span>
                <div className="calendar-board__month-scroller" role="tablist" aria-label="Select month">
                  {MONTH_OPTIONS.map((month) => {
                    const isActive = month.value === activeMonth.getMonth();
                    const isCurrentMonth = month.value === currentMonthIndex;

                    return (
                      <button
                        key={month.value}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`calendar-board__month-chip ${isActive ? "calendar-board__month-chip--active" : ""} ${
                          isCurrentMonth ? "calendar-board__month-chip--current" : ""
                        }`}
                        onClick={() => setActiveMonth(new Date(activeMonth.getFullYear(), month.value, 1))}
                      >
                        <span>{month.label}</span>
                        {isCurrentMonth ? <small>This month</small> : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="calendar-legend">
            <span className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-legend__dot--participate" />
              Participating
            </span>
            <span className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-legend__dot--volunteer" />
              Volunteering
            </span>
            <span className="calendar-legend__item">
              <span className="calendar-legend__dot calendar-legend__dot--mixed" />
              Both Roles
            </span>
          </div>

          <div className="calendar-grid">
            {WEEK_DAYS.map((day) => (
              <div key={day} className="calendar-grid__weekday">
                {day}
              </div>
            ))}

            {monthCells.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="calendar-grid__cell calendar-grid__cell--empty" />;
              }

              const dateKey = getDateKey(date);
              const dayEvents = eventsByDate[dateKey] || [];
              const isToday = dateKey === todayKey;
              const tone = dayEvents.length > 0 ? getDayTone(dayEvents) : "";

              return (
                <div key={dateKey} className={`calendar-grid__cell ${isToday ? "calendar-grid__cell--today" : ""}`}>
                  <div
                    className={`calendar-grid__date ${tone ? `calendar-grid__date--${tone}` : ""}`}
                    tabIndex={dayEvents.length > 0 ? 0 : -1}
                  >
                    {isToday ? <span className="calendar-grid__today-badge">Today</span> : null}
                    {date.getDate()}
                    {dayEvents.length > 0 ? (
                      <div className="calendar-grid__tooltip">
                        {dayEvents.map((registration) => (
                          <div key={registration.id} className="calendar-grid__tooltip-item">
                            <strong>{registration.event.club?.name || registration.event.title}</strong>
                            <span>{getRoleLabel(registration)}</span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
