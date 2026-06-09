// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // location state may contain the page we attempted to access
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Enforce @coeptech.ac.in email domain
    if (!email.endsWith('@coeptech.ac.in')) {
      setError('Only @coeptech.ac.in email addresses are allowed');
      return;
    }
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-surface dark:bg-darkSurface">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-soft dark:bg-darkSurfaceMuted"
      >
        <h2 className="mb-4 text-center text-2xl font-semibold text-textHeading dark:text-white">
          Sign in
        </h2>
        {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-textHeading dark:text-white"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="college mail id"
            title="Only coep tech email addresses are allowed"
            className="mt-1 block w-full rounded border border-border bg-surface p-2 focus:border-accent focus:outline-none dark:border-darkBorder dark:bg-darkSurface"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium text-textHeading dark:text-white"
            htmlFor="password"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="mt-1 block w-full rounded border border-border bg-surface p-2 focus:border-accent focus:outline-none dark:border-darkBorder dark:bg-darkSurface"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-accent py-2 text-sm font-semibold text-white hover:bg-emerald-800 dark:bg-darkAccent dark:hover:bg-emerald-300"
        >
          Sign In
        </button>
      </form>
    </section>
  );
}
