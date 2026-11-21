# 0003. API auth: JWT user cache and password-reset tokens

- Status: Accepted
- Date: 2026-11-21

## Decision

**Access tokens.** `JwtStrategy` checks that the token's user still exists.
That lookup ran before every authenticated handler, so a confirmed user id is
cached for `USER_EXISTS_TTL_MS` (60 s), at most `USER_EXISTS_MAX_ENTRIES`
(10,000) ids. Only hits are cached. The cache is per process: each instance
warms its own.

**No secret fallback.** `ACCESS_TOKEN_SECRET` is read with `getOrThrow`. A
missing secret stops the app instead of signing with a known default.

**Roles.** `RolesGuard` allows a request when `req.user.role` is one of the
route's `@Roles()`. It runs after `JwtAuthGuard`, which sets `req.user`.

**Password reset.** After a correct OTP, `POST /email/verify-otp` returns a
reset token from `PasswordResetTokenService`, and
`POST /users/reset-password` requires it. The token:

- lasts 10 minutes;
- is signed with its own key, so it can never pass as an access token;
- carries a fingerprint of the password hash at issue time, so it stops
  working once the password changes (one use in practice).

`issue` returns `undefined` for an unknown email instead of throwing.

## Consequences

- A deleted user's token keeps working for up to 60 s.
- See ADR 0004 for how the web app holds the reset token.
