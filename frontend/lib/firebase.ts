// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC0y0Vt_mndRS9tLykL4dsoUUk5cGjdvwo",
  authDomain: "better-uptime-auth.firebaseapp.com",
  projectId: "better-uptime-auth",
  storageBucket: "better-uptime-auth.firebasestorage.app",
  messagingSenderId: "770634605145",
  appId: "1:770634605145:web:a2060e579763b9ad214748",
  measurementId: "G-8MGV4H3ZZN"
};

// Initialize Firebase (avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth (only in browser)
let authInstance: ReturnType<typeof getAuth> | null = null;
if (typeof window !== 'undefined') {
  try {
    authInstance = getAuth(app);
  } catch (error) {
    console.error('Failed to initialize Firebase Auth:', error);
  }
}

export const auth = authInstance;

// Initialize Analytics (only in browser)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app };