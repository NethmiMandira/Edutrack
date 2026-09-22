import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration for edutrack-2a736
const firebaseConfig = {
  apiKey: "AIzaSyDS7hfpBrOwjp-WnJdU3hHz-pamtWK_1ig",
  authDomain: "edutrack-2a736.firebaseapp.com",
  projectId: "edutrack-2a736",
  storageBucket: "edutrack-2a736.firebasestorage.app",
  messagingSenderId: "86107452145",
  appId: "1:86107452145:web:d3de9a715392ecd923af50",
  measurementId: "G-NJENSKCT20"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Analytics only initializes in browser environments
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, auth, db, analytics };