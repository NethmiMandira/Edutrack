import React from 'react';
import {
  HiOutlineChartBar,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
} from 'react-icons/hi';

const StudentSummaryCards = ({ average, highest, lowest }) => {
  const cards = [
    {
      label: 'Average Marks',
      value: average,
      icon: <HiOutlineChartBar className="text-2xl" />,
      tone: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      label: 'Highest Mark',
      value: highest,
      icon: <HiOutlineTrendingUp className="text-2xl" />,
      tone: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      label: 'Lowest Mark',
      value: lowest,
      icon: <HiOutlineTrendingDown className="text-2xl" />,
      tone: 'text-amber-600 bg-amber-50 border-amber-100',
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-[2rem] border-2 border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {card.label}
            </p>
            <div className={`rounded-xl border p-2 ${card.tone}`}>{card.icon}</div>
          </div>
          <div className="mt-3 flex items-end gap-1">
            <p className="text-4xl font-black text-slate-900">{card.value}</p>
            <span className="pb-1 text-xs font-bold text-slate-400">/100</span>
          </div>
        </div>
      ))}
    </section>
  );
};

export default StudentSummaryCards;
