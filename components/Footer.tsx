export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "2.5rem", flexWrap: "wrap" }}>
          {/* Brand */}
          <div>
            <p className="footer-logo">Femlister <span>Lodge</span></p>
            <p className="footer-tagline">Isheri Oshun, Lagos · Nigeria</p>
            <p style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: "320px" }}>
              A welcoming stay with Lagos warmth. Unique suites, kept private and peaceful
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
              Navigation
            </p>
            {["Rooms & Suites", "My Reservation", "Amenities"].map((link) => (
              <p key={link} style={{ fontSize: "0.84rem", color: "rgba(255,255,255,0.5)", marginBottom: "0.5rem", cursor: "pointer", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.85)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
              >
                {link}
              </p>
            ))}
          </div>

          {/* Location */}
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
              Location
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                <p style={{ marginBottom: "0.5rem" }}>14 Babatunde Famori St</p>
                <p style={{ marginBottom: "0.5rem" }}>Isheri Oshun</p>
                <p>Lagos 102213, Nigeria</p>
              </div>
              <a
                href="https://maps.google.com/?q=14+Babatunde+Famori+St+Isheri+Oshun+Lagos+Nigeria"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.78rem",
                  color: "#c3953d",
                  textDecoration: "none",
                  marginTop: "0.5rem",
                  cursor: "pointer",
                  transition: "color 0.2s"
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#d2a45a")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#c3953d")}
              >
                View on Map
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: "1rem" }}>
              Contact
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
              <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>+234 704 855 2956</div>
              <a
                href="mailto:stay@femlisterlodge.com"
                style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
              >
                stay@femlisterlodge.com
              </a>
            </div>
          </div>
        </div>

        <hr className="footer-divider" />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
          <p className="footer-copy">
            © {year} Femlister Lodge. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            {["Privacy Policy", "Terms of Stay"].map((item) => (
              <span key={item} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
