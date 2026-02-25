// Fully public mode — no authentication required.
// Always returns a mock authenticated user so all pages render without login.

const PUBLIC_USER = {
  id: 1,
  name: "Public User",
  email: "public@elitesmartenergy.com.au",
  role: "admin" as const,
  openId: "public",
  loginMethod: "public",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

export function useAuth(_options?: unknown) {
  return {
    user: PUBLIC_USER,
    loading: false,
    error: null,
    isAuthenticated: true,
    refresh: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  };
}
