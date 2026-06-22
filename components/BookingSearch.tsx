import { useState } from "react";
import { cancelBooking, searchBooking } from "../lib/firebase";
import type { Booking } from "../types";

interface Props {
  onBack: () => void;
}

function statusClass(s: string) {
  if (s === "confirmed") return "badge-confirmed";
  if (s === "checked-in") return "badge-checked-in";
  return "badge-cancelled";
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-NG", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export default function BookingSearch({ onBack }: Props) {
  const [ref, setRef] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccess, setCancelSuccess] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!ref.trim() || !lastName.trim()) {
      setError("Both fields are required.");
      return;
    }
    setLoading(true);
    setError("");
    setBooking(null);
    setCancelSuccess(false);
    setCancelError("");

    try {
      const data = await searchBooking(ref.trim(), lastName.trim());
      setBooking(data);
    } catch (err: any) {
      setError(err.message || "Reservation not found.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelBooking() {
    if (!booking) return;
    setCancelling(true);
    setCancelError("");
    try {
      await cancelBooking(booking.id, lastName);
      setCancelSuccess(true);
      setBooking((b) => b ? { ...b, status: "cancelled" } : b);
      setShowCancelConfirm(false);
    } catch (err: any) {
      setCancelError(err.message || "Cancellation failed.");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="search-page">
      <div className="container" style={{ maxWidth: "720px" }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.82rem", marginBottom: "2.5rem", padding: 0 }}
        >
          Back to Home
        </button>

        <span className="section-eyebrow">Guest Services</span>
        <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2.5rem", fontWeight: 600, color: "var(--dark)", marginBottom: "0.75rem" }}>
          Manage Your Reservation
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: "2.5rem", fontSize: "0.95rem" }}>
          Enter your booking reference and last name to view or cancel your reservation.
        </p>

        {/* Search form */}
        <form onSubmit={search} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label">Booking Reference</label>
              <input
                className="field-input" placeholder="GHR-XXXXXX"
                value={ref} onChange={(e) => { setRef(e.target.value.toUpperCase()); setError(""); }}
              />
            </div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label">Last Name</label>
              <input
                className="field-input" placeholder="As booked"
                value={lastName} onChange={(e) => { setLastName(e.target.value); setError(""); }}
              />
            </div>
          </div>
          {error && <div className="msg-error" style={{ marginBottom: "1rem" }}>{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%" }}>
            {loading ? <><span className="spinner" /> Searching…</> : "Find Reservation"}
          </button>
        </form>

        {/* Result */}
        {booking && (
          <div style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {/* Status header */}
            <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.6rem", fontWeight: 600, color: "var(--dark)" }}>{booking.id}</span>
                <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: "0.2rem" }}>{booking.roomName}</p>
              </div>
              <span className={`badge ${statusClass(booking.status)}`}>{booking.status.replace("-", " ")}</span>
            </div>

            <div style={{ padding: "1.5rem 2rem" }}>
              {cancelSuccess && <div className="msg-success">Your reservation has been cancelled successfully.</div>}
              {cancelError && <div className="msg-error">{cancelError}</div>}

              {/* Dates */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.75rem" }}>
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.35rem" }}>Check-in</p>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "var(--dark)" }}>{fmt(booking.checkIn)}</p>
                </div>
                <div>
                  <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.35rem" }}>Check-out</p>
                  <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "var(--dark)" }}>{fmt(booking.checkOut)}</p>
                </div>
              </div>

              {/* Details rows */}
              {[
                ["Guests", booking.guests],
                ["Total Paid", `$${booking.totalPrice}`],
                ["Guest Name", `${booking.customer.firstName} ${booking.customer.lastName}`],
                ["Email", booking.customer.email],
                ["Phone", booking.customer.phone],
                ["Identity", booking.customer.passportNumber],
              ].map(([k, v]) => (
                <div className="summary-row" key={String(k)}>
                  <span className="summary-key">{k}</span>
                  <span className="summary-val" style={{ fontSize: "0.9rem" }}>{String(v)}</span>
                </div>
              ))}

              {/* Cancel button */}
              {booking.status !== "cancelled" && !cancelSuccess && (
                <div style={{ marginTop: "1.75rem", paddingTop: "1.25rem", borderTop: "1px solid var(--border)" }}>
                  {!showCancelConfirm ? (
                    <button
                      className="btn-outline"
                      onClick={() => setShowCancelConfirm(true)}
                      style={{ color: "var(--terracotta)", borderColor: "var(--terracotta)" }}
                    >
                      Cancel Reservation
                    </button>
                  ) : (
                    <div style={{ background: "#FDE8E8", padding: "1.25rem", borderRadius: "2px" }}>
                      <p style={{ fontWeight: 600, color: "var(--terracotta)", marginBottom: "0.5rem" }}>
                        Confirm Cancellation
                      </p>
                      <p style={{ fontSize: "0.85rem", color: "#7A1A1A", marginBottom: "1rem" }}>
                        This action cannot be undone. Are you sure you want to cancel booking <strong>{booking.id}</strong>?
                      </p>
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button className="btn-danger" onClick={handleCancelBooking} disabled={cancelling}>
                          {cancelling ? <><span className="spinner" /> Cancelling…</> : "Yes, Cancel"}
                        </button>
                        <button className="btn-ghost" onClick={() => setShowCancelConfirm(false)}>Keep Reservation</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
