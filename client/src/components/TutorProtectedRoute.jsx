import React from 'react';
import { Navigate } from 'react-router-dom';

export default function TutorProtectedRoute({ children }) {
  let tutor = null;
  try {
    tutor = JSON.parse(localStorage.getItem('tutor') || 'null');
  } catch {
    localStorage.removeItem('tutor');
  }

  if (!tutor || tutor.role !== 'tutor' || !localStorage.getItem('tutorToken')) {
    return <Navigate to="/tutor/login" replace />;
  }

  return children;
}
