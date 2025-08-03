"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import { userAPI, tokenUtils } from '../../../services/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  grade: string;
  secretCode: string;
  avatar?: string;
  lastLogin?: string;
}

const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await userAPI.getMyStudents();
        setStudents(response.students || []);
      } catch (error) {
        console.error('Error loading students:', error);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          {/* Sidebar */}
          <NavigationBar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">My Students</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading students...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                  <p className="text-red-600 text-lg font-medium">Oops! Something went wrong</p>
                  <p className="text-[#637588] text-center">{error}</p>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 bg-[#f0f2f4] rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-[#637588] text-lg">No students yet</p>
                  <p className="text-[#637588] text-sm text-center">Students will appear here once they're assigned to your class.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Students List */}
                <div className="p-4">
                  <div className="grid gap-4">
                    {students.map((student) => (
                      <div key={student._id} className="flex items-center gap-4 p-4 border border-[#dde0e4] rounded-xl hover:bg-[#f8f9fa] transition-colors">
                        <div className="w-12 h-12 bg-[#4798ea] rounded-full flex items-center justify-center text-white font-semibold">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#111418] font-medium">{student.name}</h3>
                          <p className="text-[#637588] text-sm">{student.email}</p>
                          <p className="text-[#637588] text-xs">Grade: {student.grade}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-[#637588]">Secret Code</span>
                          <span className="text-sm font-mono bg-[#f0f2f4] px-2 py-1 rounded text-[#111418]">
                            {student.secretCode}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-xs text-[#637588]">Last Login</span>
                          <span className="text-xs text-[#637588]">
                            {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Student Button */}
                <div className="p-4">
                  <button className="flex items-center gap-2 px-6 py-3 bg-[#4798ea] text-white rounded-xl font-medium hover:bg-[#3a7bc8] transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Student
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherStudentsPage; 