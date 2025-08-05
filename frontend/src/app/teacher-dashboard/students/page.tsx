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
  
  // New state for student profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedProfileStudent, setSelectedProfileStudent] = useState<Student | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    grade: '',
    secretCode: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

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
            // Fallback: calculate percentage from score and total
            if (sub.score !== undefined && sub.totalScore !== undefined) {
              return Math.round((sub.score / sub.totalScore) * 100);
            }
            // Another fallback: use score directly if it's already a percentage
            if (sub.score !== undefined && sub.score <= 100) {
              return sub.score;
            }
            return 0;
          });

          const averageScore = scores.length > 0 
            ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
            : 0;

          return {
            studentId: student._id,
            overallPercentage: averageScore,
            averageScore: averageScore,
            recentScores: scores.slice(-5) // Last 5 scores
          };
        } catch (error) {
          console.error(`Error loading performance for student ${student.name}:`, error);
          return {
            studentId: student._id,
            overallPercentage: 0,
            averageScore: 0,
            recentScores: []
          };
        }
      });

      const performanceResults = await Promise.all(performancePromises);
      setPerformanceData(performanceResults);

      // Update students with performance data
      const updatedStudents = studentsList.map(student => {
        const performance = performanceResults.find(p => p.studentId === student._id);
        return {
          ...student,
          performance: performance ? {
            overallPercentage: performance.overallPercentage,
            averageScore: performance.averageScore,
            recentScores: performance.recentScores
          } : {
            overallPercentage: 0,
            averageScore: 0,
            recentScores: []
          }
        };
      });
      setStudents(updatedStudents);

    } catch (error) {
      console.error('Error loading performance data:', error);
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-100 text-green-800';
    if (percentage >= 80) return 'bg-blue-100 text-blue-800';
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPerformanceLabel = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 80) return 'Good';
    if (percentage >= 70) return 'Fair';
    return 'Needs Improvement';
  };

  // Handle student card click
  const handleStudentCardClick = (student: Student) => {
    setSelectedProfileStudent(student);
    setEditFormData({
      name: student.name,
      email: student.email || '',
      grade: student.grade,
      secretCode: student.secretCode
    });
    setShowProfileModal(true);
    setIsEditing(false);
    setEditError('');
    setEditSuccess('');
  };

  // Handle edit form changes
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate new secret code
  const generateNewSecretCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setEditFormData(prev => ({
      ...prev,
      secretCode: result
    }));
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!selectedProfileStudent) return;

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const response = await userAPI.updateStudent(selectedProfileStudent._id, {
        name: editFormData.name,
        email: editFormData.email || undefined,
        grade: editFormData.grade,
        secretCode: editFormData.secretCode
      });

      setEditSuccess('Student information updated successfully!');
      
      // Update the student in the local state
      const updatedStudents = students.map(student => 
        student._id === selectedProfileStudent._id 
          ? { ...student, ...response.student }
          : student
      );
      setStudents(updatedStudents);
      
      // Update the selected student
      setSelectedProfileStudent(response.student);
      
      setTimeout(() => {
        setIsEditing(false);
        setEditSuccess('');
      }, 2000);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update student information.';
      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete student
  const handleDeleteStudent = async () => {
    if (!selectedProfileStudent) return;

    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      await userAPI.deleteStudent(selectedProfileStudent._id);
      
      // Remove student from local state
      const updatedStudents = students.filter(student => student._id !== selectedProfileStudent._id);
      setStudents(updatedStudents);
      
      setShowProfileModal(false);
      setSelectedProfileStudent(null);
      
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete student.';
      setEditError(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };



  // Student Profile Modal Component
  const StudentProfileModal = ({ student, onClose }: { student: Student; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#dde0e4]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#4798ea] rounded-full flex items-center justify-center text-white font-semibold">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111418]">{student.name}</h2>
                <p className="text-[#637588] text-sm">Student Profile</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {isEditing ? (
              // Edit Form
              <div className="space-y-6">
                {editError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                    {editError}
                  </div>
                )}
                
                {editSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl">
                    {editSuccess}
                  </div>
                )}

                <div>
                  <label htmlFor="edit-name" className="block text-[#111418] text-sm font-medium mb-2">
                    Student Name *
                  </label>
                  <input
                    id="edit-name"
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-email" className="block text-[#111418] text-sm font-medium mb-2">
                    Email Address
                  </label>
                  <input
                    id="edit-email"
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200"
                  />
                </div>

                <div>
                  <label htmlFor="edit-grade" className="block text-[#111418] text-sm font-medium mb-2">
                    Grade Level *
                  </label>
                  <select
                    id="edit-grade"
                    name="grade"
                    value={editFormData.grade}
                    onChange={handleEditInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200"
                    required
                  >
                    <option value="1st">1st Grade</option>
                    <option value="2nd">2nd Grade</option>
                    <option value="3rd">3rd Grade</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="edit-secret-code" className="block text-[#111418] text-sm font-medium mb-2">
                    Secret Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="edit-secret-code"
                      type="text"
                      name="secretCode"
                      value={editFormData.secretCode}
                      onChange={handleEditInputChange}
                      className="flex-1 h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 font-mono"
                    />
                    <button
                      type="button"
                      onClick={generateNewSecretCode}
                      className="px-4 py-2 bg-[#f0f2f4] text-[#111418] rounded-xl hover:bg-[#e1e5e9] transition-colors font-medium"
                    >
                      Generate New
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-[#dde0e4] text-[#111418] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveChanges}
                    disabled={editLoading}
                    className="flex-1 px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </div>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-[#111418] mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-[#637588]">Full Name</span>
                        <p className="text-[#111418] font-medium">{student.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#637588]">Email</span>
                        <p className="text-[#111418] font-medium">{student.email || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#637588]">Grade Level</span>
                        <p className="text-[#111418] font-medium">{student.grade}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#637588]">Secret Code</span>
                        <p className="text-[#111418] font-mono bg-[#f0f2f4] px-3 py-2 rounded-lg">{student.secretCode}</p>
                      </div>
                      <div>
                        <span className="text-sm text-[#637588]">Last Login</span>
                        <p className="text-[#111418] font-medium">
                          {student.lastLogin ? new Date(student.lastLogin).toLocaleDateString() : 'Never'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Performance Overview */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#111418] mb-4">Performance Overview</h3>
                    {student.performance ? (
                      <div className="space-y-3">
                        <div className="bg-gradient-to-r from-[#4798ea] to-[#3a7bc8] rounded-xl p-4 text-white">
                          <div className="text-2xl font-bold">{student.performance.overallPercentage}%</div>
                          <div className="text-sm opacity-90">{getPerformanceLabel(student.performance.overallPercentage)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-lg font-bold text-[#111418]">{student.performance.averageScore}%</div>
                            <div className="text-xs text-[#637588]">Average Score</div>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-lg font-bold text-[#111418]">{student.performance.recentScores.length}</div>
                            <div className="text-xs text-[#637588]">Recent Activities</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[#637588] text-sm">No performance data available</div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[#dde0e4]">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors"
                  >
                    Edit Information
                  </button>
                  <button
                    onClick={handleDeleteStudent}
                    className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    Delete Student
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const PerformanceModal = ({ student, onClose }: { student: Student; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-[#dde0e4]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#4798ea] rounded-full flex items-center justify-center text-white font-semibold">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#111418]">{student.name}</h2>
                <p className="text-[#637588] text-sm">Performance Details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
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
                      <div 
                        key={student._id} 
                        className="flex items-center gap-4 p-4 border border-[#dde0e4] rounded-xl hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                        onClick={() => handleStudentCardClick(student)}
                      >
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
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedStudent(student);
                              }}
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

      {/* Student Profile Modal */}
      {selectedProfileStudent && (
        <StudentProfileModal 
          student={selectedProfileStudent} 
          onClose={() => {
            setShowProfileModal(false);
            setSelectedProfileStudent(null);
            setIsEditing(false);
          }} 
        />
      )}
    </div>
  );
};

export default TeacherStudentsPage; 