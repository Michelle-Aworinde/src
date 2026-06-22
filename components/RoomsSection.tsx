import { useState, useEffect } from "react";
import { getRooms } from "../lib/firebase";
import type { Room } from "../types";

interface Props {
  onBook: (room: Room) => void;
}

export default function RoomsSection({ onBook }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRooms()
      .then((data) => setRooms(data))
      .catch(() => setError("Could not load rooms. Please refresh the page."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="rooms" className="section" style={{ background: "var(--cream-light)" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="section-eyebrow">Our Accommodations</span>
            <h2 className="section-title">Amazing Rooms</h2>
            <p className="section-sub">Every room is beautiful and elegant</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", fontSize: "0.82rem" }}>
            <svg width="14" height="55" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            All prices in NGN
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div className="spinner spinner-dark" />
          </div>
        )}

        {error && <p className="msg-error">{error}</p>}

        {!loading && !error && (
          <div className="rooms-grid">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} onBook={onBook} />
            ))}
          </div>
        )}

        {/* Info strip */}
        <div style={{
          marginTop: "3rem", padding: "1.5rem 2rem",
          background: "var(--card)", border: "1px solid var(--border)",
          display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between"
        }}>
          {[
            { label: "Flexible Cancellation", desc: "Cancel anytime before check-in" },
            { label: "Pay On Site", desc: "Accepting Card and Cash Payments" },
            { label: "Encrypted Records", desc: "Your data is AES-256 protected" },
          ].map(({ label, desc }) => (
            <div key={label}>
              <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--dark)", marginBottom: "0.2rem" }}>{label}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoomCard({ room, onBook }: { room: Room; onBook: (r: Room) => void }) {
  const [imgError, setImgError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = room.images && room.images.length > 0 ? room.images : [room.image];
  const currentImage = images[imageIndex % images.length];

  function changeImage(delta: number) {
    setImgError(false);
    setImageIndex((current) => (current + delta + images.length) % images.length);
  }

  return (
    <article className="room-card">
      <div className="room-img-wrap" style={{ position: "relative" }}>
        <img
          src={imgError ? "/images/budget-1.jpeg" : currentImage}
          alt={room.name}
          className="room-img"
          loading="lazy"
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div className="room-price-tag">₦{room.pricePerNight} / night</div>
        {images.length > 1 && (
          <> 
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); changeImage(-1); }}
              style={{
                position: "absolute",
                top: "50%",
                left: "0.75rem",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(0,0,0,0.45)",
                color: "white",
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); changeImage(1); }}
              style={{
                position: "absolute",
                top: "50%",
                right: "0.75rem",
                transform: "translateY(-50%)",
                border: "none",
                background: "rgba(0,0,0,0.45)",
                color: "white",
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                cursor: "pointer",
              }}
              aria-label="Next photo"
            >
              ›
            </button>
            <div style={{
              position: "absolute",
              left: "50%",
              bottom: "0.75rem",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "0.45rem",
            }}>
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setImageIndex(idx); setImgError(false); }}
                  style={{
                    width: "0.6rem",
                    height: "0.6rem",
                    borderRadius: "50%",
                    border: "none",
                    background: idx === imageIndex ? "white" : "rgba(255,255,255,0.55)",
                    cursor: "pointer",
                  }}
                  aria-label={`Show photo ₦{idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="room-body">
        <h3 className="room-name">{room.name}</h3>
        <p className="room-desc">{room.description}</p>

        <div className="room-amenities">
          {room.amenities.slice(0, 5).map((a) => (
            <span key={a} className="amenity-pill">{a}</span>
          ))}
          {room.amenities.length > 5 && (
            <span className="amenity-pill">+{room.amenities.length - 5} more</span>
          )}
        </div>

        <div className="room-footer">
          <div className="room-price">
            <span className="room-price-amount">₦{room.pricePerNight}</span>
            <span className="room-price-unit"> / night</span>
            <div className="room-capacity" style={{ marginTop: "0.15rem" }}>
              Up to {room.capacity} guest{room.capacity > 1 ? "s" : ""}
            </div>
          </div>
          <button className="btn-primary" onClick={() => onBook(room)} style={{ padding: "0.65rem 1.5rem" }}>
            Reserve
          </button>
        </div>
      </div>
    </article>
  );
}
