"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authAPI, tokenUtils } from '../../services/api';

export default function StudentLoginPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleStudentLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError('Please enter your secret code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.studentLogin(searchTerm, name);
      
      // Store token and user data
      tokenUtils.setToken(response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setSuccess('Login successful! Redirecting...');
      
      // Redirect to student dashboard
      setTimeout(() => {
        router.push('/student-dashboard');
      }, 1000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please check your secret code.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
            <h2 className="text-[#111418] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">
              Welcome to LexiLearn
            </h2>
            
            {error && (
              <div className="mx-4 mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mx-4 mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                {success}
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="px-4 py-3">
              <div className="mb-4">
                <label className="block text-[#111418] text-sm font-medium mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-[#dde0e4] rounded-xl bg-white text-[#111418] placeholder:text-[#637588] focus:outline-none focus:border-[#4798ea] transition-colors"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-[#111418] text-sm font-medium mb-2">
                  Secret Code
                </label>
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div
                    className="text-[#637588] flex border-none bg-[#f0f2f4] items-center justify-center pl-4 rounded-l-xl border-r-0"
                    data-icon="MagnifyingGlass"
                    data-size="24px"
                    data-weight="regular"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                      <path
                        d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Type your secret code to begin!"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border-none bg-[#f0f2f4] focus:border-none h-full placeholder:text-[#637588] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    maxLength={9}
                    required
                  />
                </div>
                <p className="text-[#637588] text-xs mt-2">
                  Your secret code is 9 characters long (e.g., ABC123XYZ)
                </p>
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center rounded-xl text-white bg-[#1E90FF] h-12 w-full text-base font-bold leading-normal hover:bg-[#1873cc] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Logging in...
                  </div>
                ) : (
                  'START LEARNING'
                )}
              </button>
            </form>
            
            <div className="px-4 py-3 text-center">
              <p className="text-[#637588] text-sm">
                Don't have a secret code? Ask your teacher for one!
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}
