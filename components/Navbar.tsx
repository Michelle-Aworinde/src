import { useState, useEffect } from "react";
import type { AppView } from "../App";

interface Props {
  view: AppView;
  setView: (v: AppView) => void;
  isAdmin: boolean;
  onLogout: () => void;
  onScrollRooms: () => void;
}

export default function Navbar({ view, setView, isAdmin, onLogout, onScrollRooms }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isOpaque = view !== "home";

  function nav(to: AppView) {
    setView(to);
    setMobileOpen(false);
  }

  return (
    <>
      <nav className={`navbar ${isOpaque ? "opaque" : scrolled ? "scrolled" : ""}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <button
            onClick={() => nav("home")}
            className="navbar-brand"
            aria-label="Go to home"
          >
            <img src="/images/logo.jpg" alt="Femlister Lodge" className="logo-img" />
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">Femlister Lodge</span>
              <span className="navbar-logo-subtitle">Isheri Oshun, Lagos · Nigeria</span>
            </div>
          </button>

          {/* Desktop Links */}
          <div className="nav-links">
            <button
              className={`nav-link ${view === "home" ? "active" : ""}`}
              onClick={onScrollRooms}
            >
              Rooms
            </button>
            <button
              className={`nav-link ${view === "search" ? "active" : ""}`}
              onClick={() => nav("search")}
            >
              My Booking
            </button>
            {isAdmin ? (
              <>
                <button
                  className={`nav-link ${view === "admin" ? "active" : ""}`}
                  onClick={() => nav("admin")}
                >
                  Dashboard
                </button>
                <button className="nav-link" onClick={onLogout}>
                  Sign Out
                </button>
              </>
            ) : null}
            <button className="btn-primary" onClick={onScrollRooms} style={{ padding: "0.6rem 1.4rem" }}>
              Reserve
            </button>
          </div>

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
          {mobileOpen && (
        <div className="mobile-nav" onClick={() => setMobileOpen(false)}>
          <button className="navbar-brand" onClick={() => nav("home")} aria-label="Go to home">
            <img src="/images/logo.jpg" alt="Femlister Lodge" className="logo-img" />
            <div className="navbar-logo-text">
              <span className="navbar-logo-title">Femlister Lodge</span>
              <span className="navbar-logo-subtitle">Isheri Oshun, Lagos · Nigeria</span>
            </div>
          </button>
          <button className="nav-link" onClick={onScrollRooms}>Rooms</button>
          <button className="nav-link" onClick={() => nav("search")}>My Booking</button>
          {isAdmin ? (
            <>
              <button className="nav-link" onClick={() => nav("admin")}>Dashboard</button>
              <button className="nav-link" onClick={onLogout}>Sign Out</button>
            </>
          ) : null}
          <button className="btn-primary" onClick={onScrollRooms}>Reserve Now</button>
        </div>
      )}
    </>
  );
}
