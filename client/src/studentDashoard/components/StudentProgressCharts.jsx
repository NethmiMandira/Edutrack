import React from 'react';
import { HiOutlineChartBar } from 'react-icons/hi';

const MAX_SCORE = 100;
const TERM_CONFIG = [
  {
    title: '1st Term',
    months: ['Jan', 'Feb', 'Mar', 'Apr'],
    avgColor: 'text-indigo-700 border-indigo-300',
  },
  {
    title: '2nd Term',
    months: ['May', 'Jun', 'Jul', 'Aug'],
    avgColor: 'text-violet-700 border-violet-300',
  },
  {
    title: '3rd Term',
    months: ['Sep', 'Oct', 'Nov', 'Dec'],
    avgColor: 'text-fuchsia-700 border-fuchsia-300',
  },
];

const monthShort = (isoDate) => {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString('en-US', { month: 'short' });
};

const clamp = (value) => Math.max(0, Math.min(MAX_SCORE, Number(value) || 0));

const buildTermData = (marks, termMonths) => {
  const buckets = termMonths.map((month) => ({ month, categories: new Map() }));
  const percentages = [];

  marks.forEach((entry) => {
    const month = monthShort(entry.date);
    const bucket = buckets.find((item) => item.month === month);
    if (!bucket) return;

    const category = entry.category || entry.subject || 'Assessment';
    const score = clamp(entry.marks);
    percentages.push(score);

    const current = bucket.categories.get(category) || { total: 0, count: 0 };
    bucket.categories.set(category, {
      total: current.total + score,
      count: current.count + 1,
    });
  });

  const data = buckets.map((bucket) => ({
    month: bucket.month,
    categories: Array.from(bucket.categories.entries()).map(
      ([category, summary]) => ({
        category,
        marks: Number((summary.total / summary.count).toFixed(1)),
      })
    ),
  }));

  const avg = percentages.length
    ? Number((percentages.reduce((sum, value) => sum + value, 0) / percentages.length).toFixed(2))
    : 0;

  return { data, avg };
};

const categoryColorMap = {
  MCQ: 'bg-amber-800',
  Structure: 'bg-blue-500',
  Structured: 'bg-blue-500',
  Essay: 'bg-black',
  'Essay A': 'bg-black',
  'Essay B': 'bg-red-500',
};

const fallbackColors = [
  'bg-sky-500',
  'bg-emerald-500',
  'bg-indigo-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
];

const getCategoryColor = (category) => {
  if (categoryColorMap[category]) return categoryColorMap[category];
  const index = category.length % fallbackColors.length;
  return fallbackColors[index];
};

const TermChart = ({ term }) => {
  const chartCategories = Array.from(
    new Set(
      term.data.flatMap((monthData) =>
        (monthData.categories || []).map((item) => item.category)
      )
    )
  );

  return (
    <section className="rounded-[2rem] border-2 border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiOutlineChartBar className="text-slate-700" />
          <p className="font-bold text-slate-800">{term.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            AVG
          </span>
          <div
            className={`min-w-14 rounded border bg-slate-50 px-2 py-1 text-center text-sm font-bold ${term.avgColor}`}
          >
            {term.avg}%
          </div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        {chartCategories.map((category) => (
          <div key={category} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 rounded-sm ${getCategoryColor(category)}`} />
            <span className="text-xs text-slate-600">{category}</span>
          </div>
        ))}
      </div>

      <div className="relative mr-4 ml-6 flex h-52 items-end justify-between gap-3 border-b-2 border-l-2 border-slate-300 pt-3 pr-4 pl-4">
        <span className="absolute -left-6 top-1 text-[10px] text-slate-500">100</span>
        <span className="absolute -left-6 bottom-1 text-[10px] text-slate-500">0</span>

        {term.months.map((month) => {
          const monthData = term.data.find((item) => item.month === month);
          const bars = monthData?.categories || [];

          return (
            <div
              key={month}
              className="flex h-full w-1/4 flex-col items-center justify-end"
            >
              <div className="flex h-36 w-full items-end justify-center gap-1">
                {bars.length === 0 && <div className="h-2 w-2 rounded-sm bg-slate-300" />}

                {bars.map((entry) => (
                  <div
                    key={`${month}-${entry.category}`}
                    className="flex h-full flex-col items-center justify-end"
                  >
                    <span className="mb-1 text-[9px] leading-none font-semibold text-slate-600">
                      {clamp(entry.marks)}
                    </span>
                    <div
                      className={`w-2 rounded-t-sm md:w-3 ${getCategoryColor(entry.category)}`}
                      style={{
                        height: `${Math.max(8, (clamp(entry.marks) / MAX_SCORE) * 100)}%`,
                      }}
                      title={`${month} | ${entry.category}: ${clamp(entry.marks)}/${MAX_SCORE}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-2 flex items-start justify-between gap-3 pr-0 pl-4">
        {term.months.map((month) => (
          <div key={`${term.title}-${month}`} className="w-1/4 text-center">
            <span className="text-xs text-slate-600">{month.toLowerCase()}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

const StudentProgressCharts = ({ marks = [] }) => {
  const termLayouts = TERM_CONFIG.map((term) => {
    const built = buildTermData(marks, term.months);
    return {
      title: term.title,
      months: term.months,
      data: built.data,
      avg: built.avg,
      avgColor: term.avgColor,
    };
  });

  const overallAverage = marks.length
    ? Number((marks.reduce((sum, entry) => sum + clamp(entry.marks), 0) / marks.length).toFixed(2))
    : 0;

  return (
    <div className="space-y-6">
      {termLayouts.map((term) => (
        <TermChart key={term.title} term={term} />
      ))}

      <div className="flex items-center justify-between rounded-[2rem] border-2 border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
          Overall Average
        </p>
        <p className="text-2xl font-black text-indigo-700">{overallAverage}%</p>
      </div>
    </div>
  );
};

export default StudentProgressCharts;
