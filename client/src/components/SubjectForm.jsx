import React, { useState } from "react";
import { 
  HiOutlinePlus, 
  HiOutlineBookOpen,
  HiOutlineRefresh 
} from "react-icons/hi";

export default function SubjectForm({ onSave, selectedSubject = "", clearSelected, isEditing }) {
  const [subject, setSubject] = useState("");

  React.useEffect(() => {
    if (isEditing) {
      setSubject(selectedSubject);
    } else {
      setSubject("");
    }
  }, [isEditing, selectedSubject]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (subject.trim()) {
      onSave(subject.trim());
      setSubject("");
    }
  };

  return (
    <div className="mt-8 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
       

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 md:p-10">
          <div className="flex flex-col gap-5 sm:gap-6">
            {/* Input Field */}
            <div className="w-full">
              <label className="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-3 ml-1">
                Subject Name
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Advanced Physics"
                className="w-full px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end items-stretch sm:items-center mt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setSubject("");
                    clearSelected();
                  }}
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 h-[52px] sm:h-[56px] rounded-2xl bg-white border-2 border-slate-100 text-slate-500 font-bold text-[11px] sm:text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all duration-200 active:scale-95"
                >
                  <span className="text-xl font-light opacity-50 group-hover:rotate-90 transition-transform duration-300">×</span>
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={!subject.trim()}
                className={`flex items-center justify-center gap-3 px-6 sm:px-10 h-[52px] sm:h-[56px] rounded-2xl text-[11px] sm:text-xs font-bold uppercase tracking-widest transition-all active:scale-95 w-full sm:w-auto
                  ${subject.trim() 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-indigo-600" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"}
                `}
              >
                {isEditing ? <HiOutlineRefresh className="text-lg" /> : <HiOutlinePlus className="text-xl" />}
                {isEditing ? "Update Subject" : "Add Subject"}
              </button>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-50 flex items-start sm:items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[11px] text-slate-400 font-medium italic">
              Changes saved here will reflect immediately across student enrollment and grade sheets.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}