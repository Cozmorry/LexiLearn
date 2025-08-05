"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Footer from '../components/Footer';
import { authAPI, tokenUtils } from '../../services/api';

interface Student {
  _id: string;
  name: string;
  secretCode: string;
  grade: string;
}

export default function StudentLoginPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(true);
  const router = useRouter();

  // Load students for dropdown
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoadingStudents(true);
        const response = await authAPI.getAllStudents();
        setStudents(response.students || []);
      } catch (error) {
        console.error('Error loading students:', error);
        setError('Failed to load student list. Please try refreshing the page.');
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, []);

  const handleStudentLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedStudentId) {
      setError('Please select your name from the list');
      return;
    }

    if (!secretCode.trim()) {
      setError('Please enter your secret code');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const selectedStudent = students.find(s => s._id === selectedStudentId);
      if (!selectedStudent) {
        setError('Selected student not found');
        return;
      }

      const response = await authAPI.studentLogin(secretCode, selectedStudent.name);
      
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

  const selectedStudent = students.find(s => s._id === selectedStudentId);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 flex-1">
            {/* LexiLearn Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#4798ea] to-[#3a7bc8] rounded-xl shadow-lg mb-4">
                <svg className="w-9 h-9 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 className="text-[#4798ea] text-2xl font-bold leading-tight">LexiLearn</h1>
              <p className="text-[#637588] text-sm font-medium mt-1">Reading & Learning</p>
            </div>
            
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
                  Select Your Name
                </label>
                {loadingStudents ? (
                  <div className="w-full p-3 border border-[#dde0e4] rounded-xl bg-[#f0f2f4] flex items-center justify-center">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[#637588]">Loading students...</span>
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full p-3 border border-[#dde0e4] rounded-xl bg-white text-[#111418] focus:outline-none focus:border-[#4798ea] transition-colors"
                    required
                    aria-label="Select your name from the list"
                  >
                    <option value="">Select your name from the list</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name} (Grade {student.grade})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="mb-6">
                <label className="block text-[#111418] text-sm font-medium mb-2">
                  Secret Code
                </label>
                <input
                  type="text"
                  placeholder="Type your secret code to begin!"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  className="w-full p-3 border border-[#dde0e4] rounded-xl bg-white text-[#111418] placeholder:text-[#637588] focus:outline-none focus:border-[#4798ea] transition-colors"
                  maxLength={9}
                  required
                />
                <p className="text-[#637588] text-xs mt-2">
                  Your secret code is 9 characters long (e.g., ABC123XYZ)
                </p>
                {selectedStudent && (
                  <p className="text-[#4798ea] text-xs mt-1">
                    Expected code for {selectedStudent.name}: {selectedStudent.secretCode}
                  </p>
                )}
              </div>
              
              <button 
                type="submit"
                disabled={isLoading || loadingStudents || !selectedStudentId}
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
