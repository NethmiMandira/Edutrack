import React, { useState, useEffect } from "react";
import { HiOutlineSave, HiOutlineX, HiOutlineRefresh } from "react-icons/hi";

export default function StudentMarkEntry({ 
  students, 
  selectedStudent, 
  setSelectedStudent, 
  mark, 
  setMark, 
  onSave, 
  showCancel = false, 
  onCancel, 
  disabled = false
}) {
  const [inputValue, setInputValue] = useState(selectedStudent || "");
  const [isFocused, setIsFocused] = useState(false);

  const studentList = Array.isArray(students) ? students : [];

  useEffect(() => {
    setInputValue(selectedStudent || "");
  }, [selectedStudent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!disabled) onSave();
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val); 
    if (setSelectedStudent) setSelectedStudent(val);
  };

  const inputBaseClass = `
    w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50 
    text-slate-700 placeholder:text-slate-400 outline-none transition-all duration-200 
    focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm
  `;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 p-4 sm:p-6 lg:p-8 flex flex-col gap-5 sm:gap-6 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Input Section */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-end">
        
        {/* Student Index No Input */}
        <div className="flex-[2] w-full min-w-0">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest ml-1">
            Student Index No
          </label>
          <div className="relative">
            <input
              type="text"
              list="student-index-datalist"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder="Type Index (STU-1001)"
              className={`${inputBaseClass} pr-12`}
              autoComplete="off"
            />
            
            {/* Clear Input Icon */}
            {inputValue && isFocused && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setInputValue("");
                  if (setSelectedStudent) setSelectedStudent("");
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 z-20 transition-colors"
              >
                <HiOutlineX className="text-lg" />
              </button>
            )}

            <datalist id="student-index-datalist">
              {studentList.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.name}
                </option>
              ))}
            </datalist>
          </div>
        </div>

        {/* Mark Input */}
        <div className="flex-1 w-full min-w-0">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest ml-1">
            Mark Entry
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={mark || ""}
            onChange={e => setMark && setMark(e.target.value)}
            onWheel={e => e.currentTarget.blur()}
            placeholder="00"
            className={inputBaseClass}
          />
        </div>
      </div>

      {/* --- ACTION BUTTON ROW --- */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end w-full mt-2 pt-6 border-t border-slate-50">
        
        {/* UPDATED CANCEL BUTTON STYLE */}
        {showCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
              group flex items-center justify-center gap-2 px-6 sm:px-8 h-[52px] sm:h-[58px] rounded-2xl 
              bg-white border-2 border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest
              hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 
              transition-all duration-300 active:scale-95 shadow-sm
            "
            style={{ minWidth: '0' }}
          >
            <HiOutlineX className="text-xl opacity-60 group-hover:rotate-90 transition-transform duration-300" />
            Cancel
          </button>
        )}
        
        {/* PRIMARY SAVE/UPDATE BUTTON */}
        <button
          type="submit"
          className={
            `flex items-center justify-center gap-3 px-6 sm:px-10 h-[52px] sm:h-[58px] rounded-2xl 
            font-bold shadow-lg transition-all text-xs uppercase tracking-widest active:scale-95
            ${disabled ? 'bg-slate-300 text-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-indigo-600 text-white'}`
          }
          style={{ minWidth: '0' }}
          disabled={disabled}
        >
          {showCancel ? (
            <HiOutlineRefresh className="text-xl animate-in spin-in-180 duration-500" />
          ) : (
            <HiOutlineSave className="text-xl" />
          )}
          {showCancel ? "Update" : "Save"}
        </button>
      </div>

      {/* Optional Helper Text */}
      <div className="flex items-center gap-2 ml-1">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-[11px] text-slate-400 font-medium italic">
          Verify index number before saving to ensure data integrity.
        </p>
      </div>
    </form>
  );
}