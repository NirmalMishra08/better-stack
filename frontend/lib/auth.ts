import { onAuthStateChanged, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from './firebase';
import { authAPI } from './api';

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Get Firebase auth instance
export const getFirebaseAuth = () => {
  return auth;
};

// Get current user's Firebase token
export const getFirebaseToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') return null;

  try {
    const auth = getFirebaseAuth();
    if (!auth) return null;

    const user = auth.currentUser;
    if (!user) return null;

    const token = await user.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting Firebase token:', error);
    return null;
  }
};

// Set Firebase token in localStorage
export const setFirebaseToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('firebase_token', token);
  }
};

// Clear Firebase token
export const clearFirebaseToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('firebase_token');
  }
};

// Login with Firebase and backend
export const loginWithBackend = async (firebaseToken: string, userData?: {
  provider?: string;
  email?: string;
  phone?: string;
  full_name?: string;
  password?: string;
}) => {
  try {
    setFirebaseToken(firebaseToken);
    const response = await authAPI.login(firebaseToken, userData);
    return response;
  } catch (error: any) {
    console.error('Backend login error:', error);

    // If backend login fails, clear the token
    clearFirebaseToken();

    // Re-throw with more context
    if (error.response) {
      // Backend returned an error response
      const backendError = error.response.data?.error || error.response.data?.message || 'Backend authentication failed';
      throw new Error(backendError);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Cannot connect to server. Please check if the backend is running.');
    } else {
      // Something else happened
      throw error;
    }
  }
};

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getFirebaseToken();
  if (!token) return false;

  setFirebaseToken(token);
  return true;
};

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth();
    if (!auth) {
      throw new Error('Firebase auth not initialized');
    }

    const result = await signInWithPopup(auth, googleProvider);
    const firebaseToken = await result.user.getIdToken();

    // Login with backend
    await loginWithBackend(firebaseToken, {
      email: result.user.email || '',
      full_name: result.user.displayName || '',
      provider: 'google.com',
    });

    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Sign out user
export const logout = async () => {
  try {
    const auth = getFirebaseAuth();
    if (auth) {
      await signOut(auth);
    }
    clearFirebaseToken();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

// Listen to auth state changes
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
  if (typeof window === 'undefined') return () => { };

  const auth = getFirebaseAuth();
  if (!auth) return () => { };

  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const token = await user.getIdToken();
      setFirebaseToken(token);
    } else {
      clearFirebaseToken();
    }
    callback(user);
  });
};


