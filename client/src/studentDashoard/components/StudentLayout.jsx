import React from 'react';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Hide visual scrollbars but keep vertical scroll functional */}
      <style>{`
        /* Firefox/IE */
        html, body { scrollbar-width: none; -ms-overflow-style: none; }
        /* WebKit */
        html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; height: 0; }
        /* Ensure vertical scrolling still works */
        html, body { overflow-y: auto; }
      `}</style>
      <StudentSidebar />

      {/* Mobile/Tablet Layout */}
      <div className="lg:hidden pt-14 sm:pt-16">
        <header className="sticky top-14 sm:top-16 z-20 border-b border-slate-200 bg-white/95 px-3 sm:px-4 py-3 sm:py-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">{subtitle}</p>}
            </div>
          </div>
        </header>
        <main className="p-3 sm:p-4">{children}</main>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block" style={{ marginLeft: "calc(var(--student-sidebar-width, 16rem) + 1rem)" }}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-6 md:px-8 py-5 md:py-6 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">{title}</h1>
              {subtitle && <p className="mt-1 text-sm font-medium text-slate-600">{subtitle}</p>}
            </div>
          </div>
        </header>
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
