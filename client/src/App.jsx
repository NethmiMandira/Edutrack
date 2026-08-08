import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import StudentRegistration from './pages/StudentRegistration';
import Subjects from './pages/Subjects';
import Categories from './pages/categories';
import MarksEntry from './pages/MarksEntry';
import Progress from './pages/Progress';
import StudentPromotion from './pages/StudentPromotion';
import Dashboard from './pages/Dashboard';
import TutorLogin from './pages/TutorLogin';
import TutorProtectedRoute from './components/TutorProtectedRoute';
import StudentLogin from './studentDashoard/pages/StudentLogin';
import StudentDashboard from './studentDashoard/pages/StudentDashboard';
import StudentMyProgress from './studentDashoard/pages/StudentMyProgress';
import StudentPaperHistory from './studentDashoard/pages/StudentPaperHistory';
import StudentProfile from './studentDashoard/pages/StudentProfile';

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/20 text-center">
          
          {/* Logo / Badge Icon */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-[1px] mb-6 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <svg 
                className="w-7 h-7 text-indigo-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 14l9-5-9-5-9 5 9 5z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" 
                />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Welcome to <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">EduTrack</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Access your academic dashboard to track your progress, view paper history, and manage your profile.
          </p>

          {/* Action Area */}
          <div className="mt-8">
            <Link
              to="/student/login"
              className="group relative inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Go to Student Portal</span>
              <svg 
                className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

         

        </div>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/dashboard"
        element={(
          <TutorProtectedRoute>
            <Dashboard />
          </TutorProtectedRoute>
        )}
      />

      <Route
        path="/students"
        element={(
          <TutorProtectedRoute>
            <StudentRegistration />
          </TutorProtectedRoute>
        )}
      />
    
      <Route
        path="/subjects"
        element={(
          <TutorProtectedRoute>
            <Subjects />
          </TutorProtectedRoute>
        )}
      />
      <Route
        path="/categories"
        element={(
          <TutorProtectedRoute>
            <Categories />
          </TutorProtectedRoute>
        )}
      />
      <Route
        path="/marks-entry"
        element={(
          <TutorProtectedRoute>
            <MarksEntry />
          </TutorProtectedRoute>
        )}
      />
      <Route
        path="/progress"
        element={(
          <TutorProtectedRoute>
            <Progress />
          </TutorProtectedRoute>
        )}
      />
      <Route
        path="/student-promotion"
        element={(
          <TutorProtectedRoute>
            <StudentPromotion />
          </TutorProtectedRoute>
        )}
      />
      <Route path="/tutor/login" element={<TutorLogin />} />

      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student" element={<StudentLogin />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/my-progress" element={<StudentMyProgress />} />
      <Route path="/student/paper-history" element={<StudentPaperHistory />} />
      <Route path="/student/profile" element={<StudentProfile />} />
    </Routes>
  );
};

export default App;