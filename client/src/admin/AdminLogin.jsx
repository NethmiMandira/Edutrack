import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';

const ADMIN_EMAIL = 'mandiranethmi03@gmail.com';

export default function AdminLogin() {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If an admin session is already active, skip the form.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && (user.email || '').toLowerCase() === ADMIN_EMAIL) {
        navigate('/admin/tutors', { replace: true });
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      if ((credential.user.email || '').toLowerCase() !== ADMIN_EMAIL) {
        await auth.signOut();
        setError('This account is not authorised for the admin panel.');
        return;
      }
      const token = await credential.user.getIdToken();
      localStorage.setItem('adminToken', token);
      navigate('/admin/tutors');
    } catch {
      setError('Admin credentials are invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">EduTrack Admin</p>
        <h1 className="mt-3 text-3xl font-black">Administrator sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Manage tutor access and password resets.</p>
        {error && <p className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">{error}</p>}
        <label className="mt-6 block text-sm font-semibold text-slate-300">Email<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="mt-4 block text-sm font-semibold text-slate-300">Password<input className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        <button className="mt-6 w-full rounded-xl bg-indigo-500 px-4 py-3 font-bold hover:bg-indigo-400 disabled:opacity-50" type="submit" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}
