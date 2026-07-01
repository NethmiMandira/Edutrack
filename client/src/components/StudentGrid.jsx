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
      const idA = Number(a.numericId || 0);
      const idB = Number(b.numericId || 0);
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      const newestFirst = idA !== 0 || idB !== 0 ? idB - idA : dateB - dateA;
      return sortOrder === "desc" ? newestFirst : -newestFirst;
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

      {/* Mobile Cards (hidden on tablet and up) */}
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
                <p>
                  <span className="font-semibold text-slate-700">Grade:</span> {stu.grade || "-"}
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Year:</span> {stu.currentYear || "-"}
                </p>
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
                  title="Update Student"
                >
                  <HiOutlinePencilAlt className="text-base" />
                  Update
                </button>
                <button
                  onClick={() => onDelete(stu)}
                  className="inline-flex items-center justify-center gap-2 bg-white border border-rose-100 text-rose-500 px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                  title="Delete Student"
                >
                  <HiOutlineTrash className="text-base" />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Tablet / Desktop Grid Layout – horizontal scroll restored via student-grid-scroll */}
      <div className="hidden md:block w-full overflow-x-auto student-grid-scroll">
        <div className="min-w-[1250px] bg-white text-[13px] xl:text-sm">
          {/* Header row */}
          <div className="grid grid-cols-[5%_13%_18%_8%_8%_13%_10%_13%_8%_4%] border-b border-slate-200">
            <div className="px-1.5 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide text-center">
              ID
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Index No
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Name
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Grade
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Year
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Subjects
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Contact
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Email
            </div>
            <div className="px-2 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide">
              Registered
            </div>
            <div className="px-1 py-3 font-bold text-slate-600 text-[10px] uppercase tracking-wide text-center">
              Action
            </div>
          </div>

          {/* Data rows */}
          <div className="divide-y divide-slate-100">
            {sortedStudents.length === 0 ? (
              <div className="grid grid-cols-1">
                <div className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <HiOutlineInbox className="text-5xl text-slate-200" />
                    <p className="text-slate-400 font-medium">No student records found.</p>
                  </div>
                </div>
              </div>
            ) : (
              sortedStudents.map((stu, idx) => (
                <div
                  key={stu._id || idx}
                  className="grid grid-cols-[5%_13%_18%_8%_8%_13%_10%_13%_8%_4%] items-center"
                >
                  {/* ID */}
                  <div className="px-1.5 py-2.5 font-bold text-slate-400 text-center truncate">
                    {stu.numericId || "—"}
                  </div>
                  {/* Index No */}
                  <div className="px-2 py-2.5 font-medium text-slate-500 truncate">
                    {stu.indexno || "-"}
                  </div>
                  {/* Name */}
                  <div className="px-2 py-2.5 font-bold text-slate-800 truncate">
                    {stu.firstname} {stu.lastname}
                  </div>
                  {/* Grade */}
                  <div className="px-2 py-2.5 text-slate-600 truncate">{stu.grade || "-"}</div>
                  {/* Current Year */}
                  <div className="px-2 py-2.5 text-slate-600 truncate">
                    {stu.currentYear || "-"}
                  </div>
                  {/* Subjects (comma list, wraps instead of forcing width) */}
                  <div className="px-2 py-2.5 text-slate-600 leading-tight break-words">
                    {Array.isArray(stu.subjects) && stu.subjects.length > 0
                      ? stu.subjects
                          .map((sub) => (typeof sub === "string" ? sub : sub?.name || ""))
                          .filter(Boolean)
                          .join(", ")
                      : "-"}
                  </div>
                  {/* Contact (formatted with +94) */}
                  <div className="px-2 py-2.5 text-slate-600 font-medium truncate">
                    {(() => {
                      let c = stu.contact || "";
                      c = c.replace(/^\+?94/, "").replace(/^0+/, "").replace(/\D/g, "").slice(0, 9);
                      return c.length === 9 ? `+94${c}` : stu.contact || "-";
                    })()}
                  </div>
                  {/* Email */}
                  <div className="px-2 py-2.5 text-slate-600 truncate">{stu.email || "-"}</div>
                  {/* Date Registered */}
                  <div className="px-2 py-2.5 text-slate-500 truncate">
                    {stu.date ? new Date(stu.date).toISOString().slice(0, 10) : ""}
                  </div>
                  {/* Action buttons */}
                  <div className="px-1 py-2.5 text-center">
                    <div className="flex flex-col justify-center items-stretch gap-1">
                      <button
                        onClick={() => onSelect(stu)}
                        className="inline-flex items-center justify-center gap-1 bg-white border border-slate-200 text-slate-700 px-1.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 w-full"
                        title="Update Student"
                      >
                        <HiOutlinePencilAlt className="text-sm" />
                      </button>
                      <button
                        onClick={() => onDelete(stu)}
                        className="inline-flex items-center justify-center gap-1 bg-white border border-rose-100 text-rose-500 px-1.5 py-1.5 rounded-lg text-[10px] font-bold shadow-sm hover:bg-rose-600 hover:text-white transition-all active:scale-95 w-full"
                        title="Delete Student"
                      >
                        <HiOutlineTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}