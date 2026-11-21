# 0004. Web session lives in httpOnly cookies

- Status: Accepted
- Date: 2026-11-21

## Decision

- **Tokens.** The access and refresh tokens are httpOnly cookies, set and
  read in server actions. Client code never sees them.
- **Logout** (`actions/auth/logout.ts`). The API keeps no session: tokens are
  stateless JWTs, so logout only deletes the cookies. The action itself
  redirects to `/login`. Otherwise Next re-renders the current page, whose
  layout refetches the profile without a token and fails with 401.
- **Clearing the profile** (`ClearProfile`). The persisted profile store is
  cleared whenever an auth page opens, so the next person to sign in never
  sees the previous learner's name or XP. This happens on the auth page, not
  in the logout button: by then the learner shell has unmounted, so nothing
  refetches with the old cookie.
- **Profile fetch** (`useProfile`). Several shell components mount
  `useProfile` together, so the in-flight check reads the store directly,
  not a render-time snapshot. When an automatic fetch fails,
  `profileFetchFailed` stops every mounted `useProfile` from retrying in a
  loop until `fetchProfile` is called explicitly.
- **Password reset.** The reset token from ADR 0003 stays server-side in the
  `passwordResetToken` httpOnly cookie between the OTP and new-password
  steps. The cookie's 10-minute max-age matches the token's lifetime. It is
  deleted once the password changes, because the token no longer works.
- **Route matching** (`proxy.ts`). Routes match whole path segments, so
  `/learn.svg` is never mistaken for `/learn`.

## Consequences

- Token refresh isn't settled. In the same request, `proxy.ts` deletes the
  token cookies for an expired access token (`checkExpiredToken`, marked
  "TODO: Remove when have refresh token") and also tries to refresh them
  (`handleTokenRefresh`). `lib/http.ts` still holds a commented-out refresh.
  Tracked in an issue.
