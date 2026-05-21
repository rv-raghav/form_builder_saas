import nodemailer from "nodemailer";
import { logger } from "@repo/logger";
import { env } from "../env";

/**
 * Notify form owner when someone submits a public response (Phase 5).
 * If SMTP is not configured, logs a dev-friendly line instead.
 */
export async function notifyCreatorNewResponse(input: {
  to: string;
  formTitle: string;
  formSlug: string;
  responsePreview: string;
}): Promise<void> {
  const host = env.SMTP_HOST;
  const from = env.EMAIL_FROM ?? "noreply@chaiforms.local";

  const subject = `New response: ${input.formTitle}`;
  const fillUrl = `${env.APP_URL.replace(/\/$/, "")}/f/${input.formSlug}`;
  const text = `You received a new submission on "${input.formTitle}" (${input.formSlug}).

Summary: ${input.responsePreview || "(no preview)"}

Fill link: ${fillUrl}
`;

  if (!host || !env.SMTP_USER || !env.SMTP_PASS) {
    logger.info(
      `[email] New response — to=${input.to} form="${input.formTitle}" slug=${input.formSlug} | ${input.responsePreview}\n(Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real mail.)`,
    );
    return;
  }

  const port = Number(env.SMTP_PORT ?? "587");
  const secure = port === 465;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject,
      text,
    });
    logger.info(`[email] Sent new-response notification to ${input.to}`);
  } catch (err) {
    logger.error("[email] Failed to send new-response notification", { err });
  }
}
