const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL =
  import.meta.env.VITE_BREVO_SENDER_EMAIL || "stay@femlisterlodge.com";
const BREVO_SENDER_NAME =
  import.meta.env.VITE_BREVO_SENDER_NAME || "Femlister Lodge";

export function isBrevoConfigured() {
  return Boolean(BREVO_API_KEY && BREVO_SENDER_EMAIL);
}

async function sendBrevoEmail(to: string, subject: string, html: string) {
  if (!isBrevoConfigured()) {
    return false;
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Brevo request failed: ${response.status} ${text}`);
    }

    return true;
  } catch (error) {
    console.warn("Brevo send failed.", error);
    return false;
  }
}

function buildGuestEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${
    booking.customer?.lastName || ""
  }`.trim();
  const total = Number(booking.totalPrice || 0);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #2f2a1f;">Reservation Confirmed</h2>
      <p>Hi ${guestName || "Guest"},</p>
      <p>Your booking at Femlister Lodge has been confirmed.</p>
      <ul>
        <li><strong>Reference:</strong> ${booking.id || ""}</li>
        <li><strong>Room:</strong> ${booking.roomName || ""}</li>
        <li><strong>Check-in:</strong> ${booking.checkIn || ""}</li>
        <li><strong>Check-out:</strong> ${booking.checkOut || ""}</li>
        <li><strong>Guests:</strong> ${booking.guests || 1}</li>
        <li><strong>Total:</strong> ₦${total}</li>
      </ul>
      <p>Thank you for choosing Femlister Lodge.</p>
    </div>
  `;
}

function buildAdminEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${
    booking.customer?.lastName || ""
  }`.trim();
  const total = Number(booking.totalPrice || 0);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto;">
      <h2 style="color: #2f2a1f;">New Booking Received</h2>
      <p>A new booking was created.</p>
      <ul>
        <li><strong>Reference:</strong> ${booking.id || ""}</li>
        <li><strong>Guest:</strong> ${guestName || "Guest"}</li>
        <li><strong>Email:</strong> ${booking.customer?.email || ""}</li>
        <li><strong>Room:</strong> ${booking.roomName || ""}</li>
        <li><strong>Check-in:</strong> ${booking.checkIn || ""}</li>
        <li><strong>Check-out:</strong> ${booking.checkOut || ""}</li>
        <li><strong>Total:</strong> ₦${total}</li>
      </ul>
    </div>
  `;
}

export async function sendBookingNotifications(booking: any) {
  if (!isBrevoConfigured()) {
    console.info(
      "Brevo is not configured; skipping booking emails. Set VITE_BREVO_API_KEY and VITE_BREVO_SENDER_EMAIL to enable notifications."
    );
    return { guest: false, admin: false };
  }

  const guestEmail = booking.customer?.email;
  const guestResult = guestEmail
    ? await sendBrevoEmail(
        guestEmail,
        `Reservation confirmed (${booking.id || "booking"})`,
        buildGuestEmailHtml(booking)
      )
    : false;

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || BREVO_SENDER_EMAIL;
  const adminResult = adminEmail
    ? await sendBrevoEmail(
        adminEmail,
        `New booking received (${booking.id || "booking"})`,
        buildAdminEmailHtml(booking)
      )
    : false;

  return { guest: guestResult, admin: adminResult };
}
