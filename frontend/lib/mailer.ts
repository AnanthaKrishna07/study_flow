// lib/mailer.ts
import nodemailer from "nodemailer";

/**
 * Nodemailer transporter configuration
 * Uses environment variables defined in `.env.local`
 */
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com", // default Gmail SMTP
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for port 465, false otherwise
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Verify transporter connection on startup (optional but recommended)
 */
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Mail transporter error:", error);
  } else {
    console.log("✅ Mail transporter ready to send messages");
  }
});

/**
 * Send an email reminder
 * @param to Recipient email
 * @param subject Email subject
 * @param text Plain text body
 * @param html Optional HTML body
 */
export async function sendReminderMail(
  to: string,
  subject: string,
  text: string,
  html?: string
) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("❌ Missing email environment variables in .env.local");
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"StudyFlow" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`,
    });

    console.log("📧 Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

// Default export for convenience
export default sendReminderMail;
