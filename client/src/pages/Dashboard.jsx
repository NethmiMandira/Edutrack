import React, { useEffect, useMemo, useState } from "react";
import { HiOutlineBookOpen, HiOutlineClipboardList, HiOutlineCollection, HiOutlineTrendingUp, HiOutlineUserGroup } from "react-icons/hi";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import DashboardStatCard from "../components/tutorDashboard/DashboardStatCard";
import DashboardQuickActions from "../components/tutorDashboard/DashboardQuickActions";
import DashboardRecentMarks from "../components/tutorDashboard/DashboardRecentMarks";
import DashboardSubjectPerformance from "../components/tutorDashboard/DashboardSubjectPerformance";
import API from "../api";

const formatNumber = (value) => new Intl.NumberFormat().format(value || 0);

const formatDateLabel = (value) => {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const toScore = (mark) => {
  const safeMark = Number(mark?.mark) || 0;
  const safeMax = Number(mark?.maxMark) || 0;
  if (safeMax <= 0) return 0;
  return (safeMark / safeMax) * 100;
};

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        // Fetch all endpoints separately to identify which ones fail
        const results = {
          students: [],
          subjects: [],
          categories: [],
          marks: []
        };

        // Fetch students
        try {
          const res = await API.get("/students", { signal: controller.signal });
          results.students = Array.isArray(res.data) ? res.data : [];
          console.log(`✅ Students loaded: ${results.students.length}`);
        } catch (err) {
          console.error(`❌ Students endpoint failed:`, err.message);
        }

        // Fetch subjects
        try {
          const res = await API.get("/subjects", { signal: controller.signal });
          results.subjects = Array.isArray(res.data) ? res.data : [];
          console.log(`✅ Subjects loaded: ${results.subjects.length}`);
        } catch (err) {
          console.error(`❌ Subjects endpoint failed:`, err.message);
        }

        // Fetch categories
        try {
          const res = await API.get("/categories", { signal: controller.signal });
          results.categories = Array.isArray(res.data) ? res.data : [];
          console.log(`✅ Categories loaded: ${results.categories.length}`);
        } catch (err) {
          console.error(`❌ Categories endpoint failed:`, err.message);
        }

        // Fetch marks
        try {
          const res = await API.get("/marks", { signal: controller.signal });
          results.marks = Array.isArray(res.data) ? res.data : [];
          console.log(`✅ Marks loaded: ${results.marks.length}`);
        } catch (err) {
          console.error(`❌ Marks endpoint failed:`, err.message);
        }

        setStudents(results.students);
        setSubjects(results.subjects);
        setCategories(results.categories);
        setMarks(results.marks);

        // Check if at least one collection has data
        const hasData = Object.values(results).some(arr => Array.isArray(arr) && arr.length > 0);
        if (!hasData) {
          setError("⚠️ No data found in database.\n\nNote: Collections may be empty on this server.");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          const apiError = err.response?.data?.error || err.message;
          const errorMsg = `Unable to load dashboard data.\n\n🔧 Troubleshooting:\n• API Status: Check https://skmathzone.com/api/health\n• MongoDB Connection: Verify MONGO_URI in server .env\n• Server Status: Ensure Node.js is running on Hostinger\n• Network: Check Hostinger firewall allows MongoDB Atlas\n\n❌ Error Details:\n${apiError}`;
          setError(errorMsg);
          console.error("Dashboard API Error:", {
            status: err.response?.status,
            message: err.message,
            apiError: apiError,
          });
        }
      } finally {
        setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, []);

  const studentLookup = useMemo(() => {
    const map = new Map();
    students.forEach((student) => {
      const fullName = [student.firstname, student.lastname].filter(Boolean).join(" ") || student.indexno;
      map.set(student.indexno, { name: fullName, grade: student.grade });
    });
    return map;
  }, [students]);

  const dashboardStats = useMemo(() => {
    const activeGrades = new Set(students.map((student) => student.grade).filter(Boolean));

    return [
      {
        label: "Students",
        value: formatNumber(students.length),
        detail: `${activeGrades.size} active grade${activeGrades.size === 1 ? "" : "s"}`,
        icon: <HiOutlineUserGroup />,
        accentClass: "text-slate-900",
        iconClass: "bg-indigo-50 text-indigo-600 border-indigo-100",
      },
      {
        label: "Subjects",
        value: formatNumber(subjects.length),
        detail: "Live subject list in the system",
        icon: <HiOutlineBookOpen />,
        accentClass: "text-slate-900",
        iconClass: "bg-cyan-50 text-cyan-600 border-cyan-100",
      },
      {
        label: "Paper Categories",
        value: formatNumber(categories.length),
        detail: "Assessment types available",
        icon: <HiOutlineCollection />,
        accentClass: "text-slate-900",
        iconClass: "bg-amber-50 text-amber-600 border-amber-100",
      },
      {
        label: "Marks Recorded",
        value: formatNumber(marks.length),
        detail: "Student papers already marked",
        icon: <HiOutlineClipboardList />,
        accentClass: "text-slate-900",
        iconClass: "bg-rose-50 text-rose-600 border-rose-100",
      },
    ];
  }, [students, subjects, categories, marks]);

  const recentMarks = useMemo(() => {
    return [...marks]
      .sort((left, right) => new Date(right.date || right.createdAt || 0) - new Date(left.date || left.createdAt || 0))
      .slice(0, 6)
      .map((mark) => ({
        ...mark,
        score: toScore(mark),
        dateLabel: formatDateLabel(mark.date),
      }));
  }, [marks]);

  const subjectPerformance = useMemo(() => {
    const grouped = new Map();

    marks.forEach((mark) => {
      const subjectName = mark.subject || "Unassigned subject";
      const score = toScore(mark);
      const entry = grouped.get(subjectName) || { name: subjectName, total: 0, count: 0 };
      entry.total += score;
      entry.count += 1;
      grouped.set(subjectName, entry);
    });

    return [...grouped.values()]
      .map((subject) => ({
        name: subject.name,
        count: subject.count,
        average: subject.count ? subject.total / subject.count : 0,
      }))
      .sort((left, right) => right.average - left.average)
      .slice(0, 5);
  }, [marks]);

  const actions = [
    { label: "Register Students", description: "Add new learners and set subjects", to: "/students", icon: <HiOutlineUserGroup />, iconTone: "border-indigo-100 bg-indigo-50 text-indigo-600" },
    { label: "Enter Marks", description: "Record assessments and paper results", to: "/marks-entry", icon: <HiOutlineClipboardList />, iconTone: "border-rose-100 bg-rose-50 text-rose-600" },
    { label: "Review Progress", description: "Inspect student progress by subject", to: "/progress", icon: <HiOutlineTrendingUp />, iconTone: "border-emerald-100 bg-emerald-50 text-emerald-600" },
    { label: "Manage Subjects", description: "Edit the active subject list", to: "/subjects", icon: <HiOutlineBookOpen />, iconTone: "border-cyan-100 bg-cyan-50 text-cyan-600" },
  ];

  return (
    <div>
      <Navbar />

      <main
        className="tutor-page-shell min-h-screen bg-slate-50 py-5 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6 lg:px-8"
        style={{ marginLeft: "calc(var(--tutor-sidebar-width, 5.5rem) + 0.75rem)" }}
      >
        <div className="mx-auto max-w-7xl">
          <PageTitle
            title="Tutor Dashboard"
            className="mb-8"
          />

          {error && (
            <div className="mb-6 rounded-[1.5rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 whitespace-pre-wrap">
              {error}
            </div>
          )}

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-40 rounded-[2rem] border border-slate-200 bg-white" />
                ))}
              </div>
              <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="h-96 rounded-[2rem] border border-slate-200 bg-white" />
                <div className="h-96 rounded-[2rem] border border-slate-200 bg-white" />
              </div>
            </div>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {dashboardStats.map((stat) => (
                  <DashboardStatCard key={stat.label} {...stat} />
                ))}
              </section>

              <div className="mt-6">
                <DashboardQuickActions actions={actions} />
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <DashboardRecentMarks marks={recentMarks} studentLookup={studentLookup} />
                <DashboardSubjectPerformance subjects={subjectPerformance} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}