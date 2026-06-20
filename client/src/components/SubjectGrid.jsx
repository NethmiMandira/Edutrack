import React, { useMemo } from "react";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineInbox
} from "react-icons/hi";

const noop = () => {};

export default function SubjectGrid({ subjects = [], onEdit = noop, onDelete = noop }) {
  const sortedSubjects = useMemo(() => {
    return subjects
      .map((subj, sourceIndex) => ({ subj, sourceIndex }))
      .sort((a, b) => {
        const aId = Number(a.subj?.numericId);
        const bId = Number(b.subj?.numericId);
        const aHasId = Number.isFinite(aId);
        const bHasId = Number.isFinite(bId);

        if (aHasId && bHasId) return aId - bId;
        if (aHasId) return -1;
        if (bHasId) return 1;
        return a.sourceIndex - b.sourceIndex;
      });
  }, [subjects]);

  return (
    <div className="mt-12 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="mb-8 px-2 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 sm:gap-0">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Academic Curriculum
          </h3>
        </div>
        <div className="hidden md:block text-right">
          
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="p-4 sm:hidden">
          {subjects.length === 0 ? (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <HiOutlineInbox className="text-6xl text-slate-100" />
                <p className="text-slate-400 font-medium italic">No subjects added to the database.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedSubjects.map(({ subj, sourceIndex }) => (
                <article key={subj._id || sourceIndex} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">ID</p>
                      <p className="mt-1 font-mono text-sm font-bold text-indigo-500">{subj.numericId || "—"}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Subject Name</p>
                    <p className="mt-1 text-sm font-bold text-slate-800 break-words">{subj.name}</p>
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <button
                      onClick={() => onEdit(sourceIndex)}
                      className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-3 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95"
                    >
                      <HiOutlinePencilAlt className="text-base" />
                      Update
                    </button>
                    <button
                      onClick={() => onDelete(sourceIndex)}
                      className="flex items-center justify-center gap-2 bg-white border border-rose-100 text-rose-500 px-5 py-3 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95"
                    >
                      <HiOutlineTrash className="text-base" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest w-32">
                  ID
                </th>
                <th className="px-10 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">
                  Subject Name
                </th>
                <th className="px-10 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {subjects.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <HiOutlineInbox className="text-6xl text-slate-100" />
                      <p className="text-slate-400 font-medium italic">No subjects added to the database.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedSubjects.map(({ subj, sourceIndex }, idx) => (
                  <tr key={subj._id || idx} className="group hover:bg-slate-50/60 transition-all duration-200">
                    {/* Numeric ID Column */}
                    <td className="px-10 py-6 text-sm font-mono font-bold text-indigo-500">
                      {subj.numericId || "—"}
                    </td>
                    
                    {/* Subject Name Column */}
                    <td className="px-10 py-6 text-sm font-bold text-slate-800">
                      {subj.name}
                    </td>

                    {/* Action Buttons Column */}
                    <td className="px-10 py-6">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onEdit(sourceIndex)}
                          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95"
                        >
                          <HiOutlinePencilAlt className="text-base" />
                          Update
                        </button>
                        <button
                          onClick={() => onDelete(sourceIndex)}
                          className="flex items-center gap-2 bg-white border border-rose-100 text-rose-500 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95"
                        >
                          <HiOutlineTrash className="text-base" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}