import React, { useState, useEffect, useRef } from "react";
import API from '../api';
import { useNavigate } from "react-router-dom";
import { 
  HiOutlineUser, 
  HiOutlineIdentification, 
  HiOutlineAcademicCap, 
  HiOutlineBookOpen, 
  HiOutlinePhone, 
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlinePlusCircle,
  HiOutlineSave,
  HiOutlineX,
  HiOutlineRefresh,
  HiChevronDown
} from "react-icons/hi";

// --- CONSTANTS ---
const grades = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const currentYears = Array.from({ length: 41 }, (_, i) => String(2010 + i));

/**
 * Dynamic class helper: 
 * Using solid hex-like colors to prevent browser engine inconsistencies.
 */
const getInputClass = (isFilled) => `
  w-full pr-10 py-3.5 rounded-2xl border outline-none transition-all duration-300
  ${isFilled 
    ? "bg-indigo-50 border-indigo-400 text-slate-800 shadow-sm" 
    : "bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"}
`;

const InputWrapper = ({ label, icon: Icon, children, showClear, onClear, isFilled }) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${isFilled ? 'text-indigo-600' : 'text-slate-500'}`}>
      {label}
    </label>
    <div className="relative group">
      <div className={`absolute left-4 top-4 transition-colors z-10 pointer-events-none ${isFilled ? 'text-indigo-500' : 'text-slate-400 group-focus-within:text-indigo-500'}`}>
        <Icon className="text-xl" />
      </div>
      {children}
      {showClear && (
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 focus:outline-none z-20 transition-all"
          style={{ padding: 0 }}
          tabIndex={0}
          aria-label="Clear field"
          onClick={onClear}
        >
          <HiOutlineX className="text-lg" />
        </button>
      )}
    </div>
  </div>
);

export default function StudentForm({ onSave, onUpdate, selectedStudent, clearFormFlag, onClearFormHandled }) {
  const navigate = useNavigate();
  
  const getToday = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  };

  const initialFormState = {
    firstname: "",
    lastname: "",
    indexno: "",
    grade: "",
    currentYear: "",
    subjects: [],
    contact: "",
    email: "",
    date: getToday(),
  };

  const [form, setForm] = useState(initialFormState);
  const [subjectInput, setSubjectInput] = useState("");
  const subjectInputRef = useRef();
  const [allSubjects, setAllSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);
  const [subjectsError, setSubjectsError] = useState("");

  useEffect(() => {
    setSubjectsLoading(true);
    API.get('/subjects')
      .then(res => {
        const data = res.data;
        if (Array.isArray(data)) setAllSubjects(data.map(s => ({ _id: s._id, name: s.name })));
      })
      .catch((err) => {
        console.error('Failed to load subjects', err);
        setSubjectsError(err.response?.data?.error || err.message || "Failed to load subjects");
      })
      .finally(() => setSubjectsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      let cleanContact = (selectedStudent.contact || "").replace(/^\+?94/, "").replace(/^0+/, "").replace(/\D/g, "").slice(0, 9);
      let subjIds = [];
      if (Array.isArray(selectedStudent.subjects)) {
        subjIds = selectedStudent.subjects.map(s => {
          if (typeof s === 'object' && s !== null && s._id) return s._id;
          if (typeof s === 'string') return s;
          return null;
        }).filter(Boolean);
      } else if (Array.isArray(selectedStudent.subject)) {
        subjIds = selectedStudent.subject.map(s => {
          if (typeof s === 'object' && s !== null && s._id) return s._id;
          if (typeof s === 'string') return s;
          return null;
        }).filter(Boolean);
      }
      setForm({
        ...selectedStudent,
        contact: cleanContact,
        email: selectedStudent.email || "",
        currentYear: selectedStudent.currentYear ? String(selectedStudent.currentYear) : "",
        subjects: subjIds,
        date: selectedStudent.date ? new Date(selectedStudent.date).toISOString().split('T')[0] : getToday(),
      });
    } else {
      setForm(initialFormState);
    }
  }, [selectedStudent]);

  // Clear form when clearFormFlag is set (from parent)
  useEffect(() => {
    if (clearFormFlag) {
      setForm(initialFormState);
      if (onClearFormHandled) onClearFormHandled();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearFormFlag]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = (value) => {
    const selectedName = value.trim();
    const found = allSubjects.find(s => s.name === selectedName);
    if (found && !form.subjects.includes(found._id)) {
      setForm(prev => ({ ...prev, subjects: [...prev.subjects, found._id] }));
    }
    setSubjectInput("");
  };

  const isFormValid =
    form.firstname.trim() &&
    form.lastname.trim() &&
    form.indexno.trim() &&
    form.grade.trim() &&
    form.currentYear &&
    form.subjects.length > 0 &&
    form.contact.length === 9 &&
    form.date;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const submissionData = { ...form, contact: "+94" + form.contact };
    selectedStudent ? onUpdate(submissionData) : onSave(submissionData);
    // Do not clear form here; clear only on success from parent
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white rounded-[1.5rem] sm:rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 box-border animate-in fade-in zoom-in-95 duration-500"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* First Name */}
        <InputWrapper 
          label="First Name" icon={HiOutlineUser} 
          showClear={!!form.firstname} onClear={() => setForm(f => ({ ...f, firstname: "" }))}
          isFilled={!!form.firstname.trim()}
        >
          <input name="firstname" value={form.firstname} onChange={handleChange} className={getInputClass(!!form.firstname.trim()) + " pl-12"} placeholder="John" required />
        </InputWrapper>

        {/* Last Name */}
        <InputWrapper 
          label="Last Name" icon={HiOutlineUser} 
          showClear={!!form.lastname} onClear={() => setForm(f => ({ ...f, lastname: "" }))}
          isFilled={!!form.lastname.trim()}
        >
          <input name="lastname" value={form.lastname} onChange={handleChange} className={getInputClass(!!form.lastname.trim()) + " pl-12"} placeholder="Doe" required />
        </InputWrapper>

        {/* Index Number */}
        <InputWrapper 
          label="Index Number" icon={HiOutlineIdentification} 
          showClear={!!form.indexno} onClear={() => setForm(f => ({ ...f, indexno: "" }))}
          isFilled={!!form.indexno.trim()}
        >
          <input name="indexno" value={form.indexno} onChange={handleChange} className={getInputClass(!!form.indexno.trim()) + " pl-12"} placeholder="STU-2024-XXX" required />
        </InputWrapper>

        {/* Grade Select - FIXED STYLE */}
        <InputWrapper 
          label="Grade" icon={HiOutlineAcademicCap} 
          isFilled={!!form.grade}
        >
          <div className="relative w-full">
            <select 
              name="grade" 
              value={form.grade} 
              onChange={handleChange} 
              // Added "appearance-none" and forced background color logic
              className={`${getInputClass(!!form.grade)} pl-12 appearance-none cursor-pointer`}
              style={{ backgroundColor: !!form.grade ? '#eef2ff' : '' }} // Forced Indigo-50 hex if filled
              required
            >
              <option value="" disabled className="bg-white">Select Grade</option>
              {grades.map((g) => <option key={g} value={g} className="bg-white text-slate-700">{g}</option>)}
            </select>
            {/* Custom Arrow because appearance-none hides the default one */}
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${!!form.grade ? 'text-indigo-500' : 'text-slate-400'}`}>
              <HiChevronDown className="text-xl" />
            </div>
          </div>
        </InputWrapper>

        {/* Current Year Select */}
        <InputWrapper
          label="Current Year"
          icon={HiOutlineCalendar}
          isFilled={!!form.currentYear}
        >
          <div className="relative w-full">
            <select
              name="currentYear"
              value={form.currentYear}
              onChange={handleChange}
              className={`${getInputClass(!!form.currentYear)} pl-12 appearance-none cursor-pointer`}
              style={{ backgroundColor: !!form.currentYear ? '#eef2ff' : '' }}
              required
            >
              <option value="" disabled className="bg-white">Select Current Year</option>
              {currentYears.map((year) => (
                <option key={year} value={year} className="bg-white text-slate-700">{year}</option>
              ))}
            </select>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${!!form.currentYear ? 'text-indigo-500' : 'text-slate-400'}`}>
              <HiChevronDown className="text-xl" />
            </div>
          </div>
        </InputWrapper>

        {/* Subjects Section */}
        <div className="col-span-1 md:col-span-2 space-y-4">
          <InputWrapper label="Subjects" icon={HiOutlineBookOpen} isFilled={form.subjects.length > 0}>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative w-full">
                <input
                  ref={subjectInputRef}
                  className={getInputClass(false) + " pl-12 pr-10"}
                  value={subjectInput}
                  onChange={e => setSubjectInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddSubject(subjectInput))}
                  placeholder={subjectsLoading ? "Loading..." : (subjectsError ? subjectsError : "Type or select subject...")}
                  list="subject-list"
                />
                <datalist id="subject-list">
                      {allSubjects.map((sub) => <option key={sub._id} value={sub.name} />)}
                </datalist>
              </div>
              <button type="button" onClick={() => navigate('/subjects')} className="px-5 bg-white border border-slate-200 rounded-2xl hover:text-indigo-600 shadow-sm transition-all flex items-center justify-center h-[52px] w-full sm:w-auto">
                <HiOutlinePlusCircle className="text-2xl" />
              </button>
            </div>
          </InputWrapper>
          <div className={`min-h-[60px] p-4 rounded-2xl border transition-all duration-300 flex flex-wrap gap-2 ${form.subjects.length > 0 ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-dashed border-slate-200'}`}>
            {form.subjects.length === 0 && <span className="text-slate-400 text-xs italic">No subjects selected</span>}
            {form.subjects.map(subId => {
              const subj = allSubjects.find(s => s._id === subId);
              return (
                <span key={subId} className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl shadow-sm">
                  {subj ? subj.name : 'Loading...'}
                  <button type="button" aria-label={`Remove ${subj ? subj.name : 'subject'}`} onClick={() => setForm(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subId) }))} className="cursor-pointer hover:text-rose-500 focus:outline-none">
                    <HiOutlineX />
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        {/* Contact Field */}
        <InputWrapper 
          label="Contact" icon={HiOutlinePhone} 
          showClear={!!form.contact} onClear={() => setForm(f => ({ ...f, contact: "" }))}
          isFilled={form.contact.length === 9}
        >
          <div className="relative flex items-center">
            <span className={`absolute left-12 font-bold border-r pr-3 transition-colors ${form.contact.length === 9 ? 'text-indigo-600 border-indigo-200' : 'text-slate-900 border-slate-200'}`}>+94</span>
            <input
              name="contact"
              value={form.contact}
              onChange={e => setForm(p => ({ ...p, contact: e.target.value.replace(/\D/g, '').replace(/^0/, '').slice(0, 9) }))}
              className={getInputClass(form.contact.length === 9) + " pl-[5.5rem] font-medium"}
              placeholder="712345678"
              required
            />
          </div>
        </InputWrapper>

        {/* Email Field */}
        <InputWrapper
          label="Email"
          icon={HiOutlineMail}
          showClear={!!form.email}
          onClear={() => setForm(f => ({ ...f, email: "" }))}
          isFilled={!!form.email.trim()}
        >
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={getInputClass(!!form.email.trim()) + " pl-12"}
            placeholder="student@example.com"
          />
        </InputWrapper>

        {/* Date Field - FIXED STYLE */}
        <InputWrapper label="Date Registered" icon={HiOutlineCalendar} isFilled={!!form.date}>
          <input 
            name="date" 
            type="date" 
            value={form.date} 
            onChange={handleChange} 
            className={`${getInputClass(!!form.date)} pl-12 cursor-pointer`} 
            style={{ backgroundColor: !!form.date ? '#eef2ff' : '' }} // Forced Indigo-50 hex
            required 
          />
        </InputWrapper>
      </div>

      {/* --- Action Buttons --- */}
      <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-end pt-8 border-t border-slate-50">
        {selectedStudent && (
          <button
            type="button"
            onClick={() => onUpdate(undefined)}
            className="group flex items-center justify-center gap-2 px-8 h-[58px] rounded-2xl bg-white border-2 border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all"
          >
            <HiOutlineX className="text-xl group-hover:rotate-90 transition-transform" />
            Cancel
          </button>
        )}
        
        <button
          type="submit"
          disabled={!isFormValid}
          className="flex items-center justify-center gap-3 px-12 h-[58px] rounded-2xl font-bold text-xs uppercase tracking-widest text-white bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-lg transition-all transform active:scale-[0.98]"
        >
          {selectedStudent ? <HiOutlineRefresh className="text-xl" /> : <HiOutlineSave className="text-xl" />}
          {selectedStudent ? "Update Student" : "Register Student"}
        </button>
      </div>
    </form>
  );
}