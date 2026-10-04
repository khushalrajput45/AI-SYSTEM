import nodemailer from 'nodemailer';
import { ENV } from '../config/env.js';

let transporter = null;

if (ENV.SMTP_USER && ENV.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: ENV.SMTP_HOST,
    port: Number(ENV.SMTP_PORT),
    secure: Number(ENV.SMTP_PORT) === 465,
    auth: {
      user: ENV.SMTP_USER,
      pass: ENV.SMTP_PASS,
    },
  });
}

export async function sendEmail({ to, subject, html, text }) {
  if (!to) return;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: `"SmartCampus System" <${ENV.EMAIL_FROM}>`,
        to,
        subject,
        text,
        html,
      });
      console.log(`📧 [Email Sent]: ${info.messageId} to ${to}`);
      return info;
    } catch (err) {
      console.error(`❌ [Email Delivery Error]: ${err.message}`);
    }
  } else {
    // Development console log preview
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL NOTIFICATION PREVIEW]`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body:\n${text || html}`);
    console.log(`======================================================\n`);
  }
}
