import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const portRaw = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !portRaw || !user || !pass) {
    const missing = [
      !host ? "SMTP_HOST" : null,
      !portRaw ? "SMTP_PORT" : null,
      !user ? "SMTP_USER" : null,
      !pass ? "SMTP_PASS" : null,
    ].filter(Boolean);
    console.warn(`[mailer] SMTP config incomplete, skip sending. Missing: ${missing.join(", ")}`);
    return null;
  }

  const port = Number(portRaw);
  const secure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  if (!Number.isFinite(port)) {
    console.warn(`[mailer] SMTP_PORT is not a number (${portRaw}), skip sending.`);
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
};

export const sendSelectionResultEmail = async (payload: {
  to: string;
  nama?: string | null;
  status: "DITERIMA" | "DITOLAK";
  nomorPendaftaran: string;
  prodi: string;
}) => {
  const transporter = getTransporter();
  if (!transporter) {
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const appUrl = process.env.APP_PUBLIC_URL || "";

  if (!from) {
    console.warn("[mailer] SMTP_FROM/SMTP_USER empty, skip sending.");
    return;
  }

  const greetingName = payload.nama ? payload.nama : payload.to;
  const subject =
    payload.status === "DITERIMA"
      ? "Hasil Seleksi SNBP: LULUS"
      : "Hasil Seleksi SNBP: TIDAK LULUS";

  const statusText = payload.status === "DITERIMA" ? "LULUS" : "TIDAK LULUS";

  const cekLink = appUrl ? `${appUrl}/cek-pengumuman-standalone` : "";

  const textLines = [
    `Halo ${greetingName},`,
    "",
    "Hasil seleksi SNBP Anda telah tersedia.",
    `Status: ${statusText}`,
    `Nomor Pendaftaran: ${payload.nomorPendaftaran}`,
    `Program Studi: ${payload.prodi}`,
  ];

  if (cekLink) {
    textLines.push("", `Cek juga melalui web: ${cekLink}`);
  }

  const text = textLines.join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <p>Halo <strong>${greetingName}</strong>,</p>
      <p>Hasil seleksi SNBP Anda telah tersedia.</p>
      <p>
        <strong>Status:</strong> ${statusText}<br/>
        <strong>Nomor Pendaftaran:</strong> ${payload.nomorPendaftaran}<br/>
        <strong>Program Studi:</strong> ${payload.prodi}
      </p>
      ${cekLink ? `<p>Cek juga melalui web: <a href="${cekLink}">${cekLink}</a></p>` : ""}
    </div>
  `;

  console.log(
    `[mailer] Sending selection email to=${payload.to} status=${payload.status} nomor=${payload.nomorPendaftaran}`
  );

  const info = await transporter.sendMail({
    from,
    to: payload.to,
    subject,
    text,
    html,
  });

  console.log(`[mailer] Email sent. messageId=${info.messageId || "(no-id)"}`);
};
