import * as nodemailer from "nodemailer";

import { env } from "~/env";

export const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  html?: string,
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.fastmail.com",
    port: 465,
    secure: true,
    auth: {
      user: env.SAMSTODIN_EMAIL_ADDRESS,
      pass: env.SAMSTODIN_EMAIL_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from: `Samstöðin <${env.SAMSTODIN_EMAIL_ADDRESS}>`,
    to: recipient,
    subject: subject,
    text: text,
    html: html,
  });
};
