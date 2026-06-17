export default function MapSection() {
  return (
    <section id="site-map" className="location-section" style={{ padding: '2.5rem 0' }}>
      <div className="container">
        <h2 style={{ marginBottom: '0.5rem' }}>Our Location</h2>
        <p className="location-address" style={{ marginTop: 0 }}>Isheri Oshun, Lagos · Nigeria</p>
        <div className="map-container" style={{ marginTop: '1rem' }}>
          <iframe
  src="https://maps.google.com/maps?q=14%20babatunde%20famori%20street%20nigeria%20lagos&t=m&z=11&ie=UTF8&iwloc=B&output=embed"
  width="100%"
  height="500"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
/>

        </div>
      </div>
    </section>
  );
}
