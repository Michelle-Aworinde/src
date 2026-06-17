import { useState, useEffect, useCallback } from "react";
import type { Booking, Review, AdminStats } from "../types";

interface Props {
  token: string | null;
  onLogin: (token: string) => void;
  onLogout: () => void;
}

type AdminTab = "overview" | "bookings" | "reviews" | "rooms";

function statusClass(s: string) {
  if (s === "confirmed") return "badge-confirmed";
  if (s === "checked-in") return "badge-checked-in";
  return "badge-cancelled";
}

function fmt(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

function fmtTS(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Login ────────────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: (t: string) => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Authentication failed.");
      else onLogin(data.token);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-wrap" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <div style={{ width: "100%", maxWidth: "400px", padding: "0 1.5rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "52px", height: "52px", background: "var(--charcoal)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold-light)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="1" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.8rem", color: "var(--dark)" }}>
            Admin Access
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginTop: "0.4rem" }}>
            Femlister Lodge · Back Office
          </p>
        </div>

        <form onSubmit={submit} style={{ background: "var(--card)", border: "1px solid var(--border)", padding: "2rem" }}>
          {error && <div className="msg-error">{error}</div>}
          <div className="field-group">
            <label className="field-label">Administrator Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPw ? "text" : "password"}
                className="field-input"
                placeholder="Enter password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: "0.75rem", padding: 0 }}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !pw} style={{ width: "100%" }}>
            {loading ? <><span className="spinner" /> Authenticating…</> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function AdminPanel({ token, onLogin, onLogout }: Props) {
  if (!token) return <AdminLogin onLogin={onLogin} />;
  return <Dashboard token={token} onLogout={onLogout} />;
}

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<AdminTab>("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const authHeaders = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats", { headers: authHeaders });
      if (res.status === 401) { onLogout(); return; }
      setStats(await res.json());
    } catch { setGlobalError("Failed to load statistics."); }
    finally { setLoadingStats(false); }
  }, [token]);

  const fetchBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const res = await fetch("/api/admin/bookings", { headers: authHeaders });
      if (res.status === 401) { onLogout(); return; }
      setBookings(await res.json());
    } catch { setGlobalError("Failed to load bookings."); }
    finally { setLoadingBookings(false); }
  }, [token]);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await fetch("/api/admin/reviews", { headers: authHeaders });
      if (res.status === 401) { onLogout(); return; }
      setReviews(await res.json());
    } catch { setGlobalError("Failed to load reviews."); }
    finally { setLoadingReviews(false); }
  }, [token]);

  useEffect(() => { fetchStats(); fetchBookings(); fetchReviews(); }, [fetchStats, fetchBookings, fetchReviews]);

  return (
    <div className="admin-wrap">
      {/* Admin top bar removed — Navbar provides navigation and sign-out */}

      <div className="container" style={{ padding: "2.5rem 2rem" }}>
        {globalError && <div className="msg-error" style={{ marginBottom: "1.5rem" }}>{globalError}</div>}

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid var(--border)", marginBottom: "2rem", display: "flex", gap: 0 }}>
          {(["overview", "bookings", "reviews", "rooms"] as AdminTab[]).map((t) => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === "bookings" && !loadingBookings && (
                <span style={{ marginLeft: "0.5rem", background: "var(--gold-dim)", color: "var(--gold)", fontSize: "0.65rem", padding: "0.1rem 0.45rem", borderRadius: "10px" }}>
                  {bookings.length}
                </span>
              )}
              {t === "reviews" && !loadingReviews && (
                <span style={{ marginLeft: "0.5rem", background: "#FDE8E8", color: "var(--terracotta)", fontSize: "0.65rem", padding: "0.1rem 0.45rem", borderRadius: "10px" }}>
                  {reviews.filter((r) => !r.approved).length} pending
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab stats={stats} loading={loadingStats} />}
        {tab === "bookings" && (
          <BookingsTab bookings={bookings} loading={loadingBookings} token={token} onRefresh={fetchBookings} onLogout={onLogout} />
        )}
        {tab === "reviews" && (
          <ReviewsTab reviews={reviews} loading={loadingReviews} token={token} onRefresh={fetchReviews} onLogout={onLogout} />
        )}
        {tab === "rooms" && (
          <RoomsTab token={token} onLogout={onLogout} />
        )}
      </div>
    </div>
  );
}

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab({ stats, loading }: { stats: AdminStats | null; loading: boolean }) {
  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="spinner spinner-dark" /></div>;
  if (!stats) return null;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Bookings", value: stats.totalBookings, sub: "All time" },
          { label: "Revenue (Active)", value: `₦${stats.totalRevenue.toLocaleString()}`, sub: "Confirmed + checked-in" },
          { label: "Active Guests", value: stats.activeGuests, sub: "Current & upcoming" },
          { label: "Occupancy Rate", value: `${stats.occupancyRate}%`, sub: "Of all rooms" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="stat-card">
            <p className="stat-label">{label}</p>
            <p className="stat-value">{value}</p>
            <p className="stat-sub">{sub}</p>
          </div>
        ))}
      </div>
      <div className="msg-info">
        <strong style={{ fontSize: "0.78rem" }}>🔒 Security Note</strong>
        <p style={{ fontSize: "0.82rem", marginTop: "0.25rem" }}>
          All guest personal data (names, email, phone, ID, payment details) is stored encrypted using AES-256-CBC. Admin session tokens regenerate on every server restart.
        </p>
      </div>
    </div>
  );
}

// ─── Bookings tab ─────────────────────────────────────────────────────────────
function BookingsTab({ bookings, loading, token, onRefresh, onLogout }: {
  bookings: Booking[]; loading: boolean; token: string;
  onRefresh: () => void; onLogout: () => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Booking & { customer: any }>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const [showEncrypted, setShowEncrypted] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomError, setRoomError] = useState("");
  const INITIAL_CREATE_DATA = {
    roomId: 'king-room',
    checkIn: '',
    checkOut: '',
    guests: 1,
    customer: {
      phoneAreaCode: '+234',
      idType: 'passport',
      firstName: '',
      lastName: '',
      email: '',
      passportNumber: '',
      phone: '',
    },
  };
  const [createData, setCreateData] = useState<any>(INITIAL_CREATE_DATA);
  const [creating, setCreating] = useState(false);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  async function saveEdit(id: string) {
    setSaving(true);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}/amend`, {
        method: "POST", headers,
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) { setActionError(data.error || "Save failed."); }
      else { setEditId(null); setEditData({}); onRefresh(); }
    } catch { setActionError("Network error."); }
    finally { setSaving(false); }
  }

  async function deleteBooking(id: string) {
    setDeleting(id);
    setActionError("");
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: "DELETE", headers });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) { const d = await res.json(); setActionError(d.error || "Delete failed."); }
      else onRefresh();
    } catch { setActionError("Network error."); }
    finally { setDeleting(null); }
  }

  async function fetchRooms() {
    setLoadingRooms(true);
    setRoomError("");
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      if (!Array.isArray(data)) {
        setRoomError('Unable to load room options.');
        return;
      }
      setRooms(data);
      const validRoomIds = data.map((room: any) => room.id);
      if (!validRoomIds.includes(createData.roomId) && data.length > 0) {
        setCreateData((d: any) => ({ ...d, roomId: data[0].id }));
      }
    } catch {
      setRoomError('Unable to load room options.');
    } finally {
      setLoadingRooms(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  function isCreateDataValid() {
    const customer = createData.customer || {};
    return Boolean(
      createData.roomId &&
      createData.checkIn &&
      createData.checkOut &&
      createData.guests &&
      customer.firstName &&
      customer.lastName &&
      customer.email &&
      customer.passportNumber &&
      customer.phone
    );
  }

  async function createBooking() {
    if (!isCreateDataValid()) {
      setActionError('Please fill all required booking fields before creating.');
      return;
    }
    if (createData.checkOut <= createData.checkIn) {
      setActionError('Check-out must be after check-in.');
      return;
    }

    setCreating(true);
    setActionError("");
    try {
      const payload = {
        roomId: createData.roomId,
        checkIn: createData.checkIn,
        checkOut: createData.checkOut,
        guests: createData.guests,
        customer: {
          firstName: createData.customer?.firstName,
          lastName: createData.customer?.lastName,
          email: createData.customer?.email,
          idType: createData.customer?.idType,
          passportNumber: createData.customer?.passportNumber,
          phoneAreaCode: createData.customer?.phoneAreaCode,
          phone: createData.customer?.phone,
        },
      };
      const res = await fetch(`/api/admin/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { onLogout(); return; }
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { error: text || 'Unknown server response.' }; }
      if (!res.ok) { setActionError(data.error || 'Create failed.'); }
      else { setShowCreate(false); setCreateData(INITIAL_CREATE_DATA); onRefresh(); }
    } catch (e: any) {
      console.error('Admin create booking error', e);
      setActionError('Network error. Please confirm server is running and try again.');
    } finally { setCreating(false); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      {actionError && <div className="msg-error" style={{ marginBottom: "1rem" }}>{actionError}</div>}

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {["all", "confirmed", "checked-in", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.35rem 0.9rem", border: "1.5px solid", borderRadius: "2px",
                fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "all 0.15s",
                background: filter === f ? "var(--gold)" : "transparent",
                color: filter === f ? "#fff" : "var(--muted)",
                borderColor: filter === f ? "var(--gold)" : "var(--border)",
              }}
            >
              {f === "all" ? `All (${bookings.length})` : f}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button className="btn-outline" onClick={() => setShowCreate(true)} style={{ fontSize: "0.78rem" }}>＋ Create Booking</button>
          <button className="btn-ghost" onClick={onRefresh} style={{ fontSize: "0.78rem" }}>↻ Refresh</button>
        </div>
      </div>

      {/* Create booking form modal */}
      {showCreate && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '1rem', marginBottom: '1rem' }}>
          <h4 style={{ marginBottom: '0.75rem', fontFamily: 'Cormorant Garamond, serif' }}>Create Booking</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
            <div className="field-group">
              <label className="field-label">Room</label>
              {loadingRooms ? (
                <div style={{ color: 'var(--muted)', padding: '0.85rem 0' }}>Loading rooms…</div>
              ) : roomError ? (
                <input className="field-input" value={createData.roomId || ''} onChange={(e) => setCreateData(d => ({ ...d, roomId: e.target.value }))} placeholder="room id (e.g. king-room)" />
              ) : (
                <select className="field-input" value={createData.roomId || ''} onChange={(e) => setCreateData(d => ({ ...d, roomId: e.target.value }))}>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="field-group">
              <label className="field-label">Check-in</label>
              <input type="date" className="field-input" value={createData.checkIn || ''} onChange={(e) => setCreateData(d => ({ ...d, checkIn: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Check-out</label>
              <input type="date" className="field-input" value={createData.checkOut || ''} onChange={(e) => setCreateData(d => ({ ...d, checkOut: e.target.value }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Guests</label>
              <input type="number" min={1} max={10} className="field-input" value={createData.guests || 1} onChange={(e) => setCreateData(d => ({ ...d, guests: Number(e.target.value) }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Guest First Name</label>
              <input className="field-input" value={createData.customer?.firstName || ''} onChange={(e) => setCreateData(d => ({ ...d, customer: { ...d.customer, firstName: e.target.value } }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Guest Last Name</label>
              <input className="field-input" value={createData.customer?.lastName || ''} onChange={(e) => setCreateData(d => ({ ...d, customer: { ...d.customer, lastName: e.target.value } }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input className="field-input" value={createData.customer?.email || ''} onChange={(e) => setCreateData(d => ({ ...d, customer: { ...d.customer, email: e.target.value } }))} />
            </div>
            <div className="field-group">
              <label className="field-label">Passport / ID</label>
              <input className="field-input" value={createData.customer?.passportNumber || ''} onChange={(e) => setCreateData(d => ({ ...d, customer: { ...d.customer, passportNumber: e.target.value } }))} placeholder="Passport or ID number" />
            </div>
            <div className="field-group">
              <label className="field-label">Country Code</label>
              <select className="field-input" value={createData.customer?.phoneAreaCode || '+234'} onChange={(e) => setCreateData(d => ({ ...d, customer: { ...d.customer, phoneAreaCode: e.target.value } }))}>
                {['+234', '+1', '+44', '+233', '+27'].map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Phone</label>
              <input className="field-input" value={createData.customer?.phone || ''} onChange={(e) => setCreateData(d => ({ ...d, customer: { ...d.customer, phone: e.target.value } }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem' }}>
            <button type="button" className="btn-primary" onClick={createBooking} disabled={creating || !isCreateDataValid()}>{creating ? 'Creating…' : 'Create'}</button>
            <button type="button" className="btn-ghost" onClick={() => { setShowCreate(false); setCreateData(INITIAL_CREATE_DATA); }}>Cancel</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "3rem", textAlign: "center" }}>No bookings found.</p>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: "2px", border: "1px solid var(--border)" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Room</th>
                <th>Guest</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <>
                  <tr key={b.id} style={{ cursor: "pointer" }} onClick={() => setExpanded(expanded === b.id ? null : b.id)}>
                    <td style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600, color: "var(--dark)" }}>{b.id}</td>
                    <td style={{ whiteSpace: "nowrap", maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis" }}>{b.roomName}</td>
                    <td>{b.customer.firstName} {b.customer.lastName}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmt(b.checkIn)}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{fmt(b.checkOut)}</td>
                    <td style={{ fontWeight: 600 }}>₦{b.totalPrice}</td>
                    <td><span className={`badge ${statusClass(b.status)}`}>{b.status.replace("-", " ")}</span></td>
                    <td>
                      <div style={{ display: "flex", gap: "0.4rem" }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn-ghost"
                          title="Edit"
                          onClick={() => { setEditId(editId === b.id ? null : b.id); setEditData({ checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, guests: b.guests, customer: { ...b.customer } }); setActionError(""); }}
                          style={{ fontSize: "0.78rem", color: "var(--gold)" }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-ghost"
                          title="View encrypted"
                          onClick={() => setShowEncrypted(showEncrypted === b.id ? null : b.id)}
                          style={{ fontSize: "0.78rem" }}
                        >
                          🔒
                        </button>
                        <button
                          onClick={() => { if (window.confirm(`Delete booking ${b.id}? This cannot be undone.`)) deleteBooking(b.id); }}
                          disabled={deleting === b.id}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--terracotta)", fontSize: "0.78rem" }}
                        >
                          {deleting === b.id ? "…" : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail */}
                  {expanded === b.id && editId !== b.id && (
                    <tr key={`${b.id}-detail`}>
                      <td colSpan={8} style={{ background: "var(--cream-light)", padding: "1.25rem 1.5rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "0.75rem", fontSize: "0.83rem" }}>
                          {[
                            ["Email", b.customer.email],
                            ["Phone", b.customer.phone],
                            ["ID / Passport", b.customer.passportNumber],
                            ["Guests", b.guests],
                            ["Created", fmtTS(b.createdAt || "")],
                          ].map(([k, v]) => (
                            <div key={String(k)}>
                              <span style={{ color: "var(--muted)", fontSize: "0.7rem", display: "block", marginBottom: "0.2rem" }}>{k}</span>
                              <span style={{ fontWeight: 500, color: "var(--dark)" }}>{String(v)}</span>
                            </div>
                          ))}
                        </div>

                        {showEncrypted === b.id && b.encryptedFields && (
                          <div style={{ marginTop: "1rem", borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>
                              🔒 Encrypted Storage Values
                            </p>
                            <div style={{ display: "grid", gap: "0.4rem" }}>
                              {Object.entries(b.encryptedFields).map(([k, v]) => (
                                <div key={k} style={{ display: "grid", gridTemplateColumns: "130px 1fr", gap: "0.75rem", alignItems: "start" }}>
                                  <span style={{ fontSize: "0.7rem", color: "var(--muted)", paddingTop: "2px" }}>{k}</span>
                                  <span className="encrypted-field">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}

                  {/* Edit form */}
                  {editId === b.id && (
                    <tr key={`${b.id}-edit`}>
                      <td colSpan={8} style={{ background: "var(--cream-light)", padding: "1.5rem" }}>
                        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "1.25rem" }}>
                          Editing {b.id}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">Check-in</label>
                            <input type="date" className="field-input" value={editData.checkIn || ""} onChange={(e) => setEditData((d) => ({ ...d, checkIn: e.target.value }))} />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">Check-out</label>
                            <input type="date" className="field-input" value={editData.checkOut || ""} onChange={(e) => setEditData((d) => ({ ...d, checkOut: e.target.value }))} />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">Status</label>
                            <select className="field-input" value={editData.status || b.status} onChange={(e) => setEditData((d) => ({ ...d, status: e.target.value as any }))}>
                              <option value="confirmed">Confirmed</option>
                              <option value="checked-in">Checked-in</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">Guests</label>
                            <input type="number" min={1} max={4} className="field-input" value={editData.guests || b.guests} onChange={(e) => setEditData((d) => ({ ...d, guests: Number(e.target.value) }))} />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">First Name</label>
                            <input className="field-input" value={editData.customer?.firstName || ""} onChange={(e) => setEditData((d) => ({ ...d, customer: { ...d.customer, firstName: e.target.value } }))} />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">Last Name</label>
                            <input className="field-input" value={editData.customer?.lastName || ""} onChange={(e) => setEditData((d) => ({ ...d, customer: { ...d.customer, lastName: e.target.value } }))} />
                          </div>
                          <div className="field-group" style={{ marginBottom: 0 }}>
                            <label className="field-label">Email</label>
                            <input type="email" className="field-input" value={editData.customer?.email || ""} onChange={(e) => setEditData((d) => ({ ...d, customer: { ...d.customer, email: e.target.value } }))} />
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "0.75rem" }}>
                          <button className="btn-primary" onClick={() => saveEdit(b.id)} disabled={saving} style={{ padding: "0.6rem 1.5rem" }}>
                            {saving ? <><span className="spinner" /> Saving…</> : "Save Changes"}
                          </button>
                          <button className="btn-ghost" onClick={() => { setEditId(null); setEditData({}); }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Reviews tab ──────────────────────────────────────────────────────────────
function ReviewsTab({ reviews, loading, token, onRefresh, onLogout }: {
  reviews: Review[]; loading: boolean; token: string;
  onRefresh: () => void; onLogout: () => void;
}) {
  const [acting, setActing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);
  const headers = { Authorization: `Bearer ${token}` };

  const displayed = showAll ? reviews : reviews.filter((r) => !r.approved);

  async function approve(id: string) {
    setActing(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}/approve`, { method: "POST", headers });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) setError("Approval failed.");
      else onRefresh();
    } catch { setError("Network error."); }
    finally { setActing(null); }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this review permanently?")) return;
    setActing(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE", headers });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) setError("Delete failed.");
      else onRefresh();
    } catch { setError("Network error."); }
    finally { setActing(null); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="spinner spinner-dark" /></div>;

  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <div>
      {error && <div className="msg-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowAll(false)}
            style={{ padding: "0.35rem 0.9rem", border: "1.5px solid", borderRadius: "2px", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "all 0.15s", background: !showAll ? "var(--gold)" : "transparent", color: !showAll ? "#fff" : "var(--muted)", borderColor: !showAll ? "var(--gold)" : "var(--border)" }}
          >
            Pending ({pending})
          </button>
          <button
            onClick={() => setShowAll(true)}
            style={{ padding: "0.35rem 0.9rem", border: "1.5px solid", borderRadius: "2px", fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "DM Sans, sans-serif", transition: "all 0.15s", background: showAll ? "var(--gold)" : "transparent", color: showAll ? "#fff" : "var(--muted)", borderColor: showAll ? "var(--gold)" : "var(--border)" }}
          >
            All ({reviews.length})
          </button>
        </div>
        <button className="btn-ghost" onClick={onRefresh} style={{ fontSize: "0.78rem" }}>↻ Refresh</button>
      </div>

      {displayed.length === 0 ? (
        <p style={{ color: "var(--muted)", padding: "3rem", textAlign: "center" }}>
          {showAll ? "No reviews found." : "No pending reviews — you're all caught up! ✓"}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {displayed.map((r) => (
            <div key={r.id} style={{ background: "var(--card)", border: `1px solid ${r.approved ? "var(--border)" : "rgba(184,137,46,0.35)"}`, padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--dark)" }}>{r.author}</strong>
                    <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>{r.location}</span>
                    <span className={`badge ${r.approved ? "badge-confirmed" : "badge-cancelled"}`}>
                      {r.approved ? "Published" : "Pending"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "0.6rem" }}>
                    {[1,2,3,4,5].map((n) => (
                      <span key={n} style={{ color: n <= r.rating ? "var(--gold)" : "var(--warm)", fontSize: "0.85rem" }}>★</span>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.87rem", color: "var(--text)", lineHeight: 1.65, marginBottom: "0.6rem", fontStyle: "italic" }}>"{r.comment}"</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                    Ref: <span style={{ fontFamily: "monospace" }}>{r.bookingId}</span> · {r.date}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                  {!r.approved && (
                    <button
                      className="btn-primary"
                      onClick={() => approve(r.id)}
                      disabled={acting === r.id}
                      style={{ padding: "0.45rem 1rem", fontSize: "0.75rem" }}
                    >
                      {acting === r.id ? <span className="spinner" /> : "Approve"}
                    </button>
                  )}
                  <button
                    className="btn-danger"
                    onClick={() => remove(r.id)}
                    disabled={acting === r.id}
                  >
                    {acting === r.id ? <span className="spinner" /> : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rooms tab ──────────────────────────────────────────────────────────────
function RoomsTab({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({ id: "", name: "", description: "", pricePerNight: 0, capacity: 1, amenities: [], image: "" });

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  async function fetchRooms() {
    setLoading(true); setError("");
    try {
      const res = await fetch('/api/admin/rooms', { headers });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json(); setRooms(data || []);
    } catch { setError('Failed to load rooms.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchRooms(); }, []);

  function setField(k: string, v: any) { setForm((f:any) => ({ ...f, [k]: v })); }

  async function save() {
    setError("");
    try {
      if (!form.id || !form.name) { setError('Id and name are required.'); return; }
      const url = editing ? `/api/admin/rooms/${editing}/amend` : '/api/admin/rooms';
      const method = editing ? 'POST' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(form) });
      if (res.status === 401) { onLogout(); return; }
      const data = await res.json(); if (!res.ok) { setError(data.error || 'Save failed.'); return; }
      setForm({ id: "", name: "", description: "", pricePerNight: 0, capacity: 1, amenities: [], image: "" }); setEditing(null); fetchRooms();
    } catch { setError('Network error.'); }
  }

  async function remove(id: string) {
    if (!confirm('Delete room permanently?')) return;
    try {
      const res = await fetch(`/api/admin/rooms/${id}`, { method: 'DELETE', headers });
      if (res.status === 401) { onLogout(); return; }
      if (!res.ok) { const d = await res.json(); setError(d.error || 'Delete failed.'); return; }
      fetchRooms();
    } catch { setError('Network error.'); }
  }

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}><div className="spinner spinner-dark" /></div>;

  return (
    <div>
      {error && <div className="msg-error" style={{ marginBottom: "1rem" }}>{error}</div>}

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Rooms ({rooms.length})</h3>
        <button className="btn-primary" onClick={() => { setEditing(null); setForm({ id: `room-${Date.now()}`, name: '', description: '', pricePerNight: 0, capacity: 1, amenities: [], image: '' }); }} style={{ marginLeft: 'auto' }}>New Room</button>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {rooms.map((r) => (
          <div key={r.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{r.name} <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', marginLeft: '0.6rem' }}>{r.id}</span></div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{r.description}</div>
              <div style={{ marginTop: '0.25rem', color: 'var(--muted)' }}>₦{r.pricePerNight} · up to {r.capacity} guest{r.capacity>1?'s':''}</div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-ghost" onClick={() => { setEditing(r.id); setForm(r); }}>Edit</button>
              <button className="btn-danger" onClick={() => remove(r.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor */}
      <div style={{ marginTop: '1.5rem', background: 'var(--card)', border: '1px solid var(--border)', padding: '1rem' }}>
        <h4 style={{ marginTop: 0 }}>{editing ? `Editing ${editing}` : 'New / Edit Room'}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <div className="field-group"><label className="field-label">ID</label><input className="field-input" value={form.id} onChange={(e)=>setField('id', e.target.value)} disabled={!!editing} /></div>
          <div className="field-group"><label className="field-label">Name</label><input className="field-input" value={form.name} onChange={(e)=>setField('name', e.target.value)} /></div>
          <div className="field-group" style={{ gridColumn: '1 / -1' }}><label className="field-label">Description</label><input className="field-input" value={form.description} onChange={(e)=>setField('description', e.target.value)} /></div>
          <div className="field-group"><label className="field-label">Price per night (NGN)</label><input type="number" className="field-input" value={form.pricePerNight} onChange={(e)=>setField('pricePerNight', Number(e.target.value))} /></div>
          <div className="field-group"><label className="field-label">Capacity</label><input type="number" min={1} className="field-input" value={form.capacity} onChange={(e)=>setField('capacity', Number(e.target.value))} /></div>
          <div className="field-group" style={{ gridColumn: '1 / -1' }}><label className="field-label">Image URL</label><input className="field-input" value={form.image} onChange={(e)=>setField('image', e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
          <button className="btn-primary" onClick={save}>Save Room</button>
          <button className="btn-ghost" onClick={()=>{ setEditing(null); setForm({ id: '', name: '', description: '', pricePerNight: 0, capacity: 1, amenities: [], image: '' }); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
