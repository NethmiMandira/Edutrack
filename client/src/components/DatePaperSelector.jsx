import React, { useEffect, useState } from "react";
import { 
  HiOutlineAcademicCap, 
  HiOutlineBookOpen, 
  HiOutlineDocumentText, 
  HiOutlineCalendar,
  HiChevronDown,
  HiOutlineX
} from "react-icons/hi";
import API from "../api";

const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];

export default function DatePaperSelector({ date, setDate, grade, setGrade, subject, setSubject, paperCategory, setPaperCategory }) {
  const [subjects, setSubjects] = useState([]);
  const [paperCategories, setPaperCategories] = useState([]);

  const isTestRecord = (name = "") => {
    const normalized = String(name).trim().toLowerCase();
    return normalized.includes("test") || normalized.includes("temp");
  };

  useEffect(() => {
    let mounted = true;
    API.get('/subjects')
      .then(res => {
        if (!mounted) return;
        const data = res.data;
        if (Array.isArray(data)) setSubjects(data.filter(item => !isTestRecord(item?.name)));
      })
      .catch(() => {});

    API.get('/categories')
      .then(res => {
        if (!mounted) return;
        const data = res.data;
        if (Array.isArray(data)) setPaperCategories(data.filter(item => !isTestRecord(item?.name)));
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  const getInputClass = (isFilled) => `
    w-full pl-12 pr-12 py-3.5 rounded-2xl border outline-none transition-all duration-300 shadow-sm appearance-none
    ${isFilled 
      ? "bg-indigo-50 border-indigo-400 text-indigo-900" 
      : "bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
    }
  `;

  return (
    <div className="mt-8 w-full max-w-full animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-8">
            
            {/* Grade Dropdown */}
            <div className="min-w-0">
              <label className={`block text-xs font-bold uppercase mb-2 tracking-widest ml-1 transition-colors ${grade ? "text-indigo-600" : "text-slate-500"}`}>
                Grade
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${grade ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <HiOutlineAcademicCap className="text-xl" />
                </div>
                <select value={grade} onChange={e => setGrade(e.target.value)} className={getInputClass(!!grade)}>
                  <option value="">Select Grade</option>
                  {grades.map(g => (<option key={g} value={g}>{g}</option>))}
                </select>
                {grade && (
                  <button onClick={() => setGrade("")} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all z-20"><HiOutlineX /></button>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all group-focus-within:rotate-180 group-focus-within:text-indigo-500">
                  <HiChevronDown className="text-lg" />
                </div>
              </div>
            </div>

            {/* Subject Dropdown */}
            <div className="min-w-0">
              <label className={`block text-xs font-bold uppercase mb-2 tracking-widest ml-1 transition-colors ${subject ? "text-indigo-600" : "text-slate-500"}`}>
                Subject
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${subject ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <HiOutlineBookOpen className="text-xl" />
                </div>
                <select value={subject} onChange={e => setSubject(e.target.value)} className={getInputClass(!!subject)}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => (<option key={s._id || s.name} value={s.name}>{s.name}</option>))}
                </select>
                {subject && (
                  <button onClick={() => setSubject("")} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all z-20"><HiOutlineX /></button>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all group-focus-within:rotate-180 group-focus-within:text-indigo-500">
                  <HiChevronDown className="text-lg" />
                </div>
              </div>
            </div>

            {/* Paper Category Dropdown */}
            <div className="min-w-0">
              <label className={`block text-xs font-bold uppercase mb-2 tracking-widest ml-1 transition-colors ${paperCategory ? "text-indigo-600" : "text-slate-500"}`}>
                Paper Category
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${paperCategory ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <HiOutlineDocumentText className="text-xl" />
                </div>
                <select value={paperCategory} onChange={e => setPaperCategory(e.target.value)} className={getInputClass(!!paperCategory)}>
                  <option value="">Select Category</option>
                  {paperCategories.map(pc => (<option key={pc._id || pc.name} value={pc.name}>{pc.name}</option>))}
                </select>
                {paperCategory && (
                  <button onClick={() => setPaperCategory("")} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all z-20"><HiOutlineX /></button>
                )}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-all group-focus-within:rotate-180 group-focus-within:text-indigo-500">
                  <HiChevronDown className="text-lg" />
                </div>
              </div>
            </div>

            {/* Date Input */}
            <div className="min-w-0">
              <label className={`block text-xs font-bold uppercase mb-2 tracking-widest ml-1 transition-colors ${date ? "text-indigo-600" : "text-slate-500"}`}>
                Exam Date
              </label>
              <div className="relative group">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${date ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
                  <HiOutlineCalendar className="text-xl" />
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={getInputClass(!!date)}
                />
                {date && (
                   <button onClick={() => setDate("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all z-20"><HiOutlineX /></button>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}