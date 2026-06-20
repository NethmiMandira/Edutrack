import React, { useEffect, useState } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';
import StudentLayout from '../components/StudentLayout';
import StudentProfileForm from '../components/StudentProfileForm';
import API from '../../api';

const defaultProfile = {
  firstName: '',
  lastName: '',
  indexNumber: '',
  grade: '',
  currentYear: '',
  contact: '',
  email: '',
  subjects: [],
  dateRegistered: '',
};

const StudentProfile = () => {
  const [profile, setProfile] = useState(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchProfile = async () => {
      setLoading(true);
      setError('');

      try {
        const studentRaw = localStorage.getItem('student');
        const student = studentRaw ? JSON.parse(studentRaw) : null;
        const indexno = String(
          student?.indexno || student?.indexNumber || student?.profile?.indexNumber || ''
        ).trim();

        if (!indexno) {
          setProfile(defaultProfile);
          setError('Student session not found. Please login again.');
          return;
        }

        const response = await API.get(`/profile/${encodeURIComponent(indexno)}`, {
          signal: controller.signal,
        });

        const data = response.data || {};
        const apiProfile = data?.profile || data || {};

        setProfile({
          firstName: apiProfile.firstName || '',
          lastName: apiProfile.lastName || '',
          indexNumber: apiProfile.indexNumber || '',
          grade: apiProfile.grade || '',
          currentYear: apiProfile.currentYear || '',
          contact: apiProfile.contact || '',
          email: apiProfile.email || '',
          subjects: Array.isArray(apiProfile.subjects) ? apiProfile.subjects : [],
          dateRegistered: apiProfile.dateRegistered || '',
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          const errorMsg = err.response?.data?.error || err.message || `Failed to load profile for index ${indexno}`;
          setError(errorMsg);
          setProfile(defaultProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    return () => controller.abort();
  }, []);

  return (
    <StudentLayout
      title="Profile"
     
    >
      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading profile...
        </section>
      ) : error ? (
        <section className="flex items-center gap-4 p-5 rounded-[2rem] border-2 border-rose-200 bg-rose-50">
          <div className="text-2xl text-rose-600">
            <HiOutlineExclamation />
          </div>
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.1em] font-black text-rose-600 mb-1">System Error</div>
            <div className="text-slate-700 font-medium text-sm">{error}</div>
          </div>
        </section>
      ) : (
        <StudentProfileForm profile={profile} />
      )}
    </StudentLayout>
  );
};

export default StudentProfile;
