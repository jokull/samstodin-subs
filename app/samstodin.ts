import * as nodemailer from "nodemailer";

export const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  html?: string
) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SAMSTODIN_EMAIL_ADDRESS,
      pass: process.env.SAMSTODIN_EMAIL_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from: "yourname@gmail.com",
    to: recipient,
    subject: subject,
    text: text,
    html: html,
  });
};
