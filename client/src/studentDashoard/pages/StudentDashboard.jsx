import React, { useEffect, useMemo, useState } from 'react';
import { 
  HiOutlineTrendingUp, 
  HiOutlineClipboardCheck,
  HiOutlineExclamation,
  HiOutlineCheckCircle 
} from "react-icons/hi";

import StudentLayout from '../components/StudentLayout';
import API from '../../api';

// --- SHARED UI COMPONENT (Ideally move this to a separate file) ---
function MessageBox({ message, onClose, type = "error" }) {
  if (!message) return null;

  const styles = {
    success: { color: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50", label: "Success" },
    error: { color: "text-rose-600", border: "border-rose-200", bg: "bg-rose-50", label: "System Error" }
  };

  const { color, border, bg, label } = styles[type] || styles.error;

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 rounded-[2rem] border-2 ${border} ${bg} mb-6 animate-in fade-in zoom-in-95 duration-300`}>
      <div className={`text-xl sm:text-2xl ${color} flex-shrink-0`}>
        {type === "success" ? <HiOutlineCheckCircle /> : <HiOutlineExclamation />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs uppercase tracking-[0.1em] font-black ${color} mb-1`}>{label}</div>
        <div className="text-sm sm:text-base text-slate-700 font-medium break-words">{message}</div>
      </div>
      <button onClick={onClose} className={`text-xs sm:text-sm font-bold ${color} hover:opacity-75 flex-shrink-0`}>Dismiss</button>
    </div>
  );
}

// --- UTILITY ---
const toPercentage = (mark, maxMark) => {
  const safeMark = Number(mark) || 0;
  const safeMax = Number(maxMark) || 0;
  if (safeMax <= 0) return Math.max(0, Math.min(100, safeMark));
  return Math.max(0, Math.min(100, (safeMark / safeMax) * 100));
};

const StudentDashboard = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messageBox, setMessageBox] = useState({ message: "", type: "error" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecentPapers = async () => {
      setLoading(true);
      try {
        const studentRaw = localStorage.getItem('student');
        const student = studentRaw ? JSON.parse(studentRaw) : null;
        const studentIndexNo = String(student?.indexno || '').trim();

        if (!studentIndexNo) {
          setPapers([]);
          setMessageBox({ message: 'Student session not found. Please login again.', type: 'error' });
          return;
        }

        const response = await API.get('/marks', { 
          signal: controller.signal,
        });

        const allMarks = response.data;
        const normalized = Array.isArray(allMarks) ? allMarks : [];

        const studentPapers = normalized
          .filter((entry) => String(entry?.indexno || '').trim() === studentIndexNo)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)
          .map((entry) => ({
            id: entry.id,
            paperName: entry.paperName || 'Paper',
            subject: entry.subject || 'Subject',
            marks: Number(toPercentage(entry.mark, entry.maxMark).toFixed(1)),
          }));

        setPapers(studentPapers);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setMessageBox({ message: err.message || 'Unable to load recent papers.', type: 'error' });
          setPapers([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPapers();
    return () => controller.abort();
  }, []);

  return (
    <StudentLayout title="Student Dashboard">
      <section className="grid grid-cols-1 gap-6 sm:gap-8 items-start">
        <div className="rounded-[2.5rem] border-2 border-slate-200 bg-white p-4 sm:p-5 lg:p-8 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <div className="p-2 sm:p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                <HiOutlineClipboardCheck className="text-xl sm:text-2xl" />
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Recent Papers</h3>
          </div>

          {/* New MessageBox Implementation */}
          <MessageBox 
            message={messageBox.message} 
            type={messageBox.type} 
            onClose={() => setMessageBox({ message: "", type: "error" })} 
          />

          <div className="space-y-3 sm:space-y-4">
            {loading ? (
              <article className="rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 p-4 sm:p-5 text-sm sm:text-base text-slate-600 animate-pulse">
                Loading recent papers...
              </article>
            ) : papers.length === 0 && !messageBox.message ? (
              <article className="rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 p-4 sm:p-5 text-sm sm:text-base text-slate-600">
                No papers found yet.
              </article>
            ) : (
              papers.map((paper) => (
                <article
                  key={paper.id}
                  className="group flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-[2rem] border-2 border-slate-100 bg-slate-50/50 p-4 sm:p-5 gap-4 sm:gap-5 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3 sm:gap-5 min-w-0">
                      <div className="flex h-12 sm:h-14 w-12 sm:w-14 items-center justify-center rounded-2xl bg-white border-2 border-slate-100 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-100 transition-colors flex-shrink-0">
                          <HiOutlineTrendingUp className="text-xl sm:text-2xl" />
                      </div>
                      <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-base sm:text-lg truncate">{paper.paperName}</p>
                          <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider truncate">{paper.subject}</p>
                      </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-2">
                      <div className="flex items-baseline gap-1">
                          <span className="text-2xl sm:text-3xl font-black text-slate-900">{paper.marks}</span>
                          <span className="text-xs font-bold text-slate-400">/100</span>
                      </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </section>
    </StudentLayout>
  );
};

export default StudentDashboard;