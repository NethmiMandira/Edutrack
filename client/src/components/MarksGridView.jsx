import React, { useState, useMemo } from "react";
import { HiOutlinePencilAlt, HiOutlineTrash, HiOutlineSortAscending, HiOutlineSortDescending } from "react-icons/hi";

export default function MarksGridView({ 
  data = [], 
  onEdit, 
  onDelete 
}) {
  const [sortOrder, setSortOrder] = useState("desc");

  const displayMarks = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [data, sortOrder]);

  const marksWithIds = useMemo(() => {
    return displayMarks.map((row, index) => ({
      ...row,
      generatedId:
        row.id ||
        row._id ||
        `mark-${row.indexno || "unknown"}-${row.date || "no-date"}-${index}`,
    }));
  }, [displayMarks]);

  // --- UPDATED EMPTY STATE SECTION ---
  if (displayMarks.length === 0) {
    return (
      <div className="mt-12 w-full max-w-full">
        <div className="py-16 sm:py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
          <p className="text-slate-400 font-medium tracking-wide">No examination records found.</p>
        </div>
      </div>
    );
  }

  // --- DATA STATE ---
  return (
    <div className="mt-12 w-full max-w-full animate-in fade-in duration-500">
      
      <div className="mb-6 px-1 sm:px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Examination Ledger
        </h3>
        
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sort Date</span>
          <button
            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
            className={`
              px-4 py-2 rounded-xl border flex items-center gap-2 transition-all duration-300
              ${sortOrder === "desc" 
                ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200" 
                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600"}
            `}
          >
            {sortOrder === "desc" ? <HiOutlineSortDescending className="text-lg" /> : <HiOutlineSortAscending className="text-lg" />}
            <span className="text-xs font-bold">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </button>
        </div>
      </div>

      <div className="hidden lg:block bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[1180px] table-fixed border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="w-[8%] px-4 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">ID</th>
                <th className="w-[14%] px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Date</th>
                <th className="w-[28%] px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Paper</th>
                <th className="w-[18%] px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Index No</th>
                <th className="w-[12%] px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest text-center">Score</th>
                <th className="w-[20%] px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-50">
              {marksWithIds.map((row) => (
                <tr key={row.generatedId} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="px-4 py-4 text-sm font-bold text-slate-400 text-center">
                    {row.numericId || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 whitespace-nowrap">
                    {row.date ? new Date(row.date).toLocaleDateString('en-GB') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800 max-w-[200px] truncate">{row.paperName}</td>
                  <td className="pl-6 pr-3 py-4 text-sm text-slate-600">{row.indexno}</td>
                  <td className="pl-3 pr-6 py-4 text-center">
                    <span className="text-sm font-black text-indigo-600 px-3 py-1 rounded-lg">
                      {row.mark}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <button 
                        onClick={() => onEdit(row)} 
                        className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 w-auto"
                      >
                        <HiOutlinePencilAlt className="text-base" />
                        Update
                      </button>
                      <button 
                        onClick={() => onDelete(row)} 
                        className="inline-flex items-center gap-2 bg-white border border-rose-100 text-rose-500 px-3 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 w-auto"
                      >
                        <HiOutlineTrash className="text-base" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:hidden space-y-3 sm:space-y-4">
        {marksWithIds.map((row) => (
          <article key={row.generatedId} className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Paper</p>
                <h4 className="text-sm sm:text-base font-bold text-slate-800 break-words">{row.paperName}</h4>
                <p className="text-xs text-slate-500 mt-1">{row.date ? new Date(row.date).toLocaleDateString('en-GB') : '-'}</p>
              </div>
              <span className="text-xs font-bold text-slate-400 flex-shrink-0">ID {row.numericId || '—'}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Index No</p>
                <p className="text-slate-700 font-medium break-words">{row.indexno}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">Score</p>
                <p className="text-indigo-600 font-black">{row.mark}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onEdit(row)}
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 w-full sm:flex-1"
              >
                <HiOutlinePencilAlt className="text-base" />
                Update
              </button>
              <button
                onClick={() => onDelete(row)}
                className="inline-flex items-center justify-center gap-2 bg-white border border-rose-100 text-rose-500 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 w-full sm:flex-1"
              >
                <HiOutlineTrash className="text-base" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}