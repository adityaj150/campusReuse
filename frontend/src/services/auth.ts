// src/services/auth.ts
export interface LoginResponse { token: string; }

/**
 * Mock login function – in a real app this would call your backend.
 * It stores a fake JWT in localStorage to simulate authentication.
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 300));
  // Create a simple base64 token (do NOT use this in production!)
  const mockToken = btoa(`${email}:mock-jwt`);
  localStorage.setItem('campusreuse_token', mockToken);
  return { token: mockToken };
}

/** Remove the stored token – logs the user out */
export function logout() {
  localStorage.removeItem('campusreuse_token');
}

/** Retrieve the stored token, or null if not logged in */
export function getToken(): string | null {
  return localStorage.getItem('campusreuse_token');
}
