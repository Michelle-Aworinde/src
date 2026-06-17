interface Props {
  onExplore: () => void;
}

export default function Hero({ onExplore }: Props) {
  return (
    <section className="hero">
      <div className="hero-img" />

      <div className="container hero-content">
        <p className="hero-eyebrow">Isheri Oshun, Lagos · Nigeria</p>

        <h1 className="hero-title">
          Where Lagos<br />
          <em>Enjoyment</em> Begins
        </h1>

        <p className="hero-sub">
          Four meticulously designed suites crafted for only the best traveller.
          Welcoming. Warm, Well-Kept.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={onExplore} style={{ fontSize: "0.82rem", padding: "0.9rem 2.5rem" }}>
            Explore Rooms
          </button>
          <a
            href="https://wa.me/234704855hallhallwtoil295"
            target="_blank"
            rel="noreferrer"
            className="btn-outline"
            style={{ color: "#fff", borderColor: "rgba(255,255,255,0.4)", fontSize: "0.82rem" }}
          >
            Contact Concierge
          </a>
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", gap: "2rem", marginTop: "3rem", flexWrap: "wrap" }}>
          {[
            { icon: "⚡", label: "24 Hour Electricity" },
            { icon: "🔒", label: "Well Secured Area" },
          ].map(({ icon, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "1rem" }}>{icon}</span>
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)", fontWeight: 500, letterSpacing: "0.08em" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="hero-scroll" onClick={onExplore} style={{ cursor: "pointer" }}>
        <span>Scroll</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 1v12M2 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
