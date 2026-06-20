import React, { useMemo } from "react";
import { 
  HiOutlinePencilAlt, 
  HiOutlineTrash, 
  HiOutlineInbox 
} from "react-icons/hi";

// Default no-op handlers
const noop = () => {};

export default function CategoryGrid({ categories = [], onEdit = noop, onDelete = noop }) {
  let error = null;
  let safeCategories = [];
  try {
    if (!Array.isArray(categories)) throw new Error("Categories data is not an array");
    safeCategories = categories
      .map((cat, sourceIndex) => ({ cat, sourceIndex }))
      .filter(({ cat }) => {
        if (typeof cat === 'string') return cat.trim();
        if (cat && typeof cat === 'object') return String(cat.name || '').trim();
        return false;
      });
    if (categories.length > 0 && safeCategories.length === 0) throw new Error("No valid categories found");
  } catch (e) {
    error = e.message;
  }

  const sortedCategories = useMemo(() => {
    return [...safeCategories].sort((a, b) => {
      const aId = Number(a.cat?.numericId);
      const bId = Number(b.cat?.numericId);
      const aHasId = Number.isFinite(aId);
      const bHasId = Number.isFinite(bId);

      if (aHasId && bHasId) return aId - bId;
      if (aHasId) return -1;
      if (bHasId) return 1;
      return a.sourceIndex - b.sourceIndex;
    });
  }, [safeCategories]);
  return (
    /* Increased width to max-w-7xl for dashboard consistency */
    <div className="mt-8 sm:mt-10 md:mt-12 w-full max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Header Section */}
      <div className="mb-6 sm:mb-8 px-1 sm:px-2 flex justify-between items-end">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Paper Category Directory
          </h3>
        </div>
        <div className="hidden md:block text-right">
          
        </div>
      </div>

      {/* Mobile Cards - show below `md` */}
      <div className="md:hidden space-y-3 sm:space-y-4">
        {error ? (
          <div className="py-12 sm:py-16 text-center text-red-500 font-bold text-sm">
            {error}
          </div>
        ) : sortedCategories.length === 0 ? (
          <div className="py-12 sm:py-16 text-center">
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <HiOutlineInbox className="text-5xl sm:text-6xl text-slate-100" />
              <p className="text-slate-400 font-medium italic text-sm">No categories added.</p>
            </div>
          </div>
        ) : (
          sortedCategories.map(({ cat, sourceIndex }, idx) => (
            <div 
              key={cat._id || idx} 
              className="rounded-[1.5rem] sm:rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5 bg-white hover:shadow-md transition-all duration-200"
            >
              {/* Category Name and ID Row */}
              <div className="flex items-start justify-between gap-3 mb-3 sm:mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-slate-500 text-[11px] sm:text-xs uppercase tracking-widest font-bold mb-1">Category</p>
                  <h4 className="text-sm sm:text-base font-bold text-slate-800 break-words">{cat.name || cat}</h4>
                </div>
                {cat.numericId && (
                  <div className="flex-shrink-0 bg-indigo-50 px-2.5 sm:px-3 py-1.5 rounded-lg">
                    <p className="text-indigo-600 font-mono font-bold text-xs sm:text-sm">{cat.numericId}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons - Full Width Stack */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => onEdit(sourceIndex)}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 w-full"
                >
                  <HiOutlinePencilAlt className="text-base" />
                  Update
                </button>
                <button
                  onClick={() => onDelete(sourceIndex)}
                  className="flex items-center justify-center gap-2 bg-white border border-rose-100 text-rose-500 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95 w-full"
                >
                  <HiOutlineTrash className="text-base" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tablet / Desktop Table - show at `md` and up */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest w-32">ID</th>
                <th className="px-10 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest">Category Name</th>
                <th className="px-10 py-5 font-bold text-slate-600 text-xs uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {error ? (
                <tr>
                  <td colSpan="3" className="py-24 text-center text-red-500 font-bold">
                    {error}
                  </td>
                </tr>
              ) : sortedCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <HiOutlineInbox className="text-6xl text-slate-100" />
                      <p className="text-slate-400 font-medium italic">No categories added to the database.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedCategories.map(({ cat, sourceIndex }, idx) => (
                  <tr key={cat._id || idx} className="group hover:bg-slate-50/60 transition-all duration-200">
                    {/* ID column */}
                    <td className="px-10 py-6 text-sm font-mono font-bold text-indigo-500">{cat.numericId || "—"}</td>
                    {/* Category Name column */}
                    <td className="px-10 py-6 text-sm font-bold text-slate-800">{cat.name || cat}</td>
                    {/* Action Buttons - Right Aligned */}
                    <td className="px-10 py-6">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => onEdit(sourceIndex)}
                          className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95"
                        >
                          <HiOutlinePencilAlt className="text-base" />
                          Update
                        </button>
                        <button
                          onClick={() => onDelete(sourceIndex)}
                          className="flex items-center gap-2 bg-white border border-rose-100 text-rose-500 px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all active:scale-95"
                        >
                          <HiOutlineTrash className="text-base" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}