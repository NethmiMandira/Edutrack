import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const ADMIN_EMAIL = 'mandiranethmi03@gmail.com';

export default function AdminProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    // Wait for Firebase to restore any persisted admin session before deciding.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const isAdmin = user && (user.email || '').toLowerCase() === ADMIN_EMAIL;
      setStatus(isAdmin ? 'allowed' : 'denied');
    });
    return unsubscribe;
  }, []);

  if (status === 'checking') {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-300 flex items-center justify-center">
        <p className="animate-pulse text-sm font-semibold">Checking admin session…</p>
      </main>
    );
  }

  return status === 'allowed' ? children : <Navigate to="/admin/login" replace />;
}
