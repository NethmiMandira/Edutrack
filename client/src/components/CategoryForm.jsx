import React, { useState, useEffect } from "react";
import { 
  HiOutlinePlus, 
  HiOutlineTag,
  HiOutlineX,
  HiOutlineRefresh
} from "react-icons/hi";

export default function CategoryForm({ onSave, selectedCategory = "", clearSelected, isEditing }) {
  const [category, setCategory] = useState("");

  // Populate input for editing
  useEffect(() => {
    if (isEditing && selectedCategory) {
      setCategory(selectedCategory);
    } else {
      setCategory("");
    }
  }, [isEditing, selectedCategory]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (category.trim()) {
      onSave(category.trim());
      setCategory("");
    }
  };

  return (
    <div className="mt-8 w-full max-w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Form Container - Premium Rounded Style */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        
        

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-10">
          <div className="flex flex-col gap-4 sm:gap-6">
            
            {/* Input Field */}
            <div className="w-full">
              <label className="block text-[12px] font-bold text-slate-600 uppercase tracking-widest mb-2 sm:mb-3 ml-1">
                Paper Category Designation
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Internal Assessment"
                className="w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none bg-slate-50/30 focus:bg-white"
              />
            </div>

            {/* Actions Row - Right Aligned */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end items-stretch sm:items-center mt-2">
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setCategory("");
                    clearSelected();
                  }}
                  className="group flex items-center justify-center gap-2 px-6 sm:px-8 h-[52px] sm:h-[56px] rounded-2xl bg-white border-2 border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all duration-200 active:scale-95 w-full sm:w-auto"
                >
                  <HiOutlineX className="text-lg opacity-60 group-hover:rotate-90 transition-transform duration-300" />
                  Cancel
                </button>
              )}
              
              <button
                type="submit"
                disabled={!category.trim()}
                className={`flex items-center justify-center gap-3 px-6 sm:px-10 h-[52px] sm:h-[56px] rounded-2xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 w-full sm:w-auto
                  ${category.trim() 
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 hover:bg-indigo-600" 
                    : "bg-slate-100 text-slate-300 cursor-not-allowed"}
                `}
              >
                {isEditing ? <HiOutlineRefresh className="text-lg" /> : <HiOutlinePlus className="text-xl" />}
                {isEditing ? "Update Paper Category" : "Save Paper Category"}
              </button>
            </div>
          </div>
          
          {/* Helper Footer */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-slate-400 font-medium italic">
              Categories help in filtering examination papers and student records efficiently.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}