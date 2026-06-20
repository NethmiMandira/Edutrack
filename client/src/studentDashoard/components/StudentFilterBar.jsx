import React from 'react';

const StudentFilterBar = ({
  subjects,
  selectedSubject,
  onSubjectChange,
  subjectDefaultLabel = 'All Subjects',
  subjectDefaultValue = 'all',
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  showDateFilters = true,
}) => {
  const gridColumns = showDateFilters ? 'md:grid-cols-3' : 'md:grid-cols-1';

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className={`grid grid-cols-1 gap-4 ${gridColumns}`}>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Subject
          </span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
            value={selectedSubject}
            onChange={(event) => onSubjectChange(event.target.value)}
          >
            <option value={subjectDefaultValue}>{subjectDefaultLabel}</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </label>

        {showDateFilters && (
          <>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                From Date
              </span>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                value={fromDate}
                onChange={(event) => onFromDateChange(event.target.value)}
              />
            </label>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                To Date
              </span>
              <input
                type="date"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-0 focus:border-slate-500"
                value={toDate}
                onChange={(event) => onToDateChange(event.target.value)}
              />
            </label>
          </>
        )}
      </div>
    </section>
  );
};

export default StudentFilterBar;
