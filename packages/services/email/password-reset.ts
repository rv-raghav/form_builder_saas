import { logger } from "@repo/logger";
import { sendTransactionalEmail } from "./smtp";

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
}): Promise<void> {
  const subject = "Reset your LoomForm password";
  const text = `We received a request to reset your LoomForm password.

Reset your password: ${input.resetUrl}

If you did not request this change, you can ignore this email. This link expires in 1 hour.
`;
  const html = `
    <p>We received a request to reset your LoomForm password.</p>
    <p><a href="${input.resetUrl}">Reset your password</a></p>
    <p>If you did not request this change, you can ignore this email.</p>
    <p>This link expires in 1 hour.</p>
  `;

  try {
    await sendTransactionalEmail({
      to: input.to,
      subject,
      text,
      html,
      logFallback: `[email] Password reset link for ${input.to}: ${input.resetUrl}\n(Set SMTP_HOST, SMTP_USER, SMTP_PASS to send real mail.)`,
    });
    logger.info(`[email] Password reset email processed for ${input.to}`);
  } catch (err) {
    logger.error("[email] Failed to send password reset email", { err, to: input.to });
    throw err;
  }
}
