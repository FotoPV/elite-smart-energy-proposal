export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Fully public mode — no OAuth login required.
// Returns current path so redirectOnUnauthenticated never redirects away.
export const getLoginUrl = () => {
  return window.location.pathname || "/";
};
