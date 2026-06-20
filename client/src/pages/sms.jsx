import React, { useState } from "react";
import { 
  HiOutlineChatAlt2, 
  HiOutlineVariable, 
  HiOutlinePaperAirplane, 
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineX
} from "react-icons/hi";

export default function SMSBroadcastUI({ examData, students }) {
  const [message, setMessage] = useState("Hello {name}, you scored {score} for the {paper} exam.");
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Example placeholder inserter
  const addTag = (tag) => setMessage(prev => prev + ` {${tag}}`);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* SECTION 1: COMPOSER */}
      <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
            <HiOutlineChatAlt2 className="text-2xl" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">SMS Template</h3>
            <p className="text-xs text-slate-400 font-medium">Customize how students receive their marks</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[120px] outline-none font-medium"
            placeholder="Write your message here..."
          />
          
          <div className="flex flex-wrap gap-2">
            {['name', 'score', 'paper', 'grade', 'max_mark'].map(tag => (
              <button
                key={tag}
                onClick={() => addTag(tag)}
                className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-500 hover:text-indigo-600 transition-all"
              >
                <HiOutlineVariable className="text-sm" />
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: RECIPIENT LIST */}
      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">
            Recipients ({students.length})
          </span>
          <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold">
            <HiOutlineCheckCircle /> All Numbers Validated
          </div>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
              <th className="px-8 py-4">Student</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-8 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((stu) => (
              <tr key={stu.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 font-bold text-slate-800 text-sm">{stu.name}</td>
                <td className="px-6 py-4 text-slate-500 text-sm font-medium">{stu.contact}</td>
                <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs">
                        {stu.score}
                    </span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button className="text-[10px] font-black uppercase text-indigo-500 hover:underline">
                    Preview SMS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* SECTION 3: BOTTOM ACTIONS */}
        <div className="p-8 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl border border-amber-100">
            <HiOutlineExclamation className="text-lg" />
            <span className="text-[11px] font-bold">Estimated Cost: 42.00 LKR</span>
          </div>

          <div className="flex gap-4">
            {/* CANCEL BUTTON (Rose Style) */}
            <button className="group flex items-center justify-center gap-2 px-8 h-[58px] rounded-2xl bg-white border-2 border-slate-100 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:border-rose-100 hover:text-rose-600 transition-all active:scale-95 shadow-sm">
              <HiOutlineX className="text-xl group-hover:rotate-90 transition-transform duration-300" />
              Discard
            </button>

            {/* SEND BUTTON */}
            <button className="flex items-center justify-center gap-3 px-10 h-[58px] rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg transition-all active:scale-95">
              <HiOutlinePaperAirplane className="text-xl rotate-45" />
              Send Broadcast
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}