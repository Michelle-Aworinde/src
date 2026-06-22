const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || "";
const BREVO_SENDER_EMAIL =
  import.meta.env.VITE_BREVO_SENDER_EMAIL || "stay@femlisterlodge.com";
const BREVO_SENDER_NAME =
  import.meta.env.VITE_BREVO_SENDER_NAME || "Femlister Lodge";
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || BREVO_SENDER_EMAIL;
const BRAND_LOGO =
  import.meta.env.VITE_EMAIL_LOGO_URL ||
  "https://femlisterlodge.com/images/logo.jpg";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function isBrevoConfigured() {
  return Boolean(BREVO_API_KEY && BREVO_SENDER_EMAIL);
}

async function sendBrevoEmail(to: string, subject: string, html: string) {
  if (!isBrevoConfigured()) {
    console.warn(
      "Brevo is not configured. Please set VITE_BREVO_API_KEY and VITE_BREVO_SENDER_EMAIL."
    );
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

function buildEmailShell(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:24px;">
      <div style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
        <div style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:32px 24px;text-align:center;">
          <img src="${escapeHtml(BRAND_LOGO)}" alt="Femlister Lodge" style="max-height:60px;object-fit:contain;margin-bottom:20px;border-radius:12px;" />
          <h1 style="margin:0;color:#f8fafc;font-size:28px;font-weight:700;letter-spacing:0.03em;line-height:1.1;">${escapeHtml(title)}</h1>
        </div>
        <div style="padding:32px 30px;color:#0f172a;">
          ${bodyHtml}
        </div>
        <div style="background:#f8fafc;padding:20px 30px;color:#475569;font-size:13px;line-height:1.6;">
          <p style="margin:0;">If you have any questions, just reply to this email or visit our website.</p>
          <p style="margin:12px 0 0 0;font-size:12px;color:#94a3b8;">Femlister Lodge · Quality stays, warm hospitality.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}

function buildBookingDetailsSection(booking: any) {
  return `
    <table style="width:100%;border-collapse:collapse;margin-top:24px;">
      <tbody>
        ${[
          ["Reference", booking.id],
          ["Room", booking.roomName],
          ["Check-in", booking.checkIn],
          ["Check-out", booking.checkOut],
          ["Guests", booking.guests],
          ["Total", `₦${Number(booking.totalPrice || 0).toLocaleString()}`],
        ]
          .map(
            ([label, value]) => `
            <tr>
              <td style="padding:10px 0;color:#64748b;width:38%;font-size:14px;vertical-align:top;font-weight:600;">${escapeHtml(label)}</td>
              <td style="padding:10px 0;color:#0f172a;font-size:14px;vertical-align:top;">${escapeHtml(value)}</td>
            </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function buildGuestEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim();
  return buildEmailShell(
    "Reservation Confirmed",
    `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#334155;">Hi <strong>${escapeHtml(guestName || "Guest")}</strong>,</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#475569;">Your booking at <strong>Femlister Lodge</strong> is confirmed. We look forward to welcoming you and making your stay comfortable.</p>
      ${buildBookingDetailsSection(booking)}
      <p style="margin:28px 0 0 0;font-size:15px;line-height:1.8;color:#334155;">If you need to change anything, please contact us before arrival.</p>
    `
  );
}

function buildAdminEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim();
  return buildEmailShell(
    "New Booking Received",
    `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#334155;">A new reservation has been made at Femlister Lodge.</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#475569;">Guest: <strong>${escapeHtml(guestName || "Guest")}</strong><br />Email: <strong>${escapeHtml(booking.customer?.email || "")}</strong></p>
      ${buildBookingDetailsSection(booking)}
    `
  );
}

function buildCancellationEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim();
  return buildEmailShell(
    "Reservation Cancelled",
    `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#334155;">Hi <strong>${escapeHtml(guestName || "Guest")}</strong>,</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#475569;">Your reservation has been cancelled. We hope to welcome you another time.</p>
      ${buildBookingDetailsSection(booking)}
    `
  );
}

function buildCheckInEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim();
  return buildEmailShell(
    "Checked In Successfully",
    `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#334155;">Hi <strong>${escapeHtml(guestName || "Guest")}</strong>,</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#475569;">Your reservation is now marked as checked-in. Enjoy your stay at Femlister Lodge.</p>
      ${buildBookingDetailsSection(booking)}
    `
  );
}

function buildAmendmentEmailHtml(booking: any) {
  const guestName = `${booking.customer?.firstName || ""} ${booking.customer?.lastName || ""}`.trim();
  return buildEmailShell(
    "Reservation Updated",
    `
      <p style="margin:0 0 18px;font-size:16px;line-height:1.75;color:#334155;">Hi <strong>${escapeHtml(guestName || "Guest")}</strong>,</p>
      <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#475569;">Your reservation details have been updated successfully.</p>
      ${buildBookingDetailsSection(booking)}
    `
  );
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

  const adminResult = ADMIN_EMAIL
    ? await sendBrevoEmail(
        ADMIN_EMAIL,
        `New booking received (${booking.id || "booking"})`,
        buildAdminEmailHtml(booking)
      )
    : false;

  return { guest: guestResult, admin: adminResult };
}

export async function sendBookingStatusEmail(
  booking: any,
  type: "amendment" | "checked-in" | "cancelled"
) {
  if (!isBrevoConfigured()) {
    console.info(
      "Brevo is not configured; skipping status update emails. Set VITE_BREVO_API_KEY and VITE_BREVO_SENDER_EMAIL to enable notifications."
    );
    return false;
  }

  const guestEmail = booking.customer?.email;
  if (!guestEmail) return false;

  const subjectMap = {
    amendment: `Reservation updated (${booking.id || "booking"})`,
    "checked-in": `Checked in successfully (${booking.id || "booking"})`,
    cancelled: `Reservation cancelled (${booking.id || "booking"})`,
  } as const;

  const htmlMap = {
    amendment: buildAmendmentEmailHtml(booking),
    "checked-in": buildCheckInEmailHtml(booking),
    cancelled: buildCancellationEmailHtml(booking),
  } as const;

  return sendBrevoEmail(guestEmail, subjectMap[type], htmlMap[type]);
}
