import React, { useState, useEffect } from "react";
import { HiOutlineTrash } from "react-icons/hi";
import Sidebar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import CategoryForm from "../components/CategoryForm";
import CategoryGrid from "../components/CategoryGrid";
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
      <div className={`bg-white rounded-[2rem] shadow-2xl border-2 p-5 sm:p-8 min-w-[280px] sm:min-w-[340px] max-w-[92vw] flex flex-col items-center gap-4 ${border} animate-in zoom-in-95 duration-300`}>
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

// --- MAIN CATEGORIES COMPONENT ---

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messageBox, setMessageBox] = useState({ message: "", type: "error" });
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await API.get('/categories');
      const data = response.data;
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      setMessageBox({ message: "Could not connect to the database. Please check if the server is live.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (categoryName) => {
    const normalizedName = categoryName.trim().toLowerCase();
    const isDuplicate = categories.some((cat, idx) => 
      (cat.name || cat).toLowerCase() === normalizedName && idx !== selectedCategoryIndex
    );

    if (isDuplicate) {
      setMessageBox({ message: `The category "${categoryName}" already exists.`, type: "error" });
      return;
    }

    try {
      if (selectedCategoryIndex !== null) {
        const cat = categories[selectedCategoryIndex];
        const response = await API.put(`/categories/${cat._id}`, { name: categoryName });
        const updated = response.data;
        
        setCategories(prev => prev.map((c, i) => i === selectedCategoryIndex ? updated : c));
        setSelectedCategoryIndex(null);
        setMessageBox({ message: "Category updated successfully!", type: "success" });
      } else {
        const response = await API.post('/categories', { name: categoryName });
        const data = response.data;

        setCategories(prev => [data, ...prev]);
        setMessageBox({ message: "New category added!", type: "success" });
      }
    } catch (err) {
      setMessageBox({ message: err.message, type: "error" });
    }
  };

  const handleDelete = async (index) => {
    const cat = categories[index];
    try {
      await API.delete(`/categories/${cat._id}`);
      
      setCategories(prev => prev.filter((_, i) => i !== index));
      if (selectedCategoryIndex === index) setSelectedCategoryIndex(null);
      setMessageBox({ message: "Category permanently removed.", type: "success" });
    } catch (err) {
      setMessageBox({ message: err.message, type: "error" });
    }
  };

  const clearSelected = () => setSelectedCategoryIndex(null);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
      <Sidebar />
      
      <div
        className="tutor-page-shell flex-1 min-h-screen py-5 sm:py-6 md:py-8 lg:py-10 px-3 sm:px-4 md:px-6 lg:px-8"
        style={{ marginLeft: "calc(var(--tutor-sidebar-width, 5.5rem) + 0.75rem)" }}
      >
        <div className="max-w-4xl mx-auto">
          <PageTitle title="Paper Categories" className="mb-8" />
        </div>

        {/* Dynamic Notifications */}
        <MessageBox
          message={messageBox.message}
          type={messageBox.type}
          onClose={() => setMessageBox({ message: "", type: "error" })}
        />

        {/* Delete Confirmation Warning */}
        <MessageBox
          message={pendingDelete !== null ? `Are you sure you want to delete "${categories[pendingDelete]?.name || 'this category'}"?` : ""}
          type="warning"
          onClose={() => setPendingDelete(null)}
        >
          {pendingDelete !== null && (
            <DeleteConfirmButtons
              onOk={async () => {
                const idx = pendingDelete;
                setPendingDelete(null);
                await handleDelete(idx);
              }}
              onCancel={() => setPendingDelete(null)}
            />
          )}
        </MessageBox>

        <div className="max-w-4xl mx-auto">
          <CategoryForm
            onSave={handleSave}
            selectedCategory={selectedCategoryIndex !== null ? (categories[selectedCategoryIndex]?.name || categories[selectedCategoryIndex]) : ""}
            clearSelected={clearSelected}
            isEditing={selectedCategoryIndex !== null}
          />

          <div className="mt-8 sm:mt-10 md:mt-12">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400 font-bold tracking-widest text-xs uppercase italic">Syncing Database...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white rounded-[2rem] sm:rounded-[3rem] border-4 border-dashed border-slate-100">
                <p className="text-slate-300 font-medium text-sm sm:text-base">No categories found.</p>
              </div>
            ) : (
              <CategoryGrid 
                categories={categories} 
                onEdit={(idx) => {
                    setSelectedCategoryIndex(idx);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                onDelete={(idx) => setPendingDelete(idx)} 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}