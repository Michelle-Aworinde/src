import type { AppView } from "../App";
import ImageCarousel from "./ImageCarousel";

interface Props {}

const highlightedAmenities = [
  { title: "Premium Bedding", desc: "Comfortable beds with quality linens" },
  { title: "Air Conditioning", desc: "Climate control in every room" },
  { title: "Luxury Bathrooms", desc: "Modern facilities with premium toiletries" },
  { title: "Smart TV", desc: "Entertainment with streaming services" },
  { title: "Bar", desc: "great vibes, cold drinks,a place to relax, celebrate, and connect" },
  { title: "24 Hour Electricity", desc: "24 hour power!" },
  { title: "24 Hour Front Desk", desc: "Our staff are here for you round the clock" },
  { title: "24 Hour Check in Check out", desc: "Check out anytime" },
  { title: "Non-Smoking", desc: "We do not permit smoking indoors" },
  { title: "No Deposit Required", desc: "Full payment on arrival" },
  { title: "24 Hour Security and CCTV", desc: "Your safety is Paramount" },
  { title: "Multilingual Staff", desc: "English, Italian, Yoruba" },
];

export default function AmenitiesSection(_: Props) {
  return (
    <section className="amenities-section">
      <div className="container">
        <div className="amenities-section-header">
          <h2>Why Choose Femlister Lodge</h2>
          <p>Premium amenities designed for your comfort</p>
        </div>

        <div className="amenities-preview-grid">
          {highlightedAmenities.map((amenity, idx) => (
            <div key={idx} className="amenity-preview-card">
              <div className="amenity-preview-icon" aria-hidden />
              <h4>{amenity.title}</h4>
              <p>{amenity.desc}</p>
            </div>
          ))}
        </div>

        <div className="amenities-cta">
          <button
            className="btn-primary"
            onClick={() => document.getElementById('site-map')?.scrollIntoView({ behavior: 'smooth' })}
          >
            View Location & Map
          </button>
        </div>

        {/* Photo carousel at bottom of amenities */}
        <ImageCarousel images={["/images/bar.jpeg", "/images/hallway.jpeg", "/images/hallway-2.jpeg", "/images/reception.jpeg"]} autoPlayMs={4500} />
      </div>
    </section>
  );
}
