import React from "react";
import { 
  HiOutlineFilter, 
  HiOutlineAcademicCap, 
  HiOutlineCalendar, 
  HiOutlineBookOpen,
  HiChevronDown,
  HiOutlineX 
} from "react-icons/hi";

export default function StudentPromotionFilterPanel({
  grades,
  years,
  subjects,
  filterInput,
  onFilterInputChange,
  onFilterApply,
  loading,
}) {
  // Utility for consistent indigo styling
  const getInputClass = (isFilled) => `
    w-full min-w-0 pl-12 pr-10 appearance-none rounded-2xl border outline-none transition-all duration-300 px-4 py-3 text-sm font-medium
    ${isFilled 
      ? "bg-indigo-50 border-indigo-400 text-indigo-900" 
      : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
    }
  `;

  return (
    <section className="bg-white p-4 sm:p-5 lg:p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Current Grade */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${filterInput.grade ? "text-indigo-600" : "text-slate-500"}`}>
            Current Grade
          </label>
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${filterInput.grade ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
              <HiOutlineAcademicCap className="text-xl" />
            </div>
            <select
              value={filterInput.grade}
              onChange={(e) => onFilterInputChange("grade", e.target.value)}
              className={getInputClass(!!filterInput.grade)}
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${filterInput.grade ? "text-indigo-500" : "text-slate-400"}`}>
              <HiChevronDown className="text-lg" />
            </div>
          </div>
        </div>

        {/* Current Year */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${filterInput.year ? "text-indigo-600" : "text-slate-500"}`}>
            Current Year
          </label>
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${filterInput.year ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
              <HiOutlineCalendar className="text-xl" />
            </div>
            <select
              value={filterInput.year}
              onChange={(e) => onFilterInputChange("year", e.target.value)}
              className={getInputClass(!!filterInput.year)}
            >
              <option value="">Select Year</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${filterInput.year ? "text-indigo-500" : "text-slate-400"}`}>
              <HiChevronDown className="text-lg" />
            </div>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className={`text-xs font-bold uppercase tracking-wider ml-1 transition-colors duration-300 ${filterInput.subjectId ? "text-indigo-600" : "text-slate-500"}`}>
            Subject
          </label>
          <div className="relative group">
            <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${filterInput.subjectId ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"}`}>
              <HiOutlineBookOpen className="text-xl" />
            </div>
            <select
              value={filterInput.subjectId}
              onChange={(e) => onFilterInputChange("subjectId", e.target.value)}
              className={getInputClass(!!filterInput.subjectId)}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject._id} value={subject._id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${filterInput.subjectId ? "text-indigo-500" : "text-slate-400"}`}>
              <HiChevronDown className="text-lg" />
            </div>
          </div>
        </div>

        {/* Filter Button */}
        <div className="sm:col-span-2 xl:col-span-1 flex items-end">
          <button
            type="button"
            onClick={onFilterApply}
            disabled={loading}
            className="w-full h-[48px] sm:h-[50px] rounded-2xl bg-indigo-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            <HiOutlineFilter className="text-lg" />
            {loading ? "Filtering..." : "Filter Students"}
          </button>
        </div>
      </div>
    </section>
  );
}