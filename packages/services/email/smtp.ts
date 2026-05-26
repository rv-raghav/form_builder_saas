import nodemailer from "nodemailer";
import { logger } from "@repo/logger";
import { env } from "../env";

type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  logFallback: string;
};

function getSmtpConfig() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  const port = Number(env.SMTP_PORT ?? "587");
  return {
    from: env.EMAIL_FROM ?? "noreply@loomform.local",
    host: env.SMTP_HOST,
    port,
    secure: port === 465,
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  };
}

export async function sendTransactionalEmail(input: SendEmailInput): Promise<void> {
  const config = getSmtpConfig();
  if (!config) {
    logger.info(input.logFallback);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}
