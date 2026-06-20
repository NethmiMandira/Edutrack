import React from "react";
import { HiOutlineInbox } from "react-icons/hi";

const getSubjectNames = (subjects) => {
  if (!Array.isArray(subjects)) return "-";

  const names = subjects
    .map((subject) => (typeof subject === "string" ? "" : subject?.name || ""))
    .filter(Boolean);

  return names.length ? names.join(", ") : "-";
};

const normalizeSubjectId = (subject) => {
  if (!subject) return "";
  if (typeof subject === "string") return subject;
  return subject?._id || "";
};

export default function StudentPromotionGrid({
  students,
  selectedIds,
  onToggle,
  selectedSubjectId,
  selectedSubjectName,
}) {
  const hasRecords = students.length > 0;

  const getDisplayedSubject = (subjects) => {
    if (!selectedSubjectId) {
      return getSubjectNames(subjects);
    }

    const matchingSubject = Array.isArray(subjects)
      ? subjects.find((subject) => normalizeSubjectId(subject) === selectedSubjectId)
      : null;

    if (matchingSubject) {
      return typeof matchingSubject === "string" ? matchingSubject : matchingSubject?.name || "-";
    }

    return selectedSubjectName || "-";
  };

  return (
    <section className="mt-8 bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 px-4 sm:px-6 py-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Filtered Students</h3>
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
          {selectedIds.length} selected
        </span>
      </div>

      <div className="p-4 sm:hidden">
        {!hasRecords ? (
          <div className="py-12 flex flex-col items-center gap-3 text-slate-400 text-center">
            <HiOutlineInbox className="text-5xl text-slate-200" />
            <p className="font-medium">No students found for selected filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {students.map((student) => (
              <article key={student._id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Index No</p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">{student.indexno || "-"}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(student._id)}
                    onChange={(event) => onToggle(student._id, event.target.checked)}
                    className="mt-1 h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Name</p>
                    <p className="mt-1 font-semibold text-slate-800 break-words">
                      {[student.firstname, student.lastname].filter(Boolean).join(" ") || "Unnamed"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Grade</p>
                      <p className="mt-1 text-slate-600">{student.grade || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Year</p>
                      <p className="mt-1 text-slate-600">{student.currentYear || "-"}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Subjects</p>
                    <p className="mt-1 text-slate-600 break-words">{getDisplayedSubject(student.subjects)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-100">
              <th className="w-14 px-4 py-4">
                <span className="sr-only">Select</span>
              </th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Index No</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Student Name</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Current Grade</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Current Year</th>
              <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Subjects</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {!hasRecords ? (
              <tr>
                <td colSpan={6} className="py-16">
                  <div className="flex flex-col items-center gap-3 text-slate-400">
                    <HiOutlineInbox className="text-5xl text-slate-200" />
                    <p className="font-medium">No students found for selected filters.</p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-4 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(student._id)}
                      onChange={(event) => onToggle(student._id, event.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-600">{student.indexno || "-"}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                    {[student.firstname, student.lastname].filter(Boolean).join(" ") || "Unnamed"}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">{student.grade || "-"}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{student.currentYear || "-"}</td>
                  <td className="px-4 py-4 text-sm text-slate-600">{getDisplayedSubject(student.subjects)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
