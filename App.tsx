import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RoomsSection from "./components/RoomsSection";
import BookingModal from "./components/BookingModal";
import BookingSearch from "./components/BookingSearch";
import Reviews from "./components/Reviews";
import AdminPanel from "./components/AdminPanel";
import AmenitiesSection from "./components/AmenitiesSection";
import MapSection from "./components/MapSection";
import Footer from "./components/Footer";
import { isFirebaseConfigured } from "./lib/firebase";
import type { Room } from "./types";

export type AppView = "home" | "search" | "admin";

export default function App() {
  const [view, setView] = useState<AppView>(() => {
    try {
      if (typeof window !== "undefined" && window.location.pathname === "/admin") return "admin";
    } catch {}
    return "home";
  });
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    sessionStorage.getItem("fl_admin")
  );

  function handleAdminLogin(token: string) {
    sessionStorage.setItem("fl_admin", token);
    setAdminToken(token);
  }

  function handleAdminLogout() {
    sessionStorage.removeItem("fl_admin");
    setAdminToken(null);
    setView("home");
  }

  function scrollToRooms() {
    if (view !== "home") {
      setView("home");
      setTimeout(() => document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" }), 120);
    } else {
      document.getElementById("rooms")?.scrollIntoView({ behavior: "smooth" });
    }
  }

  return (
    <>
      <Navbar
        view={view}
        setView={setView}
        isAdmin={!!adminToken}
        onLogout={handleAdminLogout}
        onScrollRooms={scrollToRooms}
      />

      {import.meta.env.DEV && (
        <div
          style={{
            position: "fixed",
            right: "0.75rem",
            top: "4.75rem",
            zIndex: 1000,
            background: isFirebaseConfigured ? "rgba(34, 197, 94, 0.92)" : "rgba(248, 113, 113, 0.92)",
            color: "white",
            padding: "0.4rem 0.65rem",
            borderRadius: "999px",
            fontSize: "0.72rem",
            fontWeight: 700,
            boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
          }}
        >
          {isFirebaseConfigured ? "Firebase: live" : "Firebase: fallback"}
        </div>
      )}

      {view === "home" && (
        <>
          <Hero onExplore={scrollToRooms} />
          <RoomsSection onBook={setBookingRoom} />
          <AmenitiesSection />
          <Reviews />
          <MapSection />
          <Footer />
        </>
      )}

      {view === "search" && <BookingSearch onBack={() => setView("home")} />}

      

      {view === "admin" && (
        <AdminPanel
          token={adminToken}
          onLogin={handleAdminLogin}
          onLogout={handleAdminLogout}
        />
      )}

      {bookingRoom && (
        <BookingModal room={bookingRoom} onClose={() => setBookingRoom(null)} />
      )}
    </>
  );
}
