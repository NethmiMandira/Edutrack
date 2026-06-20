import React, { useState, useEffect, useMemo } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import Sidebar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import DatePaperSelector from "../components/DatePaperSelector";
import StudentMarkEntry from "../components/StudentMarkEntry";
import MarksGridView from "../components/MarksGridView";
import PaperTitle from "../components/PaperTitle";
import API from "../api";

// --- UI COMPONENTS ---

function MessageBox({ message, onClose, type = "error", children }) {
  useEffect(() => {
    if (!message || children) return;
    const handleKeyDown = (e) => { if (e.key === "Enter") onClose(); };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [message, onClose, children]);

  if (!message) return null;

  const styles = {
    success: { color: "text-emerald-600", border: "border-emerald-200", label: "Success" },
    warning: { color: "text-amber-600", border: "border-amber-200", label: "Confirm Action" },
    error: { color: "text-rose-600", border: "border-rose-200", label: "System Error" }
  };

  const { color, border, label } = styles[type] || styles.error;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`bg-white rounded-[2rem] shadow-2xl border-2 p-5 sm:p-8 w-[min(92vw,26rem)] flex flex-col items-center gap-4 ${border} animate-in zoom-in-95 duration-300`}>
        <div className={`text-sm uppercase tracking-[0.2em] font-black ${color}`}>{label}</div>
        <div className="text-slate-600 text-center font-medium leading-relaxed whitespace-pre-line px-4">{message}</div>
        {children ? children : (
          <button onClick={onClose} className="mt-4 px-12 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95">
            OK
          </button>
        )}
      </div>
    </div>
  );
}

function DeleteConfirmButtons({ onOk, onCancel }) {
  const okButtonRef = React.useRef(null);
  const cancelButtonRef = React.useRef(null);

  React.useEffect(() => {
    okButtonRef.current?.focus();
  }, []);

  const handleButtonKeyDown = (e, target) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      if (target === "ok") cancelButtonRef.current?.focus();
      else okButtonRef.current?.focus();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (target === "ok") onOk();
      else onCancel();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full">
      <button ref={okButtonRef} className="flex-1 h-[52px] sm:h-[58px] px-6 sm:px-8 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap" onClick={onOk} onKeyDown={(e) => handleButtonKeyDown(e, "ok")}>
        <HiOutlineTrash className="text-lg" /> Yes, Delete
      </button>
      <button ref={cancelButtonRef} className="flex-1 h-[52px] sm:h-[58px] px-6 sm:px-8 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95" onClick={onCancel} onKeyDown={(e) => handleButtonKeyDown(e, "cancel")}>
        Keep
      </button>
    </div>
  );
}

// --- MAIN COMPONENT ---

const papers = [
  { name: "Term 1 Mathematics Final", value: "math-term1" },
  { name: "Physics Lab Assessment", value: "physics-lab" },
];
const paperDetails = {
  "math-term1": { subject: "Math", grade: "10", paperCategory: "Theory", maxMark: 100 },
  "physics-lab": { subject: "Science", grade: "11", paperCategory: "Practical", maxMark: 50 },
};

export default function MarksEntry() {
  const API_BASE = "/api";
  const [date, setDate] = useState("");
  const [paper, setPaper] = useState("");
  const [student, setStudent] = useState("");
  const [mark, setMark] = useState("");
  const [marks, setMarks] = useState([]);
  const [editMarkId, setEditMarkId] = useState(null);
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [grade, setGrade] = useState("");
  const [subject, setSubject] = useState("");
  const [paperCategory, setPaperCategory] = useState("");

  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageBox, setMessageBox] = useState({ message: "", type: "error" });
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const resStudents = await API.get("/students");
      const resMarks = await API.get("/marks");
      
      setStudents(Array.isArray(resStudents.data) ? resStudents.data : []);
      setMarks(Array.isArray(resMarks.data) ? resMarks.data : []);
    } catch (err) {
      setMessageBox({ message: "Could not connect to the database. Please check if the server is live.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const paperKey = papers.find(p => p.name === paper)?.value || "";
  const maxMark = paperDetails[paperKey]?.maxMark || 100;
  const paperInfo = paperDetails[paperKey] || {};

  const filteredStudents = useMemo(() => {
    if (!grade) return students;
    
    return students.filter(s => {
      // Check if student's grade matches
      const gradeMatch = (s.grade || "").trim().toLowerCase() === grade.trim().toLowerCase();
      
      // If no subject selected, only filter by grade
      if (!subject) return gradeMatch;
      
      // If subject selected, check if student is enrolled in that subject
      const isEnrolledInSubject = s.subjects?.some(subj => {
        // Handle both object format (with name property) and string format
        const subjectName = typeof subj === 'object' ? subj.name : subj;
        return (subjectName || "").trim().toLowerCase() === subject.trim().toLowerCase();
      });
      
      return gradeMatch && isEnrolledInSubject;
    });
  }, [students, grade, subject]);

  const validateEntry = () => {
    if (Number(mark) > maxMark) {
      setMessageBox({ message: `Mark cannot exceed maximum marks (${maxMark})`, type: "error" });
      return false;
    }
    const isDuplicate = marks.some((m) => {
      if (editMarkId && m.id === editMarkId) return false;
      return m.indexno === student && (m.paperName || "").trim() === (generatedTitle || "").trim();
    });
    if (isDuplicate) {
      setMessageBox({ message: "This student already has a record for this paper.", type: "error" });
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!student || !mark || !date || !generatedTitle) return;
    if (!validateEntry()) return;

    const markObj = {
      indexno: student,
      date,
      subject: paperInfo.subject || subject || "",
      paperName: generatedTitle,
      paperCategory: paperInfo.paperCategory || paperCategory || "",
      grade: paperInfo.grade || grade || "",
      mark: Number(mark),
      maxMark: maxMark,
    };

    setIsLoading(true);
    try {
      const isEditing = Boolean(editMarkId);
      if (isEditing) {
        await API.put(`/marks/${editMarkId}`, markObj);
      } else {
        await API.post("/marks", markObj);
      }

      const resMarks = await API.get("/marks");
      setMarks(Array.isArray(resMarks.data) ? resMarks.data : []);
      
      setMessageBox({ message: "Mark saved successfully!", type: "success" });
      handleCancel();
    } catch (err) {
      setMessageBox({ message: err.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/marks/${id}`);
      
      const resMarks = await API.get("/marks");
      setMarks(Array.isArray(resMarks.data) ? resMarks.data : []);
      
      setMessageBox({ message: "Record deleted successfully.", type: "success" });
    } catch (err) {
      setMessageBox({ message: err.message, type: "error" });
    }
  };

  const handleEdit = (row) => {
    setStudent(row.indexno);
    setMark(row.mark);
    setDate(row.date ? row.date.slice(0, 10) : "");
    setGrade(row.grade || "");
    setSubject(row.subject || "");
    setPaperCategory(row.paperCategory || "");
    setGeneratedTitle(row.paperName || "");
    setEditMarkId(row.id || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditMarkId(null);
    setStudent("");
    setMark("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar />
      <div
        className="tutor-page-shell flex-1 min-h-screen py-5 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6 lg:px-8"
        style={{ marginLeft: "calc(var(--tutor-sidebar-width, 5.5rem) + 0.75rem)" }}
      >
        <div className="max-w-7xl mx-auto w-full">
          <PageTitle title="Marks Entry" className="mb-8" />

          <MessageBox
            message={messageBox.message}
            type={messageBox.type}
            onClose={() => setMessageBox({ message: "", type: "error" })}
          />

          <MessageBox
            message={pendingDelete ? "Are you sure you want to delete this record?" : ""}
            type="warning"
            onClose={() => setPendingDelete(null)}
          >
            {pendingDelete && (
              <DeleteConfirmButtons
                onOk={async () => {
                  const id = pendingDelete;
                  setPendingDelete(null);
                  await handleDelete(id);
                }}
                onCancel={() => setPendingDelete(null)}
              />
            )}
          </MessageBox>

          <div className="mt-8 space-y-8">
            <DatePaperSelector
              date={date} setDate={setDate}
              grade={grade} setGrade={setGrade}
              subject={subject} setSubject={setSubject}
              paperCategory={paperCategory} setPaperCategory={setPaperCategory}
            />
            <PaperTitle
              grade={grade} subject={subject}
              paperCategory={paperCategory} date={date}
              onTitleChange={setGeneratedTitle}
            />
          
            <StudentMarkEntry
              students={filteredStudents.map(s => ({ name: `${s.firstname} ${s.lastname}`, value: s.indexno }))}
              selectedStudent={student}
              setSelectedStudent={setStudent}
              mark={mark}
              setMark={setMark}
              onSave={handleSave}
              maxMark={maxMark}
              showCancel={!!editMarkId}
              onCancel={handleCancel}
              disabled={!generatedTitle || !student || !mark || isLoading}
            />

            <MarksGridView
              data={marks}
              onEdit={handleEdit}
              onDelete={(row) => setPendingDelete(row.id)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}