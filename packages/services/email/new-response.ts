import { logger } from "@repo/logger";
import { env } from "../env";
import { sendTransactionalEmail } from "./smtp";

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
  const subject = `New response: ${input.formTitle}`;
  const fillUrl = `${env.APP_URL.replace(/\/$/, "")}/f/${input.formSlug}`;
  const text = `You received a new submission on "${input.formTitle}" (${input.formSlug}).

Summary: ${input.responsePreview || "(no preview)"}

Fill link: ${fillUrl}
`;

  try {
    await sendTransactionalEmail({
      to: input.to,
      subject,
      text,
      logFallback: `[email] New response - to=${input.to} form="${input.formTitle}" slug=${input.formSlug} | ${input.responsePreview}\n(Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real mail.)`,
    });
    logger.info(`[email] Sent new-response notification to ${input.to}`);
  } catch (err) {
    logger.error("[email] Failed to send new-response notification", { err });
  }
}
