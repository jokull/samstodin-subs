import * as nodemailer from "nodemailer";

export const sendEmail = async (
  recipient: string,
  subject: string,
  text: string,
  html?: string
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.fastmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SAMSTODIN_EMAIL_ADDRESS,
      pass: process.env.SAMSTODIN_EMAIL_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from: `Samstöðin <${process.env.SAMSTODIN_EMAIL_ADDRESS}>`,
    to: recipient,
    subject: subject,
    text: text,
    html: html,
  });
};
