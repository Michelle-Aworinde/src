import { useState, useEffect } from "react";
import { createBooking } from "../lib/firebase";
import type { Room, CustomerForm } from "../types";

interface Props {
  room: Room;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

const AREA_CODES = [
  { code: "+1", label: "+1 USA/Canada & NANP region" },
  { code: "+7", label: "+7 Russia/Kazakhstan" },
  { code: "+20", label: "+20 Egypt" },
  { code: "+27", label: "+27 South Africa" },
  { code: "+30", label: "+30 Greece" },
  { code: "+31", label: "+31 Netherlands" },
  { code: "+32", label: "+32 Belgium" },
  { code: "+33", label: "+33 France" },
  { code: "+34", label: "+34 Spain" },
  { code: "+36", label: "+36 Hungary" },
  { code: "+39", label: "+39 Italy" },
  { code: "+40", label: "+40 Romania" },
  { code: "+41", label: "+41 Switzerland" },
  { code: "+43", label: "+43 Austria" },
  { code: "+44", label: "+44 United Kingdom" },
  { code: "+45", label: "+45 Denmark" },
  { code: "+46", label: "+46 Sweden" },
  { code: "+47", label: "+47 Norway" },
  { code: "+48", label: "+48 Poland" },
  { code: "+49", label: "+49 Germany" },
  { code: "+51", label: "+51 Peru" },
  { code: "+52", label: "+52 Mexico" },
  { code: "+53", label: "+53 Cuba" },
  { code: "+54", label: "+54 Argentina" },
  { code: "+55", label: "+55 Brazil" },
  { code: "+56", label: "+56 Chile" },
  { code: "+57", label: "+57 Colombia" },
  { code: "+58", label: "+58 Venezuela" },
  { code: "+60", label: "+60 Malaysia" },
  { code: "+61", label: "+61 Australia" },
  { code: "+62", label: "+62 Indonesia" },
  { code: "+63", label: "+63 Philippines" },
  { code: "+64", label: "+64 New Zealand" },
  { code: "+65", label: "+65 Singapore" },
  { code: "+66", label: "+66 Thailand" },
  { code: "+81", label: "+81 Japan" },
  { code: "+82", label: "+82 South Korea" },
  { code: "+84", label: "+84 Vietnam" },
  { code: "+86", label: "+86 China" },
  { code: "+90", label: "+90 Türkiye" },
  { code: "+91", label: "+91 India" },
  { code: "+92", label: "+92 Pakistan" },
  { code: "+93", label: "+93 Afghanistan" },
  { code: "+94", label: "+94 Sri Lanka" },
  { code: "+95", label: "+95 Myanmar" },
  { code: "+98", label: "+98 Iran" },
  { code: "+211", label: "+211 South Sudan" },
  { code: "+212", label: "+212 Morocco" },
  { code: "+213", label: "+213 Algeria" },
  { code: "+216", label: "+216 Tunisia" },
  { code: "+218", label: "+218 Libya" },
  { code: "+220", label: "+220 Gambia" },
  { code: "+221", label: "+221 Senegal" },
  { code: "+222", label: "+222 Mauritania" },
  { code: "+223", label: "+223 Mali" },
  { code: "+224", label: "+224 Guinea" },
  { code: "+225", label: "+225 Côte d’Ivoire" },
  { code: "+226", label: "+226 Burkina Faso" },
  { code: "+227", label: "+227 Niger" },
  { code: "+228", label: "+228 Togo" },
  { code: "+229", label: "+229 Benin" },
  { code: "+230", label: "+230 Mauritius" },
  { code: "+231", label: "+231 Liberia" },
  { code: "+232", label: "+232 Sierra Leone" },
  { code: "+233", label: "+233 Ghana" },
  { code: "+234", label: "+234 Nigeria" },
  { code: "+235", label: "+235 Chad" },
  { code: "+236", label: "+236 Central African Republic" },
  { code: "+597", label: "🇸🇷 +597 Suriname" },
  { code: "+598", label: "🇺🇾 +598 Uruguay" },
  { code: "+599", label: "🇨🇼 +599 Curaçao" },
  { code: "+670", label: "🇹🇱 +670 Timor-Leste" },
  { code: "+672", label: "🇦🇶 +672 Antarctica" },
  { code: "+673", label: "🇧🇳 +673 Brunei" },
  { code: "+674", label: "🇳🇷 +674 Nauru" },
  { code: "+675", label: "🇵🇬 +675 Papua New Guinea" },
  { code: "+676", label: "🇹🇴 +676 Tonga" },
  { code: "+677", label: "🇸🇧 +677 Solomon Islands" },
  { code: "+678", label: "🇻🇺 +678 Vanuatu" },
  { code: "+679", label: "🇫🇯 +679 Fiji" },
  { code: "+680", label: "🇵🇼 +680 Palau" },
  { code: "+681", label: "🇼🇫 +681 Wallis & Futuna" },
  { code: "+682", label: "🇨🇰 +682 Cook Islands" },
  { code: "+683", label: "🇳🇺 +683 Niue" },
  { code: "+685", label: "🇼🇸 +685 Samoa" },
  { code: "+686", label: "🇰🇮 +686 Kiribati" },
  { code: "+687", label: "🇳🇨 +687 New Caledonia" },
  { code: "+688", label: "🇹🇻 +688 Tuvalu" },
  { code: "+689", label: "🇵🇫 +689 French Polynesia" },
  { code: "+690", label: "🇹🇰 +690 Tokelau" },
  { code: "+691", label: "🇫🇲 +691 Micronesia" },
  { code: "+692", label: "🇲🇭 +692 Marshall Islands" },
  { code: "+800", label: "🌐 +800 International Freephone" },
  { code: "+808", label: "🌐 +808 Shared Cost Services" },
  { code: "+870", label: "🛰️ +870 Inmarsat" },
  { code: "+878", label: "🌐 +878 Universal Personal Telecommunications" },
  { code: "+881", label: "🛰️ +881 Global Mobile Satellite System" },
  { code: "+882", label: "🌐 +882 International Networks" },
  { code: "+883", label: "🌐 +883 International Networks" },
  { code: "+850", label: "🇰🇵 +850 North Korea" },
  { code: "+852", label: "🇭🇰 +852 Hong Kong" },
  { code: "+853", label: "🇲🇴 +853 Macau" },
  { code: "+855", label: "🇰🇭 +855 Cambodia" },
  { code: "+856", label: "🇱🇦 +856 Laos" },
  { code: "+880", label: "🇧🇩 +880 Bangladesh" },
  { code: "+886", label: "🇹🇼 +886 Taiwan" },
  { code: "+964", label: "🇮🇶 +964 Iraq" },
  { code: "+965", label: "🇰🇼 +965 Kuwait" },
  { code: "+966", label: "🇸🇦 +966 Saudi Arabia" },
  { code: "+967", label: "🇾🇪 +967 Yemen" },
  { code: "+968", label: "🇴🇲 +968 Oman" },
  { code: "+970", label: "🇵🇸 +970 Palestine" },
  { code: "+971", label: "🇦🇪 +971 UAE" },
  { code: "+972", label: "🇮🇱 +972 Israel" },
  { code: "+973", label: "🇧🇭 +973 Bahrain" },
  { code: "+974", label: "🇶🇦 +974 Qatar" },
  { code: "+975", label: "🇧🇹 +975 Bhutan" },
  { code: "+976", label: "🇲🇳 +976 Mongolia" },
  { code: "+977", label: "🇳🇵 +977 Nepal" },
  { code: "+992", label: "🇹🇯 +992 Tajikistan" },
  { code: "+993", label: "🇹🇲 +993 Turkmenistan" },
  { code: "+994", label: "🇦🇿 +994 Azerbaijan" },
  { code: "+995", label: "🇬🇪 +995 Georgia" },
  { code: "+996", label: "🇰🇬 +996 Kyrgyzstan" },
  { code: "+998", label: "🇺🇿 +998 Uzbekistan" },
];

const STEP_LABELS = ["Dates", "Guest Info", "Identity", "Confirm"];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function maxDateStr() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString().split("T")[0];
}

function calcNights(ci: string, co: string) {
  if (!ci || !co) return 0;
  return Math.max(0, Math.ceil((new Date(co).getTime() - new Date(ci).getTime()) / 86_400_000));
}

function minCheckOut(ci: string) {
  if (!ci) return todayStr();
  const d = new Date(ci);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

export default function BookingModal({ room, onClose }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);

  const [customer, setCustomer] = useState<CustomerForm>({
    firstName: "", lastName: "", email: "",
    phoneAreaCode: "+234", phone: "",
    idType: "passport", passportNumber: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState<{
    id: string;
    nights: number;
    totalPrice: number;
    payRef?: string;
    live?: boolean;
    payAtHotel?: boolean;
  } | null>(null);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const nights = calcNights(checkIn, checkOut);
  const totalPrice = nights * room.pricePerNight;

  function setField(key: keyof CustomerForm, value: string) {
    setCustomer((c) => ({ ...c, [key]: value }));
    setError("");
  }

  function validateStep(): string | null {
    if (step === 1) {
      if (!checkIn) return "Please select a check-in date.";
      if (!checkOut) return "Please select a check-out date.";
      if (checkOut <= checkIn) return "Check-out must be after check-in.";
      if (nights < 1) return "Minimum stay is 1 night.";
    }
    if (step === 2) {
      if (!customer.firstName.trim() || customer.firstName.trim().length < 3) return "First name must be at least 3 characters.";
      if (!customer.lastName.trim() || customer.lastName.trim().length < 3) return "Last name must be at least 3 characters.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) return "Please enter a valid email address.";
      const cleanPhone = customer.phone.replace(/[\s()\-]/g, "");
      if (!cleanPhone || !/^\d+$/.test(cleanPhone)) return "Please enter a valid phone number.";
    }
    if (step === 3) {
      if (!customer.passportNumber.trim()) return "Please enter your identity document number.";
      if (customer.idType === "passport" && !/^[a-zA-Z0-9]{6,12}$/.test(customer.passportNumber.trim()))
        return "Passport number must be 6–12 alphanumeric characters.";
      if (customer.idType === "nin" && !/^\d{11}$/.test(customer.passportNumber.trim()))
        return "NIN must be exactly 11 digits.";
    }
    return null;
  }

  function advance() {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError("");
    if (step < 4) setStep((s) => (s + 1) as Step);
  }

  async function submitBooking() {
    setLoading(true);
    setError("");
    try {
      const data = await createBooking({
        roomId: room.id,
        checkIn,
        checkOut,
        guests,
        customer,
      });

      setConfirmed({
        id: data.id,
        nights: data.nights || nights,
        totalPrice: data.totalPrice,
        payRef: data.id,
        live: false,
        payAtHotel: data.payAtHotel || false,
      } as any);
    } catch (err: any) {
      setError(err.message || "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Confirmed screen
  if (confirmed) {
    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
            <div className="confirm-icon">Confirmed</div>
            <p style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.5rem" }}>
              Reservation Confirmed
            </p>
            <div className="confirm-ref">{confirmed.id}</div>
            <p className="confirm-sub" style={{ marginBottom: "2rem" }}>
              Save this reference — you'll need it to manage your booking.
            </p>

            <div style={{ background: "var(--cream)", padding: "1.25rem", marginBottom: "1.5rem", textAlign: "left" }}>
              {[
                ["Room", room.name],
                ["Check-in", checkIn],
                ["Check-out", checkOut],
                ["Nights", confirmed.nights],
                ["Guests", guests],
                ["Guest Name", `${customer.firstName} ${customer.lastName}`],
              ].map(([k, v]) => (
                <div className="summary-row" key={String(k)}>
                  <span className="summary-key">{k}</span>
                  <span className="summary-val">{v}</span>
                </div>
              ))}
              <div className="summary-row">
                <span className="summary-key">Total</span>
                <span className="summary-val summary-total">₦{confirmed.totalPrice}</span>
              </div>
            </div>

            {confirmed.payAtHotel ? (
              <div className="payment-instructions" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                <strong style={{ fontSize: "0.78rem", color: "var(--gold)" }}>Payment</strong>
                <p style={{ fontSize: "0.82rem", color: "var(--text)", marginTop: "0.35rem" }}>
                  Please pay at the hotel on arrival. We accept cash and card. Reference: <strong>{confirmed.payRef}</strong>
                </p>
              </div>
            ) : (!confirmed.live && (
              <div className="sandbox-notice" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                <strong style={{ fontSize: "0.78rem", color: "var(--gold)" }}>Payment Gateway · Test Mode</strong>
                <p style={{ fontSize: "0.82rem", color: "var(--text)", marginTop: "0.35rem" }}>
                  Moniepoint is running in sandbox mode. In production, you will be redirected
                  to a live payment page. Reference: <strong>{confirmed.payRef}</strong>
                </p>
              </div>
            ))}

            <button className="btn-primary" onClick={onClose} style={{ width: "100%" }}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--gold)", marginBottom: "0.3rem" }}>
              {room.name}
            </p>
            <StepBar current={step} />
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {error && <div className="msg-error">{error}</div>}

          {step === 1 && (
            <Step1
              checkIn={checkIn} setCheckIn={setCheckIn}
              checkOut={checkOut} setCheckOut={setCheckOut}
              guests={guests} setGuests={setGuests}
              maxCapacity={room.capacity}
              nights={nights} pricePerNight={room.pricePerNight}
            />
          )}
          {step === 2 && (
            <Step2 customer={customer} setField={setField} />
          )}
          {step === 3 && (
            <Step3 customer={customer} setField={setField} />
          )}
          {step === 4 && (
            <Step4
              room={room} checkIn={checkIn} checkOut={checkOut}
              guests={guests} nights={nights} totalPrice={totalPrice}
              customer={customer}
            />
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {step > 1 ? (
            <button className="btn-outline" onClick={() => { setStep((s) => (s - 1) as Step); setError(""); }}>
              Back
            </button>
          ) : (
            <span />
          )}

          {step < 4 ? (
            <button className="btn-primary" onClick={advance}>
              Continue
            </button>
          ) : (
            <button className="btn-primary" onClick={submitBooking} disabled={loading}>
              {loading ? <><span className="spinner" /> Processing…</> : "Confirm & Book"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepBar({ current }: { current: number }) {
  return (
    <div className="step-bar" style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
      {STEP_LABELS.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div className={`step-item ${active ? "active" : done ? "done" : ""}`}>
              <div className="step-num">{done ? "Done" : num}</div>
              <span className="step-label">{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && <div className="step-sep" />}
          </div>
        );
      })}
    </div>
  );
}

function Step1({ checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests, maxCapacity, nights, pricePerNight }: {
  checkIn: string; setCheckIn: (v: string) => void;
  checkOut: string; setCheckOut: (v: string) => void;
  guests: number; setGuests: (v: number) => void;
  maxCapacity: number; nights: number; pricePerNight: number;
}) {
  return (
    <div>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Select Your Dates
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="field-group">
          <label className="field-label">Check-in</label>
          <input
            type="date" className="field-input"
            min={todayStr()} max={maxDateStr()}
            value={checkIn}
            onChange={(e) => { setCheckIn(e.target.value); }}
          />
        </div>
        <div className="field-group">
          <label className="field-label">Check-out</label>
          <input
            type="date" className="field-input"
            min={checkIn ? minCheckOut(checkIn) : todayStr()}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Guests (max {maxCapacity})</label>
        <select
          className="field-input"
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        >
          {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
          ))}
        </select>
      </div>

      {nights > 0 && (
        <div style={{ background: "var(--cream)", padding: "1.25rem", borderTop: "3px solid var(--gold)" }}>
          <div className="summary-row">
            <span className="summary-key">₦{pricePerNight} × {nights} night{nights > 1 ? "s" : ""}</span>
            <span className="summary-val">₦{pricePerNight * nights}</span>
          </div>
          <div className="summary-row" style={{ borderBottom: "none" }}>
            <span className="summary-key" style={{ fontWeight: 600, color: "var(--dark)" }}>Total</span>
            <span className="summary-val summary-total">₦{pricePerNight * nights}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Step2({ customer, setField }: { customer: CustomerForm; setField: (k: keyof CustomerForm, v: string) => void }) {
  return (
    <div>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Guest Information
      </h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <div className="field-group">
          <label className="field-label">First Name</label>
          <input className="field-input" placeholder="e.g. Chinedu" value={customer.firstName} onChange={(e) => setField("firstName", e.target.value)} />
        </div>
        <div className="field-group">
          <label className="field-label">Last Name</label>
          <input className="field-input" placeholder="e.g. Abubakar" value={customer.lastName} onChange={(e) => setField("lastName", e.target.value)} />
        </div>
      </div>
      <div className="field-group">
        <label className="field-label">Email Address</label>
        <input type="email" className="field-input" placeholder="name@example.com" value={customer.email} onChange={(e) => setField("email", e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem", alignItems: "end" }}>
        <div className="field-group">
          <label className="field-label">Country Code</label>
          <select className="field-input" value={customer.phoneAreaCode} onChange={(e) => setField("phoneAreaCode", e.target.value)} style={{ minWidth: "175px" }}>
            {AREA_CODES.map(({ code, label }) => (
              <option key={code} value={code}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label className="field-label">Phone Number</label>
          <input type="tel" className="field-input" placeholder="08012345678" value={customer.phone} onChange={(e) => setField("phone", e.target.value)} />
        </div>
      </div>
      <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "-0.5rem" }}>
        Enter the subscriber number only (no country code prefix).
      </p>
    </div>
  );
}

function Step3({ customer, setField }: { customer: CustomerForm; setField: (k: keyof CustomerForm, v: string) => void }) {
  return (
    <div>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", marginBottom: "0.5rem" }}>
        Identity Verification
      </h3>
      <p style={{ fontSize: "0.87rem", color: "var(--muted)", marginBottom: "1.75rem" }}>
        Required for all guests. Your details are encrypted at rest using AES-256-CBC.
      </p>
      <div className="field-group">
        <label className="field-label">Document Type</label>
        <select className="field-input" value={customer.idType} onChange={(e) => { setField("idType", e.target.value as any); setField("passportNumber", ""); }}>
          <option value="passport">International Passport</option>
          <option value="nin">Nigerian NIN (11 digits)</option>
        </select>
      </div>
      <div className="field-group">
        <label className="field-label">
          {customer.idType === "passport" ? "Passport Number" : "NIN"}
        </label>
        <input
          className="field-input"
          placeholder={customer.idType === "passport" ? "e.g. A12345678" : "12345678901"}
          value={customer.passportNumber}
          onChange={(e) => setField("passportNumber", e.target.value.toUpperCase())}
          maxLength={customer.idType === "nin" ? 11 : 12}
        />
        <p style={{ fontSize: "0.73rem", color: "var(--muted)", marginTop: "0.35rem" }}>
          {customer.idType === "passport"
            ? "6–12 alphanumeric characters as shown on your passport."
            : "Exactly 11 numeric digits as shown on your NIN slip or NIMC card."}
        </p>
      </div>
      <div className="msg-info" style={{ marginTop: "1rem" }}>
        <strong style={{ fontSize: "0.75rem" }}>🔒 Data Security</strong>
        <p style={{ fontSize: "0.82rem", marginTop: "0.25rem" }}>
          Identity details are AES-256 encrypted before storage. They are never stored in plain text and are only accessible to lodge administrators.
        </p>
      </div>
    </div>
  );
}

function Step4({ room, checkIn, checkOut, guests, nights, totalPrice, customer }: {
  room: Room; checkIn: string; checkOut: string; guests: number;
  nights: number; totalPrice: number; customer: CustomerForm;
}) {
  return (
    <div>
      <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.5rem", marginBottom: "1.5rem" }}>
        Review & Confirm
      </h3>

      <div style={{ background: "var(--cream)", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>Reservation Details</p>
        {[
          ["Room", room.name],
          ["Check-in", checkIn],
          ["Check-out", checkOut],
          ["Duration", `${nights} night${nights !== 1 ? "s" : ""}`],
          ["Guests", `${guests} guest${guests !== 1 ? "s" : ""}`],
        ].map(([k, v]) => (
          <div className="summary-row" key={String(k)}>
            <span className="summary-key">{k}</span>
            <span className="summary-val">{v}</span>
          </div>
        ))}
      </div>

      <div style={{ background: "var(--cream)", padding: "1.25rem", marginBottom: "1.5rem" }}>
        <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)", marginBottom: "0.75rem" }}>Guest Details</p>
        {[
          ["Name", `${customer.firstName} ${customer.lastName}`],
          ["Email", customer.email],
          ["Phone", `${customer.phoneAreaCode} ${customer.phone}`],
          ["ID", `${customer.idType.toUpperCase()}: ${customer.passportNumber}`],
        ].map(([k, v]) => (
          <div className="summary-row" key={String(k)}>
            <span className="summary-key">{k}</span>
            <span className="summary-val">{v}</span>
          </div>
        ))}
      </div>

      <div style={{ borderTop: "3px solid var(--gold)", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Total due</span>
        <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 600, color: "var(--dark)" }}>
          ₦{totalPrice}
          <span style={{ fontSize: "0.85rem", fontFamily: "DM Sans, sans-serif", color: "var(--muted)", marginLeft: "0.35rem" }}>
            ≈ ${(totalPrice / 1500).toLocaleString()}
          </span>
        </span>
      </div>

      <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "1rem", lineHeight: 1.6 }}>
        By confirming, your booking will be created. Please pay at the hotel on arrival — we accept cash and card. Your booking reference will be issued immediately.
      </p>
    </div>
  );
}
