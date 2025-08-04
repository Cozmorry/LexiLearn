"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authAPI, tokenUtils } from '../../services/api';

export default function TeacherLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleTeacherLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.login({ email, password });
      
      // Check if user is a teacher
      if (response.user.role !== 'teacher') {
        setError('This login is for teachers only. Students should use the student login.');
        return;
      }
      
      // Store token and user data
      tokenUtils.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to teacher dashboard
      setTimeout(() => {
        router.push('/teacher-dashboard');
      }, 1000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="flex flex-1 justify-center items-center py-5">
          <div className="w-full max-w-md mx-auto px-6">
            {/* Login Form Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e4] p-8">
              <div className="text-center mb-8">
                <h1 className="text-gray-900 text-3xl font-bold leading-tight mb-2">
                  Teacher Login
                </h1>
                <p className="text-[#637588] text-base">
                  Welcome back! Sign in to your teacher account.
                </p>
              </div>
            
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                  {success}
                </div>
              )}

              <form onSubmit={handleTeacherLogin} className="space-y-6">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-[#637588] text-[#111418]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-[#637588] text-[#111418]"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-[#4798ea] text-white rounded-xl font-semibold hover:bg-[#3a7bc8] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <div className="mt-8">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#dde0e4]"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-[#637588]">Or continue with</span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button className="w-full h-12 px-4 border border-[#dde0e4] rounded-xl bg-white text-[#111418] font-medium hover:bg-[#f8f9fa] transition-colors duration-200 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google
                  </button>
                  <button className="w-full h-12 px-4 border border-[#dde0e4] rounded-xl bg-white text-[#111418] font-medium hover:bg-[#f8f9fa] transition-colors duration-200 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#00A1F1" d="M23.5 12.5c0-6.627-5.373-12-12-12S-.5 5.873-.5 12.5c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.172V9.642c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.112 23.454 23.5 18.49 23.5 12.5z"/>
                    </svg>
                    Microsoft
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center">
                <p className="text-[#637588] text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/teacher-signup" 
                    className="text-[#4798ea] hover:text-[#3a7bc8] font-medium transition-colors"
                  >
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>

            {/* Back to Home Link */}
            <div className="mt-6 text-center">
              <Link 
                href="/" 
                className="text-[#637588] hover:text-[#4798ea] text-sm transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}