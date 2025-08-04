"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../teacher-dashboard/components/NavigationBar'; 
import Link from 'next/link';
import { userAPI, progressAPI } from '../../services/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  grade: string;
  secretCode: string;
  avatar?: string;
}

interface Progress {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    grade: string;
  };
  moduleId: {
    _id: string;
    title: string;
    category: string;
  };
  score: number;
  lastActivity: string;
  timeSpent: number;
  status: string;
}

export default function TeacherDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load students and progress data
      const [studentsResponse, progressResponse] = await Promise.all([
        userAPI.getMyStudents(),
        progressAPI.getStudentSummary()
      ]);




      setStudents(studentsResponse.students || []);
      setProgress(progressResponse.recentActivity || []);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate real statistics
  const totalStudents = students.length;
  const totalModulesCompleted = progress.filter(p => p.status === 'completed').length;
  const averageScore = progress.length > 0 
    ? Math.round(progress.reduce((sum, p) => sum + (p.score || 0), 0) / progress.length)
    : 0;

  // Get recent activity (last 5 progress entries)
  const recentActivity = progress
    .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 5);

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student?.name || 'Unknown Student';
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <NavigationBar/>
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading dashboard...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar/>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Teacher Command Center</p>
              <Link 
                href="/teacher-dashboard/add-module"
                className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
              >
                + Create Module
              </Link>
            </div>
            
            {/* Summary Statistics Cards */}
            <div className="flex flex-wrap gap-4 p-4">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5]">
                <p className="text-[#111418] text-base font-medium leading-normal">Total Students</p>
                <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">{totalStudents}</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5]">
                <p className="text-[#111418] text-base font-medium leading-normal">Modules Completed</p>
                <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">{totalModulesCompleted}</p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-[#dce0e5]">
                <p className="text-[#111418] text-base font-medium leading-normal">Average Score</p>
                <p className="text-[#111418] tracking-light text-2xl font-bold leading-tight">{averageScore}%</p>
              </div>
            </div>

            {/* Secret Code Section */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Secret Codes</h2>
            <div className="px-4 py-3">
              {students.length > 0 ? (
                <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                          Student Name
                        </th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Grade</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                          Secret Code
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student._id} className="border-t border-t-[#dce0e5]">
                          <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                            {student.name}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">{student.grade}</td>
                          <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal font-mono">
                            {student.secretCode}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#dce0e5] p-8 text-center">
                  <div className="text-[#637588] mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <h3 className="text-[#111418] text-lg font-semibold mb-2">No students yet</h3>
                  <p className="text-[#637588] mb-6">Add your first student to get started.</p>
                  <Link 
                    href="/teacher-dashboard/add-student"
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors"
                  >
                    Add Student
                  </Link>
                </div>
              )}
            </div>

            {/* Recent Activity Section */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Recent Activity</h2>
            <div className="px-4 py-3">
              {recentActivity.length > 0 ? (
                <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                          Student Name
                        </th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Module</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                          Score
                        </th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentActivity.map((activity) => (
                        <tr key={activity._id} className="border-t border-t-[#dce0e5]">
                          <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                            {activity.studentId?.name || 'Unknown Student'}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#4798ea] text-sm font-normal leading-normal">
                            <Link href="#" className="hover:underline">{activity.moduleId?.title || 'Unknown Module'}</Link>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            <div className="flex items-center gap-2">
                              <span>{activity.score || 0}</span>
                              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    (activity.score || 0) >= 90 ? 'bg-green-500' :
                                    (activity.score || 0) >= 80 ? 'bg-yellow-500' :
                                    'bg-red-500'
                                  }`}
                                  style={{ width: `${activity.score || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            {new Date(activity.lastActivity).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#dce0e5] p-8 text-center">
                  <div className="text-[#637588] mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-[#111418] text-lg font-semibold mb-2">No recent activity</h3>
                  <p className="text-[#637588] mb-6">Student progress will appear here once they start completing modules.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}