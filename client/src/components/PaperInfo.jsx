import React from "react";

export default function PaperInfo({ subject, grade, paperCategory, maxMark }) {
  // Sample data fallback
  const sample = {
    subject: "Mathematics",
    grade: "10",
    paperCategory: "Theory",
    maxMark: 100,
  };
  const displaySubject = subject || sample.subject;
  const displayGrade = grade || sample.grade;
  const displayPaperCategory = paperCategory || sample.paperCategory;
  const displayMaxMark = maxMark || sample.maxMark;

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col gap-2 border border-slate-100">
      <div className="flex flex-wrap gap-4 justify-between">
        <div>
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Subject</span>
          <span className="block text-lg text-slate-700 font-semibold">{displaySubject}</span>
        </div>
        <div>
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Grade</span>
          <span className="block text-lg text-slate-700 font-semibold">{displayGrade}</span>
        </div>
        <div>
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Paper Category</span>
          <span className="block text-lg text-slate-700 font-semibold">{displayPaperCategory}</span>
        </div>
        <div>
          <span className="block text-xs text-slate-400 font-bold uppercase tracking-widest">Max Mark</span>
          <span className="block text-lg text-slate-700 font-semibold">{displayMaxMark}</span>
        </div>
      </div>
    </div>
  );
}
// ...existing code...