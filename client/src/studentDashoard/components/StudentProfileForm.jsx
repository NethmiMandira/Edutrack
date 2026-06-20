import React from 'react';
import { 
  HiOutlineBadgeCheck, 
  HiOutlinePhone,
  HiOutlineMail,
  HiOutlineCalendar,
  HiOutlineBookOpen,
} from "react-icons/hi";

const StudentProfileForm = ({ profile }) => {
  const subjectsText = Array.isArray(profile.subjects) && profile.subjects.length > 0
    ? profile.subjects
        .map((sub) => (typeof sub === 'string' ? sub : sub?.name || ''))
        .filter(Boolean)
        .join(', ')
    : 'Not assigned';

  const formattedDate = profile.dateRegistered
    ? new Date(profile.dateRegistered).toISOString().slice(0, 10)
    : 'Not available';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden p-8 md:p-12 relative min-h-[550px]">
        
        {/* Internal Content Glow */}
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Personal Details</h2>
            <div className="h-1 w-12 bg-indigo-500 rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <Field label="First Name" value={profile.firstName} />
            <Field label="Last Name" value={profile.lastName} />
            <Field label="Index Number" value={profile.indexNumber} icon={HiOutlineBadgeCheck} />
            <Field label="Current Grade" value={profile.grade} icon={HiOutlineBadgeCheck} />
            <Field label="Current Year" value={profile.currentYear || 'Not set'} icon={HiOutlineCalendar} />
            <Field label="Registered Email" value={profile.email || 'Not set'} icon={HiOutlineMail} />
            <div className="md:col-span-2">
              <Field label="Registered Contact" value={profile.contact} icon={HiOutlinePhone} />
            </div>
            <div className="md:col-span-2">
              <Field label="Subjects Enrolled" value={subjectsText} icon={HiOutlineBookOpen} />
            </div>
            <Field label="Date Registered" value={formattedDate} icon={HiOutlineCalendar} />
          </div>
        </section>

        {/* Bottom subtle border */}
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-slate-100 via-transparent to-transparent" />
      </div>
    </div>
  );
};

// --- SUB-COMPONENT ---

const Field = ({ label, value, icon: Icon }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-400 ml-1">
      {label}
    </span>
    <div className="relative group">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xl" />}
      <div className={`w-full ${Icon ? 'pl-12' : 'px-6'} py-4 rounded-2xl border-2 border-slate-100 bg-slate-50/50 text-slate-900 font-bold text-sm tracking-tight`}>
        {value}
      </div>
    </div>
  </div>
);

export default StudentProfileForm;