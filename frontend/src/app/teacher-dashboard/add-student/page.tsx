"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavigationBar from '../components/NavigationBar';
import { userAPI } from '../../../services/api';

const AddStudentPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    grade: '',
    secretCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateSecretCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({
      ...prev,
      secretCode: result
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.grade) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await userAPI.addStudent({
        name: formData.name,
        email: formData.email || undefined,
        grade: formData.grade,
        role: 'student'
      });
      
      setSuccess('Student added successfully! Redirecting...');
      
      setTimeout(() => {
        router.push('/teacher-dashboard/students');
      }, 2000);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add student. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <NavigationBar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Add New Student</p>
            </div>

            <div className="p-4">
              <div className="bg-white rounded-2xl shadow-lg border border-[#dde0e4] p-8 max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <h1 className="text-[#111418] text-3xl font-bold leading-tight mb-2">
                    Add New Student
                  </h1>
                  <p className="text-[#637588] text-base">
                    Create a new student account for your class.
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

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter student's full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-gray-500 text-[#111418]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter student's email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-gray-500 text-[#111418]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">
                      Grade Level *
                    </label>
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 text-[#111418]"
                      required
                      aria-label="Select grade level"
                    >
                      <option value="">Select grade level</option>
                      <option value="1st">1st Grade</option>
                      <option value="2nd">2nd Grade</option>
                      <option value="3rd">3rd Grade</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#111418] text-sm font-medium mb-2">
                      Secret Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="secretCode"
                        placeholder="Secret code will be generated automatically"
                        value={formData.secretCode}
                        onChange={handleInputChange}
                        className="flex-1 h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-gray-500 text-[#111418] font-mono"
                        readOnly
                      />
                      <button
                        type="button"
                        onClick={generateSecretCode}
                        className="px-4 py-2 bg-[#f0f2f4] text-[#111418] rounded-xl hover:bg-[#e1e5e9] transition-colors font-medium"
                      >
                        Generate
                      </button>
                    </div>
                    <p className="text-[#637588] text-xs mt-1">
                      Students will use this code to log in. You can generate a new one anytime.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link
                      href="/teacher-dashboard/students"
                      className="flex-1 px-4 py-2 border border-[#dde0e4] text-[#111418] rounded-xl hover:bg-[#f8f9fa] transition-colors text-center"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Adding Student...
                        </div>
                      ) : (
                        'Add Student'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudentPage;