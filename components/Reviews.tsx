import { useState, useEffect } from "react";
import type { Review } from "../types";

function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="review-stars" style={{ cursor: interactive ? "pointer" : "default" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`star-icon ${n <= (interactive ? (hovered || rating) : rating) ? "" : "empty"}`}
          onMouseEnter={() => interactive && setHovered(n)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(n)}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" });
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !bookingId.trim()) {
      setFormError("Name, booking reference, and comment are required.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, location, rating, comment, bookingId }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error); }
      else {
        setFormSuccess(data.message);
        setAuthor(""); setLocation(""); setRating(5); setComment(""); setBookingId("");
        setShowForm(false);
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="section" style={{ background: "var(--cream)" }}>
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "3rem", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <span className="section-eyebrow">Guest Chronicle</span>
            <h2 className="section-title">What Our Guests Say</h2>
            <p className="section-sub">Verified reviews from guests who have stayed with us.</p>
          </div>
          <button className="btn-outline" onClick={() => { setShowForm(!showForm); setFormSuccess(""); setFormError(""); }}>
            {showForm ? "Cancel" : "Write a Review"}
          </button>
        </div>

        {/* Review form */}
        {showForm && (
          <form onSubmit={submitReview} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "2rem", marginBottom: "2.5rem" }}>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.35rem", marginBottom: "1.5rem", color: "var(--dark)" }}>
              Share Your Experience
            </h3>
            {formError && <div className="msg-error">{formError}</div>}
            {formSuccess && <div className="msg-success">{formSuccess}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="field-group">
                <label className="field-label">Your Name</label>
                <input className="field-input" placeholder="First Name" value={author} onChange={(e) => setAuthor(e.target.value)} />
              </div>
              <div className="field-group">
                <label className="field-label">City / Country</label>
                <input className="field-input" placeholder="e.g. Lagos, Nigeria" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Booking Reference</label>
              <input
                className="field-input" placeholder="GHR-XXXXXX"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value.toUpperCase())}
              />
              <p style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: "0.3rem" }}>
                Only verified guests with a valid booking reference may submit a review.
              </p>
            </div>
            <div className="field-group">
              <label className="field-label">Rating</label>
              <Stars rating={rating} interactive onChange={setRating} />
            </div>
            <div className="field-group">
              <label className="field-label">Your Review</label>
              <textarea
                className="field-input" rows={4}
                placeholder="Tell us about your stay…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: "vertical", minHeight: "100px" }}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <><span className="spinner" /> Submitting…</> : "Submit Review"}
            </button>
          </form>
        )}

        {formSuccess && !showForm && (
          <div className="msg-success" style={{ marginBottom: "2rem" }}>{formSuccess}</div>
        )}

        {/* Reviews grid */}
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "3rem 0" }}>
            <div className="spinner spinner-dark" />
          </div>
        ) : reviews.length === 0 ? (
          <p style={{ color: "var(--muted)", textAlign: "center", padding: "3rem 0" }}>
            No reviews yet. Be the first to share your experience.
          </p>
        ) : (
          <div className="reviews-grid">
            {reviews.map((r) => (
              <div key={r.id} className="review-card">
                <Stars rating={r.rating} />
                <p className="review-comment">"{r.comment}"</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p className="review-author-name">{r.author}</p>
                    <p className="review-author-loc">{r.location}</p>
                  </div>
                  <p className="review-date">{fmtDate(r.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
