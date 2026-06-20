import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  HiOutlineAcademicCap, 
  HiOutlineLogout, 
  HiOutlineUserGroup, 
  HiOutlineClipboardList, 
  HiOutlineBookOpen, 
  HiOutlineHome,
  HiOutlineTrendingUp,
  HiOutlineMenuAlt2,
  HiOutlineClipboardCheck,
  HiOutlineArrowNarrowUp,
  HiX // Added for close button
} from "react-icons/hi";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: <HiOutlineHome /> },
  { label: "Students", to: "/students", icon: <HiOutlineUserGroup /> },
  { label: "Student Progress", to: "/progress", icon: <HiOutlineTrendingUp /> },
  { label: "Paper Categories", to: "/categories", icon: <HiOutlineClipboardList /> },
  { label: "Subjects", to: "/subjects", icon: <HiOutlineBookOpen /> },
  { label: "Marks Entry", to: "/marks-entry", icon: <HiOutlineClipboardCheck /> },
  { label: "Pass To Next Year", to: "/student-promotion", icon: <HiOutlineArrowNarrowUp /> },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem("tutorSidebarExpanded");
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("tutorSidebarExpanded", String(isExpanded));
    } catch (e) { console.warn("Storage access restricted"); }
  }, [isExpanded]);

  // Logic to determine if labels should be visible
  const shouldShowText = isExpanded || isMobileMenuOpen;

  // Compute classes for sliding and width to keep class logic simple
  const sidebarLeftClass = isMobileMenuOpen ? "left-0" : "-left-full lg:left-4";
  const sidebarWidthClass = isMobileMenuOpen ? "w-64" : (isExpanded ? "lg:w-64" : "lg:w-20");

  // Lock body scroll when mobile menu is open and allow Escape to close
  useEffect(() => {
    if (isMobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const onKey = (e) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
      window.addEventListener('keydown', onKey);
      return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
    }
  }, [isMobileMenuOpen]);

  // Publish the sidebar width as a CSS variable on :root so sibling layout can read it
  useEffect(() => {
    const compute = () => {
      const isLarge = window.innerWidth >= 1024;
      const val = isLarge ? (isMobileMenuOpen ? '16rem' : (isExpanded ? '16rem' : '5rem')) : '0rem';
      try { document.documentElement.style.setProperty('--tutor-sidebar-width', val); } catch {}
    };
    compute();
    window.addEventListener('resize', compute);
    return () => { try { document.documentElement.style.removeProperty('--tutor-sidebar-width'); } catch {} ; window.removeEventListener('resize', compute); };
  }, [isExpanded, isMobileMenuOpen]);

  // Hide global horizontal scrollbar but keep vertical scrolling
  useEffect(() => {
    const prevHtmlOverflowX = document.documentElement.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;
    try {
      document.documentElement.style.overflowX = 'hidden';
      document.body.style.overflowX = 'hidden';
    } catch (e) {}
    return () => {
      try {
        document.documentElement.style.overflowX = prevHtmlOverflowX || '';
        document.body.style.overflowX = prevBodyOverflowX || '';
      } catch (e) {}
    };
  }, []);

  return (
    <>
      {/* Mobile Header (Only visible on screens < 1024px) */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-white/10 text-white">
        <div className="flex items-center gap-2 font-bold text-lg">
          <HiOutlineAcademicCap className="text-2xl text-indigo-400" />
          EduTrack
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-2xl text-slate-400">
          {isMobileMenuOpen ? <HiX /> : <HiOutlineMenuAlt2 />}
        </button>
      </div>

      {/* Mobile Overlay (Darkens background when menu is open) */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 lg:top-4 h-full lg:h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out z-50 bg-slate-900/95 backdrop-blur-xl border-r lg:border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col py-6 ${sidebarLeftClass} ${sidebarWidthClass} lg:rounded-[2rem]`}
        style={{ "--tutor-sidebar-width": isMobileMenuOpen ? '16rem' : (isExpanded ? '16rem' : '5rem') }}
      >

        {/* Desktop Toggle Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`hidden lg:flex absolute top-6 p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all
                    ${isExpanded ? "right-4" : "left-1/2 -translate-x-1/2"}`}
        >
          <HiOutlineMenuAlt2 className="text-xl" />
        </button>
        
        {/* Brand Logo */}
        <div className={`mt-4 lg:mt-12 mb-8 flex items-center gap-3 transition-all ${shouldShowText ? "px-6" : "justify-center"}`}>
          <div className="min-w-[40px] h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 
                          rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
            <HiOutlineAcademicCap />
          </div>
          <span className={`font-bold text-lg tracking-tight text-white transition-opacity duration-300 ${shouldShowText ? "opacity-100" : "opacity-0 absolute"}`}>
            EduTrack
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                className={`relative group flex items-center py-3.5 rounded-xl transition-all duration-200
                  ${shouldShowText ? "px-4 gap-4" : "justify-center"}
                  ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
              >
                {isActive && <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />}
                <span className={`text-xl ${isActive ? "text-indigo-400" : "group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span className={`font-medium whitespace-nowrap transition-opacity ${shouldShowText ? "opacity-100" : "opacity-0 absolute"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="px-3 pt-4 border-t border-slate-800/50">
          <button
            onClick={() => navigate("/tutor/login")}
            className={`w-full flex items-center py-3.5 rounded-xl text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all group ${
              shouldShowText ? "px-4 gap-4" : "justify-center"
            }`}
          >
            <HiOutlineLogout className="text-xl" />
            <span className={`font-medium ${shouldShowText ? "block" : "hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}