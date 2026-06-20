import React from "react";

export default function DashboardStatCard({ label, value, detail, icon, accentClass = "text-slate-900", iconClass = "bg-slate-50 text-slate-600 border-slate-200" }) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">{label}</p>
          <div className={`mt-2 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight ${accentClass}`}>{value}</div>
          {detail && <p className="mt-2 text-sm text-slate-500 leading-relaxed break-words">{detail}</p>}
        </div>
        <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border shrink-0 ${iconClass}`}>
          <span className="text-xl">{icon}</span>
        </div>
      </div>
    </article>
  );
}