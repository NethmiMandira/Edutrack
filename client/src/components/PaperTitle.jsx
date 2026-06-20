import React, { useEffect, useState } from "react";

// Generates a paper name based on selected fields
export default function PaperTitle({ grade, subject, paperCategory, date, onTitleChange }) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (grade && subject && paperCategory && date) {
      const generated = `${grade} - ${subject} - ${paperCategory} - ${date}`;
      setTitle(generated);
      onTitleChange && onTitleChange(generated);
    } else {
      setTitle("");
      onTitleChange && onTitleChange("");
    }
  }, [grade, subject, paperCategory, date, onTitleChange]);

  return (
    <div className="mt-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 ml-1">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Generated Paper Name
        </label>
        {title && (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md uppercase tracking-tighter self-start sm:self-auto">
            Auto-Generated
          </span>
        )}
      </div>

      <div className={`
        relative w-full px-4 sm:px-6 py-4 rounded-2xl border transition-all duration-300 flex items-center min-h-[64px] bg-white
        ${title 
          ? "border-indigo-500 shadow-lg shadow-indigo-500/5 ring-4 ring-indigo-500/5" 
          : "border-slate-200 border-dashed"}
      `}>
        
        <div className="flex flex-col overflow-hidden w-full">
          {title ? (
            <span className="text-slate-700 font-medium text-base md:text-lg truncate tracking-tight">
              {title}
            </span>
          ) : (
            <span className="text-slate-400 font-normal text-sm italic">
              Select all fields to generate title...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}