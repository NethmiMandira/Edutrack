import React, { useCallback, useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { auth } from '../firebase/config';

const statusStyles = {
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-rose-500/15 text-rose-300',
  pending: 'bg-amber-500/15 text-amber-300',
};

export default function AdminTutors() {
  const [tutors, setTutors] = useState([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);
  const navigate = useNavigate();

  // Always send a freshly-minted Firebase ID token so long-lived sessions keep working.
  const adminConfig = async () => {
    let token = localStorage.getItem('adminToken');
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        token = await currentUser.getIdToken();
        localStorage.setItem('adminToken', token);
      }
    } catch { /* fall back to the stored token */ }
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const handleAuthError = useCallback((requestError) => {
    const status = requestError.response?.status;
    if (status === 401) {
      localStorage.removeItem('adminToken');
      navigate('/admin/login');
      return true;
    }
    setError(requestError.response?.data?.error || 'Unable to complete the request.');
    return false;
  }, [navigate]);

  const loadTutors = async () => {
    const response = await API.get('/admin/tutors', await adminConfig());
    setTutors(response.data);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const response = await API.get('/admin/tutors', await adminConfig());
        if (mounted) setTutors(response.data);
      } catch (requestError) {
        if (mounted) handleAuthError(requestError);
      }
    })();
    return () => { mounted = false; };
  }, [handleAuthError]);

  const updateStatus = async (tutor, status) => {
    setError('');
    setNotice('');
    setBusyId(tutor._id);
    try {
      await API.patch(`/admin/tutors/${tutor._id}/status`, { status }, await adminConfig());
      await loadTutors();
      setNotice(`${tutor.username} marked as ${status}.`);
    } catch (requestError) {
      handleAuthError(requestError);
    } finally {
      setBusyId(null);
    }
  };

  const resetPassword = async (tutor) => {
    setError('');
    setNotice('');
    const password = window.prompt(`New password for "${tutor.username}" (minimum 6 characters):`);
    if (password === null) return;
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setBusyId(tutor._id);
    try {
      await API.post(`/admin/tutors/${tutor._id}/reset-password`, { password }, await adminConfig());
      setNotice(`Password reset for ${tutor.username}. Share the new password with them.`);
    } catch (requestError) {
      handleAuthError(requestError);
    } finally {
      setBusyId(null);
    }
  };

  const logout = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const pendingCount = tutors.filter((tutor) => tutor.status === 'pending').length;

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 sm:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">EduTrack Admin</p>
            <h1 className="mt-2 text-3xl font-black">Tutor approvals</h1>
            <p className="mt-2 text-sm text-slate-400">
              {pendingCount > 0 ? `${pendingCount} request${pendingCount === 1 ? '' : 's'} awaiting review.` : 'No pending requests.'}
            </p>
          </div>
          <button onClick={logout} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-semibold hover:border-rose-400 hover:text-rose-300">Sign out</button>
        </header>
        {error && <p className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-300">{error}</p>}
        {notice && <p className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300">{notice}</p>}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-800 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            <span>Username</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {tutors.length === 0 && <p className="p-6 text-slate-400">No tutor requests yet.</p>}
          {tutors.map((tutor) => (
            <div key={tutor._id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-800/80 px-5 py-5 last:border-0">
              <div>
                <p className="font-bold">{tutor.username}</p>
                <p className="text-xs text-slate-500">
                  Requested {tutor.createdAt ? new Date(tutor.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[tutor.status] || statusStyles.pending}`}>{tutor.status}</span>
              <div className="flex flex-wrap justify-end gap-2">
                <button onClick={() => updateStatus(tutor, 'approved')} disabled={busyId === tutor._id || tutor.status === 'approved'} className="rounded-lg bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 disabled:opacity-40">Approve</button>
                <button onClick={() => updateStatus(tutor, 'rejected')} disabled={busyId === tutor._id || tutor.status === 'rejected'} className="rounded-lg bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-300 disabled:opacity-40">Reject</button>
                <button onClick={() => resetPassword(tutor)} disabled={busyId === tutor._id} className="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200 disabled:opacity-40">Reset password</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}