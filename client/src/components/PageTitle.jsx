import React from "react";

export default function PageTitle({ title, subtitle, children, className = "" }) {
  return (
    <div className={`relative mb-6 md:mb-8 group ${className}`}>
      {/* Decorative Background Blur - Hidden on small mobile for performance */}
      <div className="absolute -left-4 -top-4 w-24 h-24 bg-indigo-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none hidden sm:block" />

      {/* Main Container: Column on mobile, Row on Tablet/Desktop */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 md:gap-6">
        
        <div className="flex flex-col gap-1.5">
          {/* Title: Adjusted scale for better mobile fit */}
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          
          {subtitle && (
            <p className="text-slate-500 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Slot: Wrap buttons on small screens so they don't break the layout */}
        {children && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 md:mt-0">
            {children}
          </div>
        )}
      </div>

      {/* Clean Underline: Thinner on mobile, slightly thicker on desktop */}
      <div className="mt-4 md:mt-6 w-full h-[1px] md:h-[2px] bg-slate-100 md:bg-slate-200/60" />
    </div>
  );
}