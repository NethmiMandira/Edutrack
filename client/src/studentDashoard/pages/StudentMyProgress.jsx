import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';
import StudentFilterBar from '../components/StudentFilterBar';
import StudentLayout from '../components/StudentLayout';
import StudentProgressCharts from '../components/StudentProgressCharts';
import API from '../../api';

const toPercentage = (mark, maxMark) => {
  const safeMark = Number(mark) || 0;
  const safeMax = Number(maxMark) || 0;

  if (safeMax <= 0) {
    return Math.max(0, Math.min(100, safeMark));
  }

  return Math.max(0, Math.min(100, (safeMark / safeMax) * 100));
};

const normalizeIndexNo = (value) => String(value || '').trim().toLowerCase();
const normalizeText = (value) => String(value || '').trim().toLowerCase();

const StudentMyProgress = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [marks, setMarks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchProgress = async () => {
      setLoading(true);
      setError('');

      try {
        const studentRaw = localStorage.getItem('student');
        const student = studentRaw ? JSON.parse(studentRaw) : null;
        const studentIndexNo = String(student?.indexno || '').trim();

        if (!studentIndexNo) {
          setMarks([]);
          setError('Student session not found. Please login again.');
          return;
        }

        const [marksRes, profileRes] = await Promise.all([
          API.get('/marks', { signal: controller.signal }),
          API.get(`/profile/${encodeURIComponent(studentIndexNo)}`, { signal: controller.signal }),
        ]);

        const allMarks = marksRes.data;
        const profileData = profileRes.data || {};
        const profile = profileData.profile || profileData || {};

        const subjectList = Array.isArray(profile.subjects) ? profile.subjects : [];
        const subjectNames = subjectList.map((s) => String(s?.name || s).trim()).filter(Boolean);

        setSubjects([...new Set(subjectNames)]);
        const normalized = Array.isArray(allMarks) ? allMarks : [];

        const studentMarks = normalized
          .filter((entry) => normalizeIndexNo(entry?.indexno) === normalizeIndexNo(studentIndexNo))
          .map((entry) => ({
            id: entry.id,
            subject: entry.subject || '',
            category: entry.paperCategory || 'Assessment',
            date: entry.date,
            marks: Number(toPercentage(entry.mark, entry.maxMark).toFixed(1)),
          }));

        setMarks(studentMarks);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load progress data.');
          setMarks([]);
          setSubjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
    return () => controller.abort();
  }, []);

  const visibleSubjects = useMemo(() => subjects, [subjects]);

  const filteredMarks = useMemo(
    () =>
      marks.filter((item) => {
        const validSubject = selectedSubject
          ? normalizeText(item.subject) === normalizeText(selectedSubject)
          : false;

        return validSubject;
      }),
    [marks, selectedSubject]
  );

  const hasSelectedSubject = Boolean(selectedSubject);
  const hasData = filteredMarks.length > 0;

  return (
    <StudentLayout
      title="My Progress"
      
    >
      <StudentFilterBar
        subjects={visibleSubjects}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        subjectDefaultLabel="Select Subject"
        subjectDefaultValue=""
        showDateFilters={false}
      />

      <div className="mt-5">
        {loading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            Loading your progress...
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
        ) : marks.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            No progress records found yet.
          </section>
        ) : !hasSelectedSubject ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            Please select a subject to view progress charts.
          </section>
        ) : hasData ? (
          <StudentProgressCharts marks={filteredMarks} />
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            No marks found for the selected filters.
          </section>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentMyProgress;
