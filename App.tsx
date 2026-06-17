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
