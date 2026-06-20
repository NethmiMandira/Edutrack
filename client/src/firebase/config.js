import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyCdnxjatu4_EkgheCkjsW08LxEKfjEtG7s',
  authDomain: 'sk-maths-zone.firebaseapp.com',
  projectId: 'sk-maths-zone',
  storageBucket: 'sk-maths-zone.firebasestorage.app',
  messagingSenderId: '756333606184',
  appId: '1:756333606184:web:512e551f888494bd544c1d',
  measurementId: 'G-RXBWGH0CPN'
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, auth, analytics };
