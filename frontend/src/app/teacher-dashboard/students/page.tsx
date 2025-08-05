"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import { userAPI, tokenUtils } from '../../../services/api';
import { useRouter } from 'next/navigation';

interface Student {
  _id: string;
  name: string;
  email: string;
  grade: string;
  secretCode: string;
  avatar?: string;
  lastLogin?: string;
  performance?: {
    overallPercentage: number;
    averageScore: number;
    recentScores: number[];
  };
}

interface PerformanceData {
  studentId: string;
  overallPercentage: number;
  averageScore: number;
  recentScores: number[];
}

const TeacherStudentsPage: React.FC = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [showPerformance, setShowPerformance] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await userAPI.getMyStudents();
        const studentsData = response.students || [];
        setStudents(studentsData);

        // Load performance data for all students
        await loadPerformanceData(studentsData);
      } catch (error) {
        console.error('Error loading students:', error);
        setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const loadPerformanceData = async (studentsList: Student[]) => {
    try {
      const performancePromises = studentsList.map(async (student) => {
        try {
          // Get student's quiz submissions (placeholder for future implementation)
          const response = { submissions: [] };
          
          console.log(`Student ${student.name} response:`, response);
          
          // Check if response has the expected structure
          let submissions = [];
          if (response && typeof response === 'object') {
            if (Array.isArray(response)) {
              submissions = response;
            } else if (response.submissions && Array.isArray(response.submissions)) {
              submissions = response.submissions;
            } else if (response.success && response.submissions && Array.isArray(response.submissions)) {
              submissions = response.submissions;
            }
          }
          
          console.log(`Student ${student.name} submissions:`, submissions);
          
          if (!Array.isArray(submissions) || submissions.length === 0) {
            console.log(`No submissions found for student ${student.name}`);
            return {
              studentId: student._id,
              overallPercentage: 0,
              averageScore: 0,
              recentScores: []
            };
          }

          // Calculate scores properly - use the percentage field from QuizSubmission
          const scores = submissions.map((sub: any) => {
            // The QuizSubmission model has a 'percentage' field that stores the calculated percentage
            if (sub.percentage !== undefined) {
              return sub.percentage;
            }
            // Fallback: if percentage is not available, calculate from totalScore and maxScore
            if (sub.totalScore !== undefined && sub.maxScore !== undefined && sub.maxScore > 0) {
              return Math.round((sub.totalScore / sub.maxScore) * 100);
            }
            // Final fallback
            return 0;
          });
          
          const averageScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
          const overallPercentage = averageScore;

          console.log(`Student ${student.name} performance:`, {
            overallPercentage,
            averageScore,
            recentScores: scores.slice(-5)
          });

          return {
            studentId: student._id,
            overallPercentage,
            averageScore,
            recentScores: scores.slice(-5) // Last 5 scores
          };
        } catch (error) {
          console.error(`Error loading performance for student ${student._id}:`, error);
          // Return default performance data for this student
          return {
            studentId: student._id,
            overallPercentage: 0,
            averageScore: 0,
            recentScores: []
          };
        }
      });

      const performanceResults = await Promise.all(performancePromises);
      console.log('All performance results:', performanceResults);
      setPerformanceData(performanceResults);

      // Update students with performance data
      setStudents(prevStudents => 
        prevStudents.map(student => {
          const perf = performanceResults.find(p => p.studentId === student._id);
          return {
            ...student,
            performance: perf ? {
              overallPercentage: perf.overallPercentage,
              averageScore: perf.averageScore,
              recentScores: perf.recentScores
            } : undefined
          };
        })
      );
    } catch (error) {
      console.error('Error loading performance data:', error);
      // Set default performance data for all students if there's an error
      setStudents(prevStudents => 
        prevStudents.map(student => ({
          ...student,
          performance: {
            overallPercentage: 0,
            averageScore: 0,
            recentScores: []
          }
        }))
      );
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Satisfactory';
    if (percentage >= 60) return 'Needs Improvement';
    return 'Poor';
  };

  const PerformanceModal = ({ student, onClose }: { student: Student; onClose: () => void }) => {
    if (!student.performance) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[#111418]">{student.name}'s Performance</h2>
            <button
              onClick={onClose}
              className="text-[#637588] hover:text-[#111418]"
              aria-label="Close performance modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {/* Overall Performance */}
            <div className="bg-gradient-to-r from-[#4798ea] to-[#3a7bc8] rounded-xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Overall Performance</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold">{student.performance.overallPercentage}%</div>
                <div className="flex-1">
                  <div className="text-sm opacity-90">{getPerformanceLabel(student.performance.overallPercentage)}</div>
                  <div className="text-sm opacity-75">
                    Average score from recent activities
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#111418]">{student.performance.averageScore}%</div>
                <div className="text-sm text-[#637588]">Average Score</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#111418]">{student.performance.recentScores.length}</div>
                <div className="text-sm text-[#637588]">Recent Activities</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="text-2xl font-bold text-[#111418]">
                  {student.performance.recentScores.length > 0 
                    ? Math.round(student.performance.recentScores.reduce((sum, score) => sum + score, 0) / student.performance.recentScores.length)
                    : 0}%
                </div>
                <div className="text-sm text-[#637588]">Recent Average</div>
              </div>
            </div>

            {/* Recent Performance */}
            {student.performance.recentScores.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-[#111418] mb-4">Recent Performance</h3>
                <div className="space-y-2">
                  {student.performance.recentScores.map((score, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-[#637588]">Activity {student.performance.recentScores.length - index}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Insights */}
            <div>
              <h3 className="text-lg font-semibold text-[#111418] mb-4">Performance Insights</h3>
              <div className="space-y-3">
                {student.performance.overallPercentage >= 90 && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-800">Excellent performance! Keep up the great work.</span>
                  </div>
                )}
                {student.performance.overallPercentage < 70 && (
                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-yellow-800">Consider providing additional support and resources.</span>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <NavigationBar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading students...</p>
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
          {/* Sidebar */}
          <NavigationBar />

          {/* Main Content */}
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">My Students</p>
              <button
                onClick={() => setShowPerformance(!showPerformance)}
                className="px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors"
              >
                {showPerformance ? 'Hide Performance' : 'Show Performance'}
              </button>
            </div>

            {error ? (
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
                {/* Performance Overview */}
                {showPerformance && (
                  <div className="p-4 mb-4">
                    <div className="bg-gradient-to-r from-[#4798ea] to-[#3a7bc8] rounded-xl p-6 text-white">
                      <h3 className="text-xl font-semibold mb-4">Class Performance Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-3xl font-bold">
                            {students.length > 0 
                              ? Math.round(students.reduce((sum, student) => 
                                  sum + (student.performance?.overallPercentage || 0), 0) / students.length)
                              : 0}%
                          </div>
                          <div className="text-sm opacity-90">Class Average</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold">
                            {students.filter(s => s.performance?.overallPercentage >= 80).length}
                          </div>
                          <div className="text-sm opacity-90">High Performers (80%+)</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold">
                            {students.filter(s => s.performance?.overallPercentage < 70).length}
                          </div>
                          <div className="text-sm opacity-90">Need Support (&lt;70%)</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold">
                            {students.filter(s => s.performance?.recentScores.length > 0).length}
                          </div>
                          <div className="text-sm opacity-90">Active Students</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

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
                        
                        {/* Performance Display */}
                        {showPerformance && student.performance && (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-xs text-[#637588]">Performance</span>
                            <button
                              onClick={() => setSelectedStudent(student)}
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(student.performance.overallPercentage)} hover:opacity-80 transition-opacity`}
                            >
                              {student.performance.overallPercentage}%
                            </button>
                          </div>
                        )}

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
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-[#4798ea] text-white rounded-xl font-medium hover:bg-[#3a7bc8] transition-colors"
                    onClick={() => router.push('/teacher-dashboard/add-student')}
                  >
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

      {/* Performance Modal */}
      {selectedStudent && (
        <PerformanceModal 
          student={selectedStudent} 
          onClose={() => setSelectedStudent(null)} 
        />
      )}
    </div>
  );
};

export default TeacherStudentsPage; 