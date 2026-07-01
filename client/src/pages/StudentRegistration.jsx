import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineTrash,
  HiOutlineCamera,
} from "react-icons/hi";
import html2canvas from "html2canvas";

import Sidebar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import StudentForm from "../components/StudentForm";
import StudentGrid from "../components/StudentGrid";
import API from "../api";

// --- UI COMPONENTS ---

function MessageBox({ message, onClose, type = "error", children }) {
  useEffect(() => {
    if (!message || children) return;
    const handleKeyDown = (e) => {
      if (e.key === "Enter") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [message, onClose, children]);

  if (!message) return null;

  const styles = {
    success: { color: "text-emerald-600", border: "border-emerald-200", label: "Success" },
    warning: { color: "text-amber-600", border: "border-amber-200", label: "Confirm Action" },
    error: { color: "text-rose-600", border: "border-rose-200", label: "System Error" },
  };

  const { color, border, label } = styles[type] || styles.error;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`bg-white rounded-[2rem] shadow-2xl border-2 p-5 sm:p-8 min-w-[280px] sm:min-w-[340px] max-w-[92vw] flex flex-col items-center gap-4 ${border} animate-in zoom-in-95 duration-300`}
      >
        <div className={`text-sm uppercase tracking-[0.2em] font-black ${color}`}>{label}</div>
        <div className="text-slate-600 text-center font-medium leading-relaxed whitespace-pre-line px-4">
          {message}
        </div>
        {children ? (
          children
        ) : (
          <button
            onClick={onClose}
            className="mt-4 px-12 py-3 rounded-2xl bg-slate-900 text-white font-bold hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
            autoFocus
          >
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
      <button
        ref={okButtonRef}
        className="flex-1 h-[52px] sm:h-[58px] px-6 sm:px-8 rounded-2xl bg-rose-500 text-white font-bold hover:bg-rose-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 whitespace-nowrap"
        onClick={onOk}
        onKeyDown={(e) => handleButtonKeyDown(e, "ok")}
      >
        <HiOutlineTrash className="text-lg" /> Yes, Delete
      </button>
      <button
        ref={cancelButtonRef}
        className="flex-1 h-[52px] sm:h-[58px] px-6 sm:px-8 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all active:scale-95"
        onClick={onCancel}
        onKeyDown={(e) => handleButtonKeyDown(e, "cancel")}
      >
        Keep Record
      </button>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---

export default function StudentRegistration() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageBox, setMessageBox] = useState({ message: "", type: "error" });
  const [pendingDelete, setPendingDelete] = useState(null);
  const [clearFormFlag, setClearFormFlag] = useState(false);

  const gridRef = useRef(null);

  const loadStudents = useCallback(async (signal) => {
    try {
      const res = await API.get("/students", { signal });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      throw new Error(err.response?.data?.error || err.message || "Could not connect to the database. Please check if the server is live.");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchStudents = async () => {
      setLoading(true);
      try {
        await loadStudents(controller.signal);
      } catch (err) {
        if (err.name === "AbortError" || err.code === "ERR_CANCELED" || err.message === "canceled") return;
        setMessageBox({
          message: err.message.includes("Unexpected token")
            ? "Database Error: Invalid data received. Check backend routes."
            : err.message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
    return () => controller.abort();
  }, [loadStudents]);

  const handleCapture = async () => {
    if (!gridRef.current) return;
    try {
      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: "#f8fafc",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `student-report-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      setMessageBox({ message: "Capture failed. Please try again.", type: "error" });
    }
  };

  const handleSave = async (student) => {
    const valIndex = student.indexno || student.indexNo || student.index || "";
    const valContact = String(student.contact || "").replace(/\D/g, "").replace(/^0+/, "");
    const valEmail = String(student.email || "").trim().toLowerCase();

    if (
      students.some(
        (s) =>
          (s.indexno === valIndex || s.indexNo === valIndex || s.index === valIndex) &&
          valIndex !== ""
      )
    ) {
      setMessageBox({ message: `The Index Number "${valIndex}" is already registered.`, type: "error" });
      return;
    }
    if (
      students.some(
        (s) => String(s.email || "").trim().toLowerCase() === valEmail && valEmail !== ""
      )
    ) {
      setMessageBox({ message: `The Email "${student.email}" is already registered.`, type: "error" });
      return;
    }

    try {
      const payload = { ...student, contact: valContact };
      const res = await API.post("/students", payload);
      const data = res.data;

      const notificationWarnings = Array.isArray(data?.notificationWarnings)
        ? data.notificationWarnings.filter(Boolean)
        : [];
      const smsStatusLine =
        data?.smsStatus === "disabled"
          ? "SMS status: disabled in server config."
          : data?.smsStatus === "queued"
          ? "SMS status: queued for delivery to " + (data?.contact ? `${data.contact}` : "student.")
          : data?.smsStatus === "skipped"
          ? `SMS status: skipped - ${data?.smsError || "no valid phone number."}`
          : data?.smsStatus === "sent"
          ? "SMS status: sent to provider."
          : data?.smsStatus === "failed"
          ? `SMS status: failed - ${data?.smsError || "delivery failed."}`
          : data?.smsStatus === "pending"
          ? "SMS status: pending delivery confirmation."
          : "SMS status: unavailable.";

      const successMessage = [
        "Student record created successfully!",
        "",
        smsStatusLine,
        ...(notificationWarnings.length > 0 ? ["", "Notes:", ...notificationWarnings] : []),
      ].join("\n");
      setMessageBox({ message: successMessage, type: "success" });
      setClearFormFlag(true);

      try {
        await loadStudents();
      } catch (refreshErr) {
        console.error("Student list refresh failed after save:", refreshErr);
      }
    } catch (err) {
      setMessageBox({ message: err.response?.data?.error || err.message, type: "error" });
    }
  };

  const handleUpdate = async (student) => {
    if (!student?._id) return;

    const currentFormIndex = student.indexno || student.indexNo || student.index || "";
    const currentFormContact = student.contact || "";
    const currentFormEmail = String(student.email || "").trim().toLowerCase();

    if (
      students.some(
        (s) =>
          s._id !== student._id &&
          (s.indexno === currentFormIndex || s.indexNo === currentFormIndex || s.index === currentFormIndex) &&
          currentFormIndex !== ""
      )
    ) {
      setMessageBox({
        message: `Update Failed: Index Number "${currentFormIndex}" belongs to another student.`,
        type: "error",
      });
      return;
    }
    if (
      students.some(
        (s) =>
          s._id !== student._id &&
          String(s.email || "").trim().toLowerCase() === currentFormEmail &&
          currentFormEmail !== ""
      )
    ) {
      setMessageBox({
        message: `Update Failed: Email "${student.email}" belongs to another student.`,
        type: "error",
      });
      return;
    }

    try {
      const normalizedCurrentContact = String(currentFormContact || "").replace(/\D/g, "").replace(/^0+/, "");
      const payload = { ...student, contact: normalizedCurrentContact };
      await API.put(`/students/${student._id}`, payload);

      await loadStudents();
      setSelectedStudent(null);
      setMessageBox({ message: "Student profile updated successfully!", type: "success" });
    } catch (err) {
      setMessageBox({ message: err.response?.data?.error || err.message, type: "error" });
    }
  };

  const handleDelete = async (student) => {
    try {
      if (!student?._id) throw new Error("Missing student ID.");

      await API.delete(`/students/${student._id}`);

      await loadStudents();
      setMessageBox({ message: "Record removed.", type: "success" });
    } catch (err) {
      setMessageBox({ message: err.response?.data?.error || err.message, type: "error" });
    }
  };

  const handleSelect = useCallback((student) => {
    let fixedStudent = { ...student };
    if (!Array.isArray(fixedStudent.subjects)) {
      if (Array.isArray(fixedStudent.subject)) {
        fixedStudent.subjects = fixedStudent.subject;
      } else {
        fixedStudent.subjects = [];
      }
    }
    setSelectedStudent(fixedStudent);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      className="student-registration-scroll bg-slate-50 font-sans text-slate-900"
      style={{ scrollbarGutter: "stable both-edges" }}
    >
      <Sidebar />
      <div
        className="tutor-page-shell"
        // No inline paddingLeft or minWidth – CSS handles centering
      >
        <div className="tutor-page-content">
          <PageTitle title="Student Registration" className="mb-8" />

          <MessageBox
            message={messageBox.message}
            type={messageBox.type}
            onClose={() => {
              setMessageBox({ message: "", type: "error" });
              if (messageBox.type === "success") {
                setClearFormFlag(false);
                setSelectedStudent(null);
              }
            }}
          />

          <MessageBox
            message={pendingDelete ? `Delete ${pendingDelete.firstname}'s record?` : ""}
            type="warning"
            onClose={() => setPendingDelete(null)}
          >
            {pendingDelete && (
              <DeleteConfirmButtons
                onOk={async () => {
                  const stu = pendingDelete;
                  setPendingDelete(null);
                  await handleDelete(stu);
                }}
                onCancel={() => setPendingDelete(null)}
              />
            )}
          </MessageBox>

          <div className="mt-8 space-y-8">
            <div className="w-full">
              <StudentForm
                onSave={handleSave}
                onUpdate={(val) => (val ? handleUpdate(val) : setSelectedStudent(null))}
                selectedStudent={selectedStudent}
                clearFormFlag={clearFormFlag}
                onClearFormHandled={() => setClearFormFlag(false)}
              />
            </div>

            <div className="mt-12 w-full" ref={gridRef}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 font-bold tracking-widest text-xs uppercase">
                    Syncing Database...
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                  <p className="text-slate-300 font-medium">No students registered yet.</p>
                </div>
              ) : (
                <StudentGrid
                  students={students}
                  onSelect={handleSelect}
                  onDelete={(stu) => setPendingDelete(stu)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}