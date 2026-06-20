import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  HiOutlineAcademicCap, 
  HiOutlineLogout, 
  HiOutlineHome,
  HiOutlineTrendingUp,
  HiOutlineClipboardList,
  HiOutlineUser,
  HiOutlineMenuAlt2,
} from "react-icons/hi";

// Student-specific menu items
const navItems = [
  { label: "Dashboard", to: "/student/dashboard", icon: <HiOutlineHome /> },
  { label: "My Progress", to: "/student/my-progress", icon: <HiOutlineTrendingUp /> },
  { label: "Paper History", to: "/student/paper-history", icon: <HiOutlineClipboardList /> },
  { label: "Profile", to: "/student/profile", icon: <HiOutlineUser /> },
];

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Persistence logic for desktop sidebar
  const [isExpanded, setIsExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem("studentSidebarExpanded");
      return saved === null ? true : saved === "true";
    } catch { return true; }
  });

  useEffect(() => {
    try {
      localStorage.setItem("studentSidebarExpanded", String(isExpanded));
    } catch (e) { console.warn("Storage access restricted"); }
    
    // Syncs the layout width variable
    document.documentElement.style.setProperty("--student-sidebar-width", isExpanded ? "16rem" : "5.5rem");
  }, [isExpanded]);

  const handleLogout = () => {
    navigate('/student/login');
  };

  return (
    <>
      {/* Mobile/Tablet Top Navbar */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 sm:h-9 w-8 sm:w-9 bg-gradient-to-tr from-indigo-500 to-purple-500 
                            rounded-lg flex items-center justify-center text-white text-lg sm:text-lg shadow-lg shadow-indigo-500/20">
              <HiOutlineAcademicCap />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-white">
              EduTrack
            </span>
          </div>

          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
          >
            <HiOutlineMenuAlt2 className="text-xl sm:text-2xl" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-1 border-t border-slate-800/50">
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all
                    ${isActive ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
                >
                  <span className="text-lg sm:text-xl">{item.icon}</span>
                  <span className="font-medium text-sm sm:text-base">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
            >
              <HiOutlineLogout className="text-lg sm:text-xl" />
              <span className="font-medium text-sm sm:text-base">Logout</span>
            </button>
          </nav>
        )}
      </header>

      {/* Desktop Left Sidebar */}
      <aside className={`hidden lg:flex fixed top-4 left-4 h-[calc(100vh-2rem)] transition-all duration-300 ease-in-out z-50
                      bg-slate-900/95 backdrop-blur-xl border border-white/10
                      rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex-col py-6
                      ${isExpanded ? "w-64" : "w-20"}`}>

        {/* Toggle Button */}
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className={`absolute top-6 p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all
                      ${isExpanded ? "right-4" : "left-1/2 -translate-x-1/2"}`}
        >
          <HiOutlineMenuAlt2 className="text-xl" />
        </button>
        
        {/* Brand Logo */}
        <div className={`mt-12 mb-8 flex items-center gap-3 transition-all ${isExpanded ? "px-6" : "justify-center"}`}>
          <div className="min-w-[40px] h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 
                          rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20">
            <HiOutlineAcademicCap />
          </div>
          <span className={`font-bold text-lg tracking-tight text-white transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0 absolute"}`}>
            EduTrack
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <style>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`relative group flex items-center py-3.5 rounded-xl transition-all duration-200
                  ${isExpanded ? "px-4 gap-4" : "justify-center"}
                  ${isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}
              >
                {/* Active Indicator Line */}
                {isActive && <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full" />}
                
                <span className={`text-xl ${isActive ? "text-indigo-400" : "group-hover:text-white"}`}>
                  {item.icon}
                </span>
                <span className={`font-medium whitespace-nowrap transition-opacity ${isExpanded ? "opacity-100" : "opacity-0 absolute"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="px-3 pt-4 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center py-3.5 rounded-xl text-rose-400/80 hover:bg-rose-500/10 hover:text-rose-400 transition-all group ${
              isExpanded ? "px-4 gap-4" : "justify-center"
            }`}
          >
            <HiOutlineLogout className="text-xl" />
            <span className={`font-medium ${isExpanded ? "block" : "hidden"}`}>Logout</span>
          </button>
        </div>
      </aside>

      {/* Spacer for mobile/tablet navbar */}
      <div className="lg:hidden h-14 sm:h-16" />
    </>
  );
}