# Auth Findings Checklist

This file tracks the production-readiness findings for authentication and related email flows.
We will tick items off only after the change is implemented and verified.

## Current Status

- [x] Forgot-password sends a real email through SMTP/Resend instead of only logging the reset URL.
- [x] Password reset revokes active sessions for that user.
- [x] Password reset invalidates the user's other outstanding reset tokens.
- [x] Session refresh resets the browser cookie expiry correctly.
- [x] Session refresh preserves `remember_me` behavior instead of always falling back to the default session window.
- [ ] Email verification flow is implemented end to end.
- [ ] Login enforces the intended email verification policy.
- [x] API env parsing accepts standard production configuration such as `NODE_ENV=production`.
- [x] Cookie policy is configurable for real production deployments, including cross-domain setups when needed.
- [x] Default dev secrets are rejected in production.
- [ ] Password policy is aligned between backend validation and frontend messaging.
- [ ] Admin-created users follow a proper first-login password-change or invite flow.
- [ ] Set-password page redirect and text rendering issues are fixed.

## Verification Notes

- Forgot-password email flow was verified with live Resend SMTP after the sender domain was configured and the API server was restarted to pick up package changes.
- Password reset session revocation was verified manually by keeping a protected page open in one browser session, completing a reset in another session, and confirming the old protected session stopped working.
- Password reset token invalidation was verified manually by requesting multiple reset links for the same user, completing one reset successfully, and confirming the other reset link became invalid.
- Session refresh was verified manually by checking the `session_id` cookie expiry in the browser before and after refresh for both normal login and `Keep me logged in`, confirming the expiry renewed and preserved the expected 7-day versus 30-day behavior.
- Production env hardening was verified by automated checks confirming `NODE_ENV=production` now loads correctly, unsafe default secrets are rejected in production, and `COOKIE_SAMESITE=none` is only allowed when `COOKIE_SECURE=true`.
