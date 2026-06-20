import React, { useEffect, useMemo, useState } from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';
import StudentFilterBar from '../components/StudentFilterBar';
import StudentLayout from '../components/StudentLayout';
import StudentPaperHistoryTable from '../components/StudentPaperHistoryTable';
import API from '../../api';

const normalizeIndexNo = (value) => String(value || '').trim().toLowerCase();

const formatDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const StudentPaperHistory = () => {
  const [papers, setPapers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchPaperHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const studentRaw = localStorage.getItem('student');
        const student = studentRaw ? JSON.parse(studentRaw) : null;
        const studentIndexNo = String(student?.indexno || '').trim();

        if (!studentIndexNo) {
          setPapers([]);
          setSubjects([]);
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
        const subjectNames = subjectList.map((item) => String(item?.name || item).trim()).filter(Boolean);
        setSubjects([...new Set(subjectNames)]);

        const normalized = Array.isArray(allMarks) ? allMarks : [];
        const studentPapers = normalized
          .filter((entry) => normalizeIndexNo(entry?.indexno) === normalizeIndexNo(studentIndexNo))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((entry) => ({
            id: entry.id,
            paperName: entry.paperName || 'Paper',
            date: formatDate(entry.date),
            subject: entry.subject || 'Subject',
            category: entry.paperCategory || 'Assessment',
            marks: `${Number(entry.mark) || 0}/${Number(entry.maxMark) || 0}`,
          }));

        setPapers(studentPapers);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Unable to load paper history.');
          setPapers([]);
          setSubjects([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaperHistory();
    return () => controller.abort();
  }, []);

  const availableSubjects = useMemo(() => subjects, [subjects]);

  const filteredPapers = useMemo(
    () =>
      papers.filter((paper) => {
        const validSubject =
          selectedSubject === 'all' ? true : paper.subject === selectedSubject;
        return validSubject;
      }),
    [papers, selectedSubject]
  );

  return (
    <StudentLayout
      title="Paper History"
     
    >
      <StudentFilterBar
        subjects={availableSubjects}
        selectedSubject={selectedSubject}
        onSubjectChange={setSelectedSubject}
        showDateFilters={false}
      />

      <div className="mt-5">
        {loading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            Loading paper history...
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
        ) : filteredPapers.length === 0 ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            No paper history found for the selected subject.
          </section>
        ) : (
          <StudentPaperHistoryTable papers={filteredPapers} />
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentPaperHistory;
