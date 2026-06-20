import React from 'react';

const StudentPaperHistoryTable = ({ papers }) => {
  return (
    <>
      {/* Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {papers.map((paper) => (
          <article
            key={paper.id}
            className="rounded-[1.5rem] border-2 border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Paper</p>
                <p className="text-sm font-bold text-slate-900">{paper.paperName}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Date</p>
                <p className="text-sm font-medium text-slate-700">{paper.date}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Subject</p>
                <p className="text-sm font-medium text-slate-700">{paper.subject}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Category</p>
                <p className="text-sm font-medium text-slate-700">{paper.category}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-1">Marks</p>
                <p className="text-base font-bold text-indigo-600">{paper.marks}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop Table View */}
      <section className="hidden sm:block overflow-hidden rounded-[1.5rem] sm:rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar-track]:transparent [&::-webkit-scrollbar-thumb]:transparent">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Paper Name</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Date</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Subject</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Category</th>
                <th className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold">Marks</th>
              </tr>
            </thead>
            <tbody>
              {papers.map((paper, index) => (
                <tr
                  key={paper.id}
                  className={`border-t border-slate-100 transition-colors hover:bg-slate-50/75 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                  }`}
                >
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-medium text-slate-900">{paper.paperName}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{paper.date}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{paper.subject}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 text-slate-700">{paper.category}</td>
                  <td className="px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-slate-900">{paper.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default StudentPaperHistoryTable;
