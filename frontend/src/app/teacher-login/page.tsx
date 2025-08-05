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