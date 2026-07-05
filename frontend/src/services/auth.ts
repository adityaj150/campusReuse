// src/services/auth.ts

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export interface User {
  id: number;
  name: string;
  email: string;
  profilePicture: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Send Google ID Token to backend to authenticate.
 * Stores the JWT in localStorage on success.
 */
export async function googleSignIn(idToken: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ idToken }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error ?? 'Google authentication failed');
  }
  localStorage.setItem('campusreuse_token', data.token);
  localStorage.setItem('campusreuse_user', JSON.stringify(data.user));
  return data as AuthResponse;
}

/** Remove the stored token – logs the user out */
export function logout() {
  localStorage.removeItem('campusreuse_token');
  localStorage.removeItem('campusreuse_user');
}

/** Retrieve the stored token, or null if not logged in */
export function getToken(): string | null {
  return localStorage.getItem('campusreuse_token');
}

/** Retrieve the stored user object, or null if not logged in */
export function getUser(): User | null {
  const userStr = localStorage.getItem('campusreuse_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
}


