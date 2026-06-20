import React, { useEffect, useState } from 'react';
import { HiOutlineX, HiChevronDown, HiOutlineBookOpen } from 'react-icons/hi';
import Navbar from '../components/Navbar';
import PageTitle from '../components/PageTitle';
import StudentIndexSelector from '../components/StudentIndexSelector';
import ProgressCharts from '../components/ProgressCharts';
import API from '../api';

const CONNECTION_ERROR_MESSAGE = 'Could not connect to the database. Please check if the server is live.';

const sanitizeErrorMessage = (message, fallbackMessage) => {
  if (!message || typeof message !== 'string') return fallbackMessage;
  return message.replace(/\s*\(\d{3}\)\s*$/g, '').trim() || fallbackMessage;
};

// --- UI COMPONENT ---
function MessageBox({ message, onClose, type = "error" }) {
  useEffect(() => {
    if (!message) return;
    const handleKeyDown = (e) => { if (e.key === "Enter") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [message, onClose]);

  if (!message) return null;

  const styles = {
    success: { color: "text-emerald-600", border: "border-emerald-200", label: "Success" },
    warning: { color: "text-amber-600", border: "border-amber-200", label: "Confirm Action" },
    error: { color: "text-rose-600", border: "border-rose-200", label: "System Error" }
  };

  const { color, border, label } = styles[type] || styles.error;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white rounded-[2rem] shadow-2xl border-2 p-8 min-w-[340px] max-w-[90vw] flex flex-col items-center gap-4 ${border} animate-in zoom-in-95 duration-300`}>
        <div className={`text-sm uppercase tracking-[0.2em] font-black ${color}`}>{label}</div>
        <div className="text-slate-600 text-center font-medium leading-relaxed whitespace-pre-line px-4">
          {message}
        </div>
        <button
          onClick={onClose}
          className="mt-4 px-12 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
}

const Progress = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [messageBox, setMessageBox] = useState({ message: "", type: "error" });

  useEffect(() => {
    const controller = new AbortController();

    const fetchSubjects = async () => {
      try {
        const response = await API.get('/subjects', { signal: controller.signal });
        setSubjects(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        setMessageBox({
          message: CONNECTION_ERROR_MESSAGE,
          type: "error"
        });
      }
    };

    fetchSubjects();
    return () => controller.abort();
  }, []);

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setSelectedSubject('');
  };

  const studentName = selectedStudent
    ? [selectedStudent.firstname, selectedStudent.lastname].filter(Boolean).join(' ') || selectedStudent.name || 'Selected student'
    : '';

  const handleStudentLoadError = (errorMessage) => {
    setMessageBox({
      message: sanitizeErrorMessage(errorMessage, CONNECTION_ERROR_MESSAGE),
      type: 'error'
    });
  };

  return (
    <div>
      <Navbar />

      <MessageBox 
        message={messageBox.message} 
        type={messageBox.type} 
        onClose={() => setMessageBox({ message: "", type: "error" })} 
      />

      <div
        className="tutor-page-shell min-h-screen bg-slate-50 py-5 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6 lg:px-8"
        style={{ marginLeft: "calc(var(--tutor-sidebar-width, 5.5rem) + 0.75rem)" }}
      >
        <div className="mx-auto max-w-7xl">
          <PageTitle title="Student Progress" className="mb-8" />

          <div className="bg-white rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 shadow-sm border border-slate-200 mb-8 w-full">
            <StudentIndexSelector
              onSelect={handleStudentSelect}
              onError={handleStudentLoadError}
              hideInlineError
            />

            <div className="mt-6">
              <label className={`mb-1.5 block text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${selectedSubject ? "text-indigo-600" : "text-slate-500"}`}>
                Select Subject
              </label>
              
              <div className="relative group flex items-center gap-3">
                {/* Icon Left */}
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${selectedSubject ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <HiOutlineBookOpen className="text-xl" />
                </div>

                <select
                  value={selectedSubject}
                  onChange={(event) => setSelectedSubject(event.target.value)}
                  className={`w-full pl-12 pr-16 py-3 sm:py-3.5 rounded-2xl border outline-none transition-all duration-300 appearance-none ${
                    selectedSubject
                      ? "bg-indigo-50 border-indigo-400 text-slate-800 shadow-sm"
                      : "bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  }`}
                  disabled={!selectedStudent}
                >
                  <option value="">Choose subject</option>
                  {subjects.map((subject) => (
                    <option key={subject._id || subject.name} value={subject.name || ''}>
                      {subject.name}
                    </option>
                  ))}
                </select>

                {/* Clear Button */}
                {selectedSubject && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubject("")}
                    className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all z-20"
                    aria-label="Clear subject"
                  >
                    <HiOutlineX className="text-lg" />
                  </button>
                )}

                {/* Chevron */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <HiChevronDown className="text-lg" />
                </div>
              </div>
            </div>

            {selectedStudent && selectedSubject && (
              <div className="mt-8 p-4 sm:p-5 bg-indigo-50 rounded-2xl border border-indigo-200">
                <h2 className="text-lg font-bold text-indigo-900 mb-3">Student Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase">Index Number</p>
                    <p className="text-slate-800 font-medium">{selectedStudent.indexno}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase">Name</p>
                    <p className="text-slate-800 font-medium">{studentName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase">Grade</p>
                    <p className="text-slate-800 font-medium">{selectedStudent.grade}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-600 uppercase">Subject</p>
                    <p className="text-slate-800 font-medium">{selectedSubject || 'Not selected'}</p>
                  </div>
                </div>
              </div>
            )}

            {(!selectedStudent || !selectedSubject) && (
              <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 sm:p-6 text-center text-slate-500 text-sm sm:text-base">
                Pick a student and subject above to display student details and progress charts.
              </div>
            )}
          </div>

          <div className="mt-8">
            <ProgressCharts
              studentIndexNo={selectedStudent?.indexno}
              subjectName={selectedSubject}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Progress;