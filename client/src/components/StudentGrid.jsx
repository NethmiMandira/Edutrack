import React, { useState, useMemo } from "react";
import {
  HiOutlinePencilAlt,
  HiOutlineTrash,
  HiOutlineInbox,
  HiOutlineSortAscending,
  HiOutlineSortDescending,
} from "react-icons/hi";

export default function StudentGrid({ students = [], onSelect, onDelete }) {
  const [sortOrder, setSortOrder] = useState("desc");

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      const dateDiff = sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      if (dateDiff !== 0) return dateDiff;
      const idA = Number(a.numericId || 0);
      const idB = Number(b.numericId || 0);
      return sortOrder === "desc" ? idB - idA : idA - idB;
    });
  }, [students, sortOrder]);

  return (
    <div className="mt-8 sm:mt-10 md:mt-12 w-full box-border animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 px-1 sm:px-2">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Student Directory
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest text-[10px]">
            Sort Date
          </span>
          <button
            onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
            className={`
              px-5 py-2.5 rounded-2xl border flex items-center gap-2 transition-all duration-300
              ${
                sortOrder === "desc"
                  ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-200"
                  : "bg-white border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
              }
            `}
          >
            {sortOrder === "desc" ? (
              <HiOutlineSortDescending className="text-xl" />
            ) : (
              <HiOutlineSortAscending className="text-xl" />
            )}
            <span className="text-sm font-bold">
              {sortOrder === "desc" ? "Newest" : "Oldest"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3 box-border">
        {sortedStudents.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 p-10 box-border">
            <div className="flex flex-col items-center gap-3">
              <HiOutlineInbox className="text-5xl text-slate-200" />
              <p className="text-slate-400 font-medium">No student records found.</p>
            </div>
          </div>
        ) : (
          sortedStudents.map((stu, idx) => (
            <article
              key={stu._id || idx}
              className="bg-white rounded-[1.25rem] border border-slate-100 shadow-sm p-4 sm:p-5 box-border"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base sm:text-lg font-bold text-slate-800">
                    {stu.firstname} {stu.lastname}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Index: {stu.indexno || "-"}</p>
                </div>
                <span className="text-xs font-bold text-slate-400">ID {stu.numericId || "-"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-700">Grade:</span> {stu.grade || "-"}</p>
                <p><span className="font-semibold text-slate-700">Year:</span> {stu.currentYear || "-"}</p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-slate-700">Contact:</span>{" "}
                  {(() => {
                    let c = stu.contact || "";
                    c = c.replace(/^\+?94/, "").replace(/^0+/, "").replace(/\D/g, "").slice(0, 9);
                    return c.length === 9 ? `+94${c}` : stu.contact || "-";
                  })()}
                </p>
                <p className="sm:col-span-2 break-words">
                  <span className="font-semibold text-slate-700">Email:</span> {stu.email || "-"}
                </p>
                <p className="sm:col-span-2">
                  <span className="font-semibold text-slate-700">Subjects:</span>{" "}
                  {Array.isArray(stu.subjects) && stu.subjects.length > 0
                    ? stu.subjects
                        .map((sub) => (typeof sub === "string" ? sub : sub?.name || ""))
                        .filter(Boolean)
                        .join(", ")
                    : "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Registered:</span>{" "}
                  {stu.date ? new Date(stu.date).toISOString().slice(0, 10) : "-"}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => onSelect(stu)}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95"
                >
                  <HiOutlinePencilAlt className="text-base" /> Update
                </button>
                <button
                  onClick={() => onDelete(stu)}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-rose-100 text-rose-500 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                >
                  <HiOutlineTrash className="text-base" /> Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 box-border w-full max-w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-4 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">ID</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Index No</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Student Name</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Grade</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Current Year</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Subjects</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Contact</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Email</th>
              <th className="px-6 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Date Registered</th>
              {/* Action column with min-width to ensure buttons are visible */}
              <th className="px-4 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest text-center min-w-[130px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan="10" className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <HiOutlineInbox className="text-5xl text-slate-200" />
                    <p className="text-slate-400 font-medium">No student records found.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedStudents.map((stu, idx) => (
                <tr key={stu._id || idx} className="group hover:bg-slate-50/80 transition-all duration-200">
                  <td className="px-4 py-4 text-sm font-bold text-slate-400 text-center">
                    {stu.numericId || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{stu.indexno}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    {stu.firstname} {stu.lastname}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{stu.grade}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{stu.currentYear || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 leading-tight">
                    {stu.subjects?.map((sub, i) => (
                      <div key={i} className="py-0.5">
                        {typeof sub === "string" ? sub : sub?.name || ""}
                      </div>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                    {(() => {
                      let c = stu.contact || "";
                      c = c.replace(/^\+?94/, "").replace(/^0+/, "").replace(/\D/g, "").slice(0, 9);
                      return c.length === 9 ? `+94${c}` : stu.contact;
                    })()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{stu.email || "-"}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {stu.date ? new Date(stu.date).toISOString().slice(0, 10) : ""}
                  </td>
                  {/* Action column with min-width and reduced padding */}
                  <td className="px-2 py-4 text-center min-w-[130px]">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <button
                        onClick={() => onSelect(stu)}
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 w-full whitespace-nowrap"
                      >
                        <HiOutlinePencilAlt className="text-sm" /> Update
                      </button>
                      <button
                        onClick={() => onDelete(stu)}
                        className="inline-flex items-center justify-center gap-1.5 bg-white border border-rose-100 text-rose-500 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 w-full whitespace-nowrap"
                      >
                        <HiOutlineTrash className="text-sm" /> Delete
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
  );
}