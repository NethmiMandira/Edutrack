import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import StudentPromotionActionPanel from "../components/StudentPromotionActionPanel";
import StudentPromotionFilterPanel from "../components/StudentPromotionFilterPanel";
import StudentPromotionGrid from "../components/StudentPromotionGrid";
import API from "../api";

const GRADES = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];
const YEARS = Array.from({ length: 41 }, (_, index) => String(2010 + index));
const gradeOrder = ["Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11"];

const getGradeRank = (grade) => gradeOrder.indexOf(grade);

const getSubjectId = (subject) => {
  if (!subject) return "";
  if (typeof subject === "string") return subject;
  return subject?._id || "";
};

const normalizeSubject = (subject) => {
  if (!subject) return null;
  if (typeof subject === "string") return subject;
  return subject?._id || null;
};

const normalizeContact = (value) => String(value || "").replace(/^\+/, "");

const buildMessage = (...segments) =>
  segments.flat().filter((segment) => segment !== undefined && segment !== null).join("\n");

const getStudentPayload = (student, targetGrade, targetYear) => ({
  firstname: student.firstname || "",
  lastname: student.lastname || "",
  grade: targetGrade,
  currentYear: targetYear,
  subjects: (Array.isArray(student.subjects) ? student.subjects : [])
    .map((subject) => normalizeSubject(subject))
    .filter(Boolean),
  contact: normalizeContact(student.contact),
  date: student.date,
  indexno: student.indexno,
  email: student.email || "",
});

export default function StudentPromotion() {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [filterInput, setFilterInput] = useState({
    grade: "",
    year: "",
    subjectId: "",
  });

  const [promotionInput, setPromotionInput] = useState({
    grade: "",
    year: "",
  });

  const showMessage = (text, type = "success") => {
    setMessage(buildMessage(text));
    setMessageType(type);
  };

  const clearMessage = () => {
    setMessage("");
  };

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await API.get("/subjects");
        setSubjects(Array.isArray(response.data) ? response.data : []);
      } catch {
        setSubjects([]);
        showMessage("Could not connect to the database. Please check if the server is live.", "error");
      }
    };

    loadSubjects();
  }, []);

  const fetchFilterData = async () => {
    const [studentsResponse, subjectsResponse] = await Promise.all([
      API.get("/students"),
      API.get("/subjects"),
    ]);

    const studentsData = studentsResponse.data;
    const subjectsData = subjectsResponse.data;

    const normalizedStudents = Array.isArray(studentsData) ? studentsData : [];
    const normalizedSubjects = Array.isArray(subjectsData) ? subjectsData : [];

    const filteredStudents = normalizedStudents.filter((student) => {
      const matchesGrade = filterInput.grade ? student.grade === filterInput.grade : true;
      const matchesYear = filterInput.year ? String(student.currentYear || "") === filterInput.year : true;
      const matchesSubject = filterInput.subjectId
        ? (Array.isArray(student.subjects) ? student.subjects : []).some(
            (subject) => getSubjectId(subject) === filterInput.subjectId
          )
        : true;

      return matchesGrade && matchesYear && matchesSubject;
    });

    setStudents(filteredStudents);
    setSubjects(normalizedSubjects);
    setSelectedIds([]);
  };

  const handleApplyFilters = async () => {
    clearMessage();

    if (!filterInput.grade || !filterInput.year || !filterInput.subjectId) {
      showMessage("Please select current grade, current year, and subject before filtering.", "error");
      return;
    }

    setFilterLoading(true);

    try {
      await fetchFilterData();
      showMessage("Students filtered successfully.", "success");
    } catch (error) {
      showMessage(error.message || "Failed to filter students.", "error");
      setStudents([]);
      setSelectedIds([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleToggle = (studentId, checked) => {
    setSelectedIds((previous) => {
      if (checked) {
        return previous.includes(studentId) ? previous : [...previous, studentId];
      }

      return previous.filter((id) => id !== studentId);
    });
  };

  const selectedStudents = useMemo(
    () => students.filter((student) => selectedIds.includes(student._id)),
    [students, selectedIds]
  );

  const selectedSubjectName = useMemo(() => {
    const match = subjects.find((subject) => subject._id === filterInput.subjectId);
    return match?.name || "";
  }, [subjects, filterInput.subjectId]);

  useEffect(() => {
    const currentRank = getGradeRank(filterInput.grade);
    const targetRank = getGradeRank(promotionInput.grade);
    const currentYearNumber = Number(filterInput.year);
    const targetYearNumber = Number(promotionInput.year);

    if (!promotionInput.grade && !promotionInput.year) {
      return;
    }

    if (promotionInput.grade && targetRank <= currentRank) {
      setPromotionInput((previous) => ({ ...previous, grade: "" }));
    }

    if (promotionInput.year && targetYearNumber <= currentYearNumber) {
      setPromotionInput((previous) => ({ ...previous, year: "" }));
    }
  }, [filterInput.grade, filterInput.year, promotionInput.grade, promotionInput.year]);

  const handlePassStudents = async () => {
    clearMessage();

    if (getGradeRank(promotionInput.grade) <= getGradeRank(filterInput.grade)) {
      showMessage("Target grade must be higher than the current grade.", "error");
      return;
    }

    if (Number(promotionInput.year) <= Number(filterInput.year)) {
      showMessage("Target year must be higher than the current year.", "error");
      return;
    }

    if (!promotionInput.grade || !promotionInput.year) {
      showMessage("Please select target grade and target year.", "error");
      return;
    }

    if (selectedStudents.length === 0) {
      showMessage("Please select at least one student to pass.", "error");
      return;
    }

    setPassLoading(true);

    try {
      const updateRequests = selectedStudents.map((student) => {
        const payload = getStudentPayload(student, promotionInput.grade, Number(promotionInput.year));
        return API.put(`/students/${student._id}`, payload);
      });

      await Promise.all(updateRequests);

      const refreshedStudentsResponse = await API.get("/students");
      const refreshedData = refreshedStudentsResponse.data;
      const normalized = Array.isArray(refreshedData) ? refreshedData : [];

      const refreshedFiltered = normalized.filter((student) => {
        const matchesGrade = filterInput.grade ? student.grade === filterInput.grade : true;
        const matchesYear = filterInput.year ? String(student.currentYear || "") === filterInput.year : true;
        const matchesSubject = filterInput.subjectId
          ? (Array.isArray(student.subjects) ? student.subjects : []).some(
              (subject) => getSubjectId(subject) === filterInput.subjectId
            )
          : true;

        return matchesGrade && matchesYear && matchesSubject;
      });

      setStudents(refreshedFiltered);
      setFilterInput({ grade: "", year: "", subjectId: "" });
      setPromotionInput({ grade: "", year: "" });
      setSelectedIds([]);
      showMessage("Selected students passed successfully.", "success");
    } catch (error) {
      showMessage(error.message || "Could not pass selected students.", "error");
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
      <Sidebar />
      {message && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/55 backdrop-blur-md px-3 sm:px-5 md:px-8 py-5 sm:py-8 animate-in fade-in duration-300">
          <div
            className={`w-[min(96vw,22rem)] sm:w-[min(88vw,28rem)] md:w-[min(70vw,34rem)] lg:w-[min(56vw,38rem)] bg-white rounded-[1.75rem] sm:rounded-[2rem] shadow-2xl border-2 p-4 sm:p-6 md:p-8 flex flex-col items-center gap-3 sm:gap-4 animate-in zoom-in-95 duration-300 ${
              messageType === "success"
                ? "border-emerald-200"
                : messageType === "warning"
                  ? "border-amber-200"
                  : "border-rose-200"
            }`}
          >
            <div
              className={`text-xs sm:text-sm uppercase tracking-[0.18em] sm:tracking-[0.2em] font-black text-center ${
                messageType === "success"
                  ? "text-emerald-600"
                  : messageType === "warning"
                    ? "text-amber-600"
                    : "text-rose-600"
              }`}
            >
              {messageType === "success" ? "Success" : messageType === "warning" ? "Confirm Action" : "System Error"}
            </div>
            <div className="text-slate-600 text-center text-sm sm:text-base font-medium leading-relaxed whitespace-pre-line px-1 sm:px-3 md:px-4 break-words">
              {message}
            </div>
            <button
              type="button"
              onClick={() => setMessage("")}
              className="mt-3 sm:mt-4 w-full sm:w-auto min-w-[9rem] px-8 sm:px-12 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
              autoFocus
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div
        className="tutor-page-shell flex-1 min-h-screen py-6 sm:py-8 lg:py-10 px-4 sm:px-6"
        style={{ marginLeft: "calc(var(--tutor-sidebar-width, 5.5rem) + 0.75rem)" }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <PageTitle title="Pass Students To Next Year" />

          <StudentPromotionFilterPanel
            grades={GRADES}
            years={YEARS}
            subjects={subjects}
            filterInput={filterInput}
            loading={filterLoading}
            onFilterInputChange={(key, value) => setFilterInput((previous) => ({ ...previous, [key]: value }))}
            onFilterApply={handleApplyFilters}
          />

          <StudentPromotionGrid
            students={students}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            selectedSubjectId={filterInput.subjectId}
            selectedSubjectName={selectedSubjectName}
          />

          <StudentPromotionActionPanel
            grades={GRADES}
            years={YEARS}
            currentGrade={filterInput.grade}
            currentYear={filterInput.year}
            promotionInput={promotionInput}
            selectedCount={selectedIds.length}
            loading={passLoading}
            onPromotionInputChange={(key, value) =>
              setPromotionInput((previous) => ({ ...previous, [key]: value }))
            }
            onPassStudents={handlePassStudents}
          />
        </div>
      </div>
    </div>
  );
}
