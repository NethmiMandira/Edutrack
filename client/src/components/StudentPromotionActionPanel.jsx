import React from "react";
import { 
  HiOutlineArrowNarrowUp, 
  HiOutlineAcademicCap, 
  HiOutlineCalendar 
} from "react-icons/hi";

const gradeOrder = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];

const getGradeRank = (grade) => gradeOrder.indexOf(grade);
const getYearNumber = (year) => Number(year);

export default function StudentPromotionActionPanel({
  grades,
  years,
  promotionInput,
  onPromotionInputChange,
  onPassStudents,
  selectedCount,
  loading,
  currentGrade,
  currentYear,
}) {
  const currentGradeRank = getGradeRank(currentGrade);
  const validTargetGrades = grades.filter((grade) => getGradeRank(grade) > currentGradeRank);
  const currentYearNumber = getYearNumber(currentYear);
  const validTargetYears = years.filter((year) => getYearNumber(year) > currentYearNumber);

  const isTargetGradeValid = promotionInput.grade
    ? getGradeRank(promotionInput.grade) > currentGradeRank
    : false;
  const isTargetYearValid = promotionInput.year
    ? getYearNumber(promotionInput.year) > currentYearNumber
    : false;

  const canSubmit = Boolean(isTargetGradeValid && isTargetYearValid && selectedCount > 0 && !loading);
  const getInputClass = (isFilled) => `
    w-full min-w-0 pl-12 pr-10 appearance-none rounded-2xl border outline-none transition-all duration-300 px-4 py-3 text-sm font-medium
    ${isFilled
      ? "bg-indigo-50 border-indigo-400 text-indigo-900"
      : "bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
    }
  `;

  return (
    <section className="mt-8 bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pass To Grade */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Pass To Grade</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <HiOutlineAcademicCap className="text-xl" />
            </div>
            <select
              value={promotionInput.grade}
              onChange={(event) => onPromotionInputChange("grade", event.target.value)}
              disabled={!currentGrade}
              className={getInputClass(!!promotionInput.grade)}
            >
              <option value="">{currentGrade ? "Select Higher Grade" : "Select Current Grade First"}</option>
              {validTargetGrades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pass To Year */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Pass To Year</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <HiOutlineCalendar className="text-xl" />
            </div>
            <select
              value={promotionInput.year}
              onChange={(event) => onPromotionInputChange("year", event.target.value)}
              disabled={!currentYear}
              className={getInputClass(!!promotionInput.year)}
            >
              <option value="">{currentYear ? "Select Higher Year" : "Select Current Year First"}</option>
              {validTargetYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Promotion Button */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={onPassStudents}
            disabled={!canSubmit}
            className="w-full h-[50px] rounded-2xl bg-emerald-600 text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-emerald-500 transition-all disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg shadow-emerald-200/50"
          >
            <HiOutlineArrowNarrowUp className="text-lg" />
            {loading ? "Passing..." : `Pass ${selectedCount} Students`}
          </button>
        </div>
      </div>
    </section>
  );
}