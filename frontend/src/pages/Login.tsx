// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { googleSignIn } from '../services/auth';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // location state may contain the page we attempted to access
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    try {
      if (credentialResponse.credential) {
        await googleSignIn(credentialResponse.credential);
        navigate(from, { replace: true });
      } else {
        setError("No credential received from Google");
      }
    } catch (err: any) {
      setError(err.message ?? 'Login failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-surface dark:bg-darkSurface">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-soft dark:bg-darkSurfaceMuted text-center">
        <h2 className="mb-6 text-2xl font-semibold text-textHeading dark:text-white">
          Sign in
        </h2>
        
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            text="signin_with"
            shape="rectangular"
          />
        </div>
      </div>
    </section>
  );
}
