import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBbTyHWp3qBNPVYdkauEWN9_FCu67govr0",
  authDomain: "abs1-96886.firebaseapp.com",
  projectId: "abs1-96886",
  storageBucket: "abs1-96886.firebasestorage.app",
  messagingSenderId: "139924754132",
  appId: "1:139924754132:web:cc366779227133dab5f541"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
