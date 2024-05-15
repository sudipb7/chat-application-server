import nodemailer from "nodemailer";

import { NODEMAILER_EMAIL, NODEMAILER_PASSWORD, NODEMAILER_SERVICE, CLIENT_URL } from "../config";

const transporter = nodemailer.createTransport({
  service: NODEMAILER_SERVICE,
  auth: {
    user: NODEMAILER_EMAIL,
    pass: NODEMAILER_PASSWORD,
  },
});

export const sendEmailVerificationMail = async (email: string, token: string) => {
  const response = await transporter.sendMail({
    from: NODEMAILER_EMAIL,
    to: email,
    subject: "Confirm your email address",
    html: `
      <h1>Confirm your email address</h1>
      <p>Click the link below to confirm your email address</p>
      <a href="${CLIENT_URL}/auth/verify-email?token=${token}">Verify Email</a>
    `,
  });

  if (!response.messageId) return false;

  return true;
};
