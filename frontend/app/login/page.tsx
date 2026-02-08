'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { loginWithBackend, getFirebaseToken, signInWithGoogle } from '@/lib/auth';
import { Monitor, Shield, Zap, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = await getFirebaseToken();
      if (token) {
        router.push('/dashboard');
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check if auth is initialized
      if (!auth) {
        toast.error('Authentication service is not available. Please refresh the page.');
        setLoading(false);
        return;
      }

      let userCredential;

      if (isLogin) {
        // Sign in existing user
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        // Create new user
        if (!fullName.trim()) {
          toast.error('Please enter your full name');
          setLoading(false);
          return;
        }
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }

      // Get Firebase ID token
      const firebaseToken = await userCredential.user.getIdToken();

      console.log('Firebase authentication successful, user:', userCredential.user.email);
      console.log('Firebase token obtained, length:', firebaseToken.length);

      // Login with backend
      try {
        await loginWithBackend(firebaseToken, {
          email: userCredential.user.email || email,
          full_name: fullName || userCredential.user.displayName || '',
          provider: 'password',
        });
        toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
        router.push('/dashboard');
      } catch (backendError: unknown) {
        // If backend fails but Firebase worked, show specific error
        console.error('Backend login failed:', backendError);
        const errorMsg = backendError instanceof Error ? backendError.message : '';
        if (errorMsg?.includes('firebase auth client not initialized') ||
          errorMsg?.includes('authentication service not configured')) {
          toast.error('Backend authentication service is not configured. Using test mode.');
          // Still redirect to dashboard as Firebase auth succeeded
          router.push('/dashboard');
        } else {
          throw backendError; // Re-throw to be caught by outer catch
        }
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      let errorMessage = 'An error occurred';
      const firebaseError = error as { code?: string; message?: string };

      if (firebaseError.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (firebaseError.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (firebaseError.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (firebaseError.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (firebaseError.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (firebaseError.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (firebaseError.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (firebaseError.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/Password authentication is not enabled. Please contact support.';
      } else if (firebaseError.code === 'auth/invalid-api-key') {
        errorMessage = 'Invalid Firebase configuration. Please contact support.';
      } else if (firebaseError.code === 'auth/app-not-authorized') {
        errorMessage = 'Firebase app is not authorized. Please check Firebase Console settings.';
      } else if ((error as { response?: { data?: { error?: string } } }).response?.data?.error) {
        errorMessage = (error as { response: { data: { error: string } } }).response.data.error;
      } else if ((error as { message?: string }).message) {
        errorMessage = (error as { message: string }).message;
      }

      // Log full error for debugging
      console.error('Full error object:', {
        code: firebaseError.code,
        message: firebaseError.message,
        stack: (error as Error).stack,
        response: (error as { response?: unknown }).response,
      });

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Signed in with Google successfully!');
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Google sign-in error:', error);
      let errorMessage = 'Failed to sign in with Google';
      const firebaseError = error as { code?: string; message?: string };

      if (firebaseError.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed';
      } else if (firebaseError.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked. Please allow popups for this site';
      } else if (firebaseError.message) {
        errorMessage = firebaseError.message;
      }

      toast.error(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden md:block space-y-6 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Monitor className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold">Better Uptime</h1>
          </div>

          <h2 className="text-4xl font-bold leading-tight">
            Monitor your services with confidence
          </h2>
          <p className="text-slate-300 text-lg">
            Real-time monitoring, instant alerts, and comprehensive analytics for all your services.
          </p>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Shield className="w-6 h-6 text-indigo-400 mb-2" />
              <h3 className="font-semibold mb-1">Secure</h3>
              <p className="text-sm text-slate-400">Enterprise-grade security</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <Zap className="w-6 h-6 text-indigo-400 mb-2" />
              <h3 className="font-semibold mb-1">Fast</h3>
              <p className="text-sm text-slate-400">Lightning quick monitoring</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center gap-3 mb-8 text-white">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Monitor className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold">Better Uptime</h1>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome back' : 'Create account'}
              </h2>
              <p className="text-slate-300">
                {isLogin
                  ? 'Sign in to your account to continue'
                  : 'Get started with Better Uptime today'}
              </p>
            </div>

            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading || googleLoading}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-md border border-gray-200 mb-5"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/10 text-slate-300">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="text-slate-300 hover:text-white transition-colors text-sm"
              >
                {isLogin ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <span className="text-indigo-400 font-semibold">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <span className="text-indigo-400 font-semibold">Sign in</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
