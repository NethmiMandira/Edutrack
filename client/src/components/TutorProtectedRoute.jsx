import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

const TUTOR_UID = 'b8B7cTSZUUMvIfVWzA4HFz0yAJJ3';

export default function TutorProtectedRoute({ children }) {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!currentUser || currentUser.uid !== TUTOR_UID) {
    return <Navigate to="/tutor/login" replace />;
  }

  return children;
}
