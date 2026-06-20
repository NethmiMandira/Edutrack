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
    <div>
      <div className="p-6 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold text-slate-900 text-center">Welcome to EduTrack</h1>
          <p className="mt-2 text-center text-slate-600">Choose your dashboard to continue</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Student Dashboard</h2>
              <p className="mt-2 text-sm text-slate-600">
                View your progress, paper history, and profile details.
              </p>
              <Link
                to="/student/login"
                className="mt-5 inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Go to Student
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Tutor Dashboard</h2>
              <p className="mt-2 text-sm text-slate-600">
                Manage students, subjects, papers, and marks.
              </p>
              <Link
                to="/tutor/login"
                className="mt-5 inline-block rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-600"
              >
                Go to Tutor
              </Link>
            </div>
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