import React from "react";

export default function DashboardSubjectPerformance({ subjects }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Subject performance</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-xl font-black tracking-tight text-slate-900">Average by subject</h2>
        </div>
      </div>

      <div className="space-y-4">
        {subjects.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Add mark entries to see subject averages.
          </div>
        ) : (
          subjects.map((subject) => (
            <div key={subject.name} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-4 md:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 break-words">{subject.name}</p>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{subject.count} papers</p>
                </div>
                <div className="text-right">
                  <p className="text-xl sm:text-2xl font-black text-slate-900">{subject.average.toFixed(1)}%</p>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Average</p>
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500"
                  style={{ width: `${Math.min(subject.average, 100)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}