import React, { useEffect, useState } from "react";
import { HiOutlineChartBar } from "react-icons/hi";
import API from '../api';

const MAX_SCORE = 100;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];
const TERM_CONFIG = [
  { title: "1st Term", months: ["Jan", "Feb", "Mar", "Apr"], avgColor: "text-indigo-700 border-indigo-300" },
  { title: "2nd Term", months: ["May", "June", "July", "Aug"], avgColor: "text-violet-700 border-violet-300" },
  { title: "3rd Term", months: ["Sep", "Oct", "Nov", "Dec"], avgColor: "text-fuchsia-700 border-fuchsia-300" },
];

const clampScore = (value) => Math.max(0, Math.min(MAX_SCORE, Number(value) || 0));

const toPercentage = (mark, maxMark) => {
  const safeMax = Number(maxMark) || MAX_SCORE;
  if (!safeMax) return 0;
  return clampScore((Number(mark) / safeMax) * 100);
};

const emptyProgress = () => ({
  term1: { data: [], avg: 0 },
  term2: { data: [], avg: 0 },
  term3: { data: [], avg: 0 },
  averages: { term1: 0, term2: 0, term3: 0, overall: 0 },
});

const ProgressCharts = ({ studentIndexNo, subjectName }) => {
  const [progressData, setProgressData] = useState(emptyProgress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!studentIndexNo || !subjectName) {
      setProgressData(emptyProgress());
      setError("");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const buildTermData = (marks, months) => {
      const monthBuckets = months.map((month) => ({
        month,
        categories: new Map(),
      }));
      const percentages = [];

      marks.forEach((entry) => {
        const parsedDate = new Date(entry.date);
        if (Number.isNaN(parsedDate.getTime())) return;

        const monthName = MONTHS[parsedDate.getMonth()];
        const monthBucket = monthBuckets.find((bucket) => bucket.month === monthName);
        if (!monthBucket) return;

        const category = entry.paperCategory || entry.subject || "Assessment";
        const percentage = toPercentage(entry.mark, entry.maxMark);
        percentages.push(percentage);

        const current = monthBucket.categories.get(category) || { total: 0, count: 0 };
        monthBucket.categories.set(category, {
          total: current.total + percentage,
          count: current.count + 1,
        });
      });

      const data = monthBuckets.map((bucket) => ({
        month: bucket.month,
        categories: Array.from(bucket.categories.entries()).map(([category, summary]) => ({
          category,
          marks: Number((summary.total / summary.count).toFixed(1)),
        })),
      }));

      const avg = percentages.length
        ? Number((percentages.reduce((sum, value) => sum + value, 0) / percentages.length).toFixed(2))
        : 0;

      return { data, avg };
    };

    const fetchProgress = async () => {
      setIsLoading(true);
      setError("");

      try {
        const response = await API.get('/marks', { signal: controller.signal });
        const data = response.data;
        const allMarks = Array.isArray(data) ? data : [];
        const normalizedSubject = String(subjectName || "").trim().toLowerCase();
        const studentMarks = allMarks.filter((entry) => {
          const matchesStudent = String(entry.indexno) === String(studentIndexNo);
          const matchesSubject = normalizedSubject
            ? String(entry.subject || "").trim().toLowerCase() === normalizedSubject
            : true;
          return matchesStudent && matchesSubject;
        });

        const term1 = buildTermData(studentMarks, TERM_CONFIG[0].months);
        const term2 = buildTermData(studentMarks, TERM_CONFIG[1].months);
        const term3 = buildTermData(studentMarks, TERM_CONFIG[2].months);

        const overallAverage = studentMarks.length
          ? Number(
              (
                studentMarks.reduce((sum, entry) => sum + toPercentage(entry.mark, entry.maxMark), 0) /
                studentMarks.length
              ).toFixed(2)
            )
          : 0;

        setProgressData({
          term1,
          term2,
          term3,
          averages: {
            term1: term1.avg,
            term2: term2.avg,
            term3: term3.avg,
            overall: overallAverage,
          },
        });
      } catch (fetchError) {
        if (fetchError.name === "AbortError") return;
        setError(fetchError.message || "Unable to load progress data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();

    return () => controller.abort();
  }, [studentIndexNo, subjectName]);

  const termLayouts = TERM_CONFIG.map((term, index) => ({
    title: term.title,
    months: term.months,
    data: progressData[`term${index + 1}`].data,
    avg: progressData[`term${index + 1}`].avg,
    avgColor: term.avgColor,
  }));

  const categoryColorMap = {
    quiz: "bg-red-300",
    assignment: "bg-green-300",
    "term test": "bg-blue-300",
    "past paper": "bg-yellow-300",
    practical: "bg-purple-300",
    structure: "bg-blue-500",
    structured: "bg-blue-500",
    mcq: "bg-amber-900",
    essay: "bg-black",
    "essay a": "bg-black",
    "essay part a": "bg-black",
    "essay b": "bg-red-500",
    "essay part b": "bg-red-500",
  };

  const fallbackColors = [
    "bg-red-300",
    "bg-green-300",
    "bg-blue-300",
    "bg-yellow-300",
    "bg-purple-300",
    "bg-orange-300",
    "bg-pink-300",
    "bg-indigo-300",
    "bg-lime-300",
  ];

  const getCategoryColor = (category) => {
    const normalizedCategory = String(category || "").trim().toLowerCase();

    if (categoryColorMap[normalizedCategory]) {
      return categoryColorMap[normalizedCategory];
    }

    // Use a consistent hash based on category name
    let hash = 0;
    for (let i = 0; i < normalizedCategory.length; i++) {
      hash = ((hash << 5) - hash) + normalizedCategory.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    const index = Math.abs(hash) % fallbackColors.length;
    return fallbackColors[index];
  };

  const hasMarks = termLayouts.some((term) => term.data.some((month) => month.categories.length > 0));

  if (!studentIndexNo || !subjectName) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm p-4 sm:p-6 text-center text-slate-500 text-sm sm:text-base">
        Select a student and subject to load progress charts.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 animate-pulse">
          <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
          <div className="h-44 sm:h-52 rounded-2xl bg-slate-100" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 animate-pulse">
          <div className="h-5 w-32 rounded bg-slate-200 mb-4" />
          <div className="h-44 sm:h-52 rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error}
      </div>
    );
  }

  if (!hasMarks) {
    return (
      <div className="mt-8 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white/90 shadow-sm min-h-[160px] sm:min-h-[200px] flex items-center justify-center px-4 sm:px-6">
        <div className="text-center">
          <p className="text-slate-400 font-semibold text-base sm:text-lg tracking-wide">
            No marks found for this student yet.
          </p>
        </div>
      </div>
    );
  }

  const TermChart = ({ term }) => (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <HiOutlineChartBar className="text-slate-700" />
          <p className="font-semibold text-slate-800">{term.title}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">AVG</span>
          <div className={`min-w-14 text-center text-sm font-bold rounded border px-2 py-1 bg-slate-50 ${term.avgColor}`}>
            {term.avg}%
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
        {Array.from(
          new Set(
            term.data.flatMap((monthData) =>
              (monthData.categories || []).map((item) => item.category)
            )
          )
        ).map((category) => (
          <div key={category} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${getCategoryColor(category)}`} />
            <span className="text-xs text-slate-600">{category}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 sm:gap-3">
        <div className="flex w-6 sm:w-8 flex-col justify-between py-3 shrink-0 text-[10px] text-slate-500">
          <span>100</span>
          <span>0</span>
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[360px] sm:min-w-0">
            <div className="relative h-48 sm:h-52 border-l-2 border-b-2 border-slate-300 pl-4 pr-4 pt-3 flex items-end justify-between gap-2 sm:gap-3">
              {term.months.map((month) => {
                const monthData = term.data.find((item) => item.month === month);
                const bars = monthData?.categories || [];

                return (
                  <div key={month} className="flex flex-col items-center w-1/4 h-full justify-end min-w-[70px] sm:min-w-0">
                    <div className="w-full flex items-end justify-center gap-1 h-32 sm:h-36">
                      {bars.length === 0 && <div className="w-2 h-2 rounded-sm bg-slate-300" />}
                      {bars.map((entry) => (
                        <div key={`${month}-${entry.category}`} className="h-full flex flex-col items-center justify-end">
                          <span className="text-[9px] leading-none mb-1 text-slate-600 font-semibold">
                            {clampScore(entry.marks)}
                          </span>
                          <div
                            className={`w-2 md:w-3 rounded-t-sm ${getCategoryColor(entry.category)}`}
                            style={{ height: `${Math.max(8, (clampScore(entry.marks) / MAX_SCORE) * 100)}%` }}
                            title={`${month} | ${entry.category}: ${clampScore(entry.marks)}/${MAX_SCORE}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-2 flex items-start justify-between gap-2 sm:gap-3 pl-4 pr-0">
              {term.months.map((month) => (
                <div key={`${term.title}-${month}`} className="w-1/4 text-center min-w-[70px] sm:min-w-0">
                  <span className="text-[11px] sm:text-xs text-slate-600">{month.toLowerCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {termLayouts.map((term) => (
        <TermChart key={term.title} term={term} />
      ))}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide">Overall Average</p>
        <p className="text-xl sm:text-2xl font-bold text-indigo-700">{progressData.averages.overall}%</p>
      </div>
    </div>
  );
};

export default ProgressCharts;
