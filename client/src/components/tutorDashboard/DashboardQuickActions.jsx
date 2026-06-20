import React from "react";
import { Link } from "react-router-dom";

export default function DashboardQuickActions({ actions }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Quick actions</p>
          <h2 className="mt-1 sm:mt-2 text-lg sm:text-xl font-black tracking-tight text-slate-900">Move faster</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className="group rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 sm:p-3 md:p-4 transition-all hover:border-indigo-200 hover:bg-white hover:shadow-md"
          >
            <div className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border ${action.iconTone || "border-slate-200 bg-white text-slate-600"}`}>
              <span className="text-lg sm:text-xl">{action.icon}</span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{action.label}</h3>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}