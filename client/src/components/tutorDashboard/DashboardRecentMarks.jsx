import React from "react";
import { HiOutlineClock, HiOutlineUser, HiOutlineDocumentText } from "react-icons/hi";

const scoreTone = (score) => {
  if (score >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
  return "text-rose-600 bg-rose-50 border-rose-100";
};

export default function DashboardRecentMarks({ marks, studentLookup }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Recent marks</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-xl font-black tracking-tight text-slate-900">Latest submissions</h2>
        </div>
      </div>

      <div className="space-y-3">
        {marks.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            No mark entries yet.
          </div>
        ) : (
          marks.map((mark) => {
            const student = studentLookup.get(mark.indexno) || {};
            return (
              <article
                key={mark.id}
                className="group flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 transition-all hover:border-indigo-200 hover:bg-white sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <HiOutlineClock />
                      {mark.dateLabel}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>{mark.subject || "Subject"}</span>
                  </div>

                  <h3 className="mt-2 break-words text-base font-bold text-slate-900 sm:text-lg">
                    {mark.paperName}
                  </h3>

                  <div className="mt-2 flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <span className="inline-flex items-center gap-2 break-words">
                      <HiOutlineUser className="text-slate-400" />
                      {student.name || mark.indexno}
                    </span>
                    <span className="inline-flex items-center gap-2 break-words">
                      <HiOutlineDocumentText className="text-slate-400" />
                      {mark.paperCategory || "Paper"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-2">
                  <div className={`inline-flex items-center rounded-2xl border px-3 py-2 text-base sm:px-4 sm:text-lg font-black ${scoreTone(mark.score)}`}>
                    {mark.score.toFixed(1)}%
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {mark.mark} / {mark.maxMark}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}