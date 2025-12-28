import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function PhysicianLogin() {
  const router = useRouter();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    try {
      const response = await fetch('/api/physician/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and physician info
        localStorage.setItem('physician_token', data.token);
        localStorage.setItem('physician', JSON.stringify(data.physician));
        router.push('/physician/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <Head>
        <title>Physician Login | DuoDesire™</title>
      </Head>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-display text-white hover:opacity-80 transition-opacity inline-block">
            <span>Duo</span>
            <span className="text-primary-400">Desire</span>
            <span className="text-primary-400 text-sm">™</span>
          </Link>
          <p className="text-gray-400 mt-2">Physician Portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-display font-semibold text-gray-900 mb-6 text-center">
            Sign In
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                ref={emailRef}
                placeholder="doctor@duodesire.com"
                required
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                ref={passwordRef}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary py-4"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t text-center">
            <p className="text-sm text-gray-500">
              Authorized medical personnel only
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-8">
          © 2024 DuoDesire™. HIPAA Compliant.
        </p>
      </div>
    </div>
  );
}

