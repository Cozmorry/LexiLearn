"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import { userAPI, moduleAPI, progressAPI, assignmentAPI } from '../../../services/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  grade: string;
  avatar?: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  gradeLevel: string;
  difficulty: string;
}

interface Progress {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    grade: string;
  };
  moduleId: {
    _id: string;
    title: string;
    description: string;
    gradeLevel: string;
    difficulty: string;
  };
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  currentStep: number;
  totalSteps: number;
  score: number;
  timeSpent: number;
  completionPercentage: number;
  lastActivity: string;
}

interface QuizResult {
  _id: string;
  studentId: string;
  quizId: string;
  score: number;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  assignmentTitle?: string;
  studentName?: string;
}

const TeacherReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'modules'>('overview');
  const [students, setStudents] = useState<Student[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // First load students, modules, and progress data
      const [studentsResponse, modulesResponse, progressResponse] = await Promise.all([
        userAPI.getMyStudents(),
        moduleAPI.getModules(),
        progressAPI.getProgress()
      ]);

      console.log('Students response:', studentsResponse);
      console.log('Modules response:', modulesResponse);
      console.log('Progress response:', progressResponse);

      setStudents(studentsResponse.students || []);
      setModules(modulesResponse.modules || []);
      setProgress(progressResponse.progress || []);
      
      // Then load quiz submissions for all students
      const students = studentsResponse.students || [];
      const quizSubmissionsPromises = students.map(async (student: any) => {
        try {
          const submissions = await assignmentAPI.getStudentSubmissions(student._id);
          return submissions.submissions || [];
        } catch (error) {
          console.error(`Error loading submissions for student ${student._id}:`, error);
          return [];
        }
      });
      
      const quizSubmissionsResponse = await Promise.all(quizSubmissionsPromises);
      console.log('Quiz submissions response:', quizSubmissionsResponse);
      
      // Flatten and process quiz submissions
      const allQuizSubmissions = quizSubmissionsResponse.flat();
      const processedQuizResults = allQuizSubmissions.map((submission: any) => {
        const student = students.find(s => s._id === submission.studentId);
        return {
          _id: submission._id,
          studentId: submission.studentId,
          quizId: submission.assignmentId || submission.quizId || 'Unknown Quiz',
          score: submission.percentage || 0,
          completedAt: submission.completedAt || submission.createdAt,
          totalQuestions: submission.totalQuestions || 1,
          correctAnswers: submission.correctAnswers || 0,
          assignmentTitle: submission.assignmentTitle || 'Quiz',
          studentName: student?.name || 'Unknown Student'
        };
      });
      
      setQuizResults(processedQuizResults);
      
    } catch (error) {
      console.error('Error loading reports data:', error);
      // Set default data to prevent empty dashboard
      setStudents([]);
      setModules([]);
      setProgress([]);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalStudents = students.length;
  const totalModules = modules.length;
  const completedProgress = progress.filter(p => p.status === 'completed');
  
  console.log('Analytics calculation:', {
    totalStudents,
    totalModules,
    totalProgress: progress.length,
    completedProgress: completedProgress.length,
    progressData: progress.slice(0, 3) // Show first 3 items for debugging
  });
  
  const averageScore = completedProgress.length > 0 
    ? Math.round(completedProgress.reduce((sum, p) => sum + p.score, 0) / completedProgress.length)
    : 0;
  const completionRate = totalStudents > 0 
    ? Math.round((completedProgress.length / (totalStudents * totalModules)) * 100)
    : 0;

  // Filter data based on selections
  const filteredProgress = progress.filter(p => {
    if (selectedStudent && p.studentId._id !== selectedStudent) return false;
    if (selectedModule && p.moduleId._id !== selectedModule) return false;
    return true;
  });

  const filteredQuizResults = quizResults.filter(q => {
    if (selectedStudent && q.studentId !== selectedStudent) return false;
    return true;
  });

  // Get student name by ID
  const getStudentName = (studentId: string) => {
    const student = students.find(s => s._id === studentId);
    return student?.name || 'Unknown Student';
  };

  // Get module title by ID
  const getModuleTitle = (moduleId: string) => {
    const module = modules.find(m => m._id === moduleId);
    return module?.title || 'Unknown Module';
  };

  // Calculate performance trends
  const getPerformanceTrend = () => {
    const recentScores = completedProgress.slice(-5).map(p => p.score);
    if (recentScores.length < 2) return 'stable';
    
    const firstHalf = recentScores.slice(0, Math.floor(recentScores.length / 2));
    const secondHalf = recentScores.slice(Math.floor(recentScores.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
    
    if (secondAvg > firstAvg + 5) return 'improving';
    if (secondAvg < firstAvg - 5) return 'declining';
    return 'stable';
  };

  const performanceTrend = getPerformanceTrend();

  // Generate chart data
  const generatePerformanceData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayProgress = completedProgress.filter(p => 
        p.lastActivity.startsWith(date)
      );
      const avgScore = dayProgress.length > 0 
        ? Math.round(dayProgress.reduce((sum, p) => sum + p.score, 0) / dayProgress.length)
        : 0;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: avgScore,
        completions: dayProgress.length
      };
    });
  };

  const generateModuleCompletionData = () => {
    return modules.map(module => {
      const moduleProgress = completedProgress.filter(p => p.moduleId._id === module._id);
      const completionRate = totalStudents > 0 
        ? Math.round((moduleProgress.length / totalStudents) * 100)
        : 0;
      
      return {
        module: module.title,
        completionRate,
        avgScore: moduleProgress.length > 0 
          ? Math.round(moduleProgress.reduce((sum, p) => sum + p.score, 0) / moduleProgress.length)
          : 0
      };
    });
  };

  const performanceData = generatePerformanceData();
  const moduleCompletionData = generateModuleCompletionData();

  // Simple chart components
  const LineChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
      <h3 className="text-[#111418] text-lg font-semibold mb-4">{title}</h3>
      <div className="h-64 flex items-end justify-between gap-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="w-full bg-gray-200 rounded-t" style={{ height: `${item.score}%` }}>
              <div 
                className="bg-[#4798ea] rounded-t transition-all duration-300 hover:bg-[#3a7bc8]"
                style={{ height: `${item.score}%` }}
              ></div>
            </div>
            <div className="text-xs text-[#637588] mt-2 text-center">
              <div>{item.date}</div>
              <div className="font-medium">{item.score}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const BarChart = ({ data, title }: { data: any[], title: string }) => (
    <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
      <h3 className="text-[#111418] text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#111418] font-medium truncate">{item.module}</span>
              <span className="text-[#637588]">{item.completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-[#4798ea] to-[#3a7bc8] h-3 rounded-full transition-all duration-300"
                style={{ width: `${item.completionRate}%` }}
              ></div>
            </div>
            <div className="text-xs text-[#637588]">
              Avg Score: {item.avgScore}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const PieChart = ({ data, title }: { data: any[], title: string }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
    return (
      <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
        <h3 className="text-[#111418] text-lg font-semibold mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const angle = (percentage / 100) * 360;
                const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
                const x2 = 50 + 40 * Math.cos(((currentAngle + angle) * Math.PI) / 180);
                const y2 = 50 + 40 * Math.sin(((currentAngle + angle) * Math.PI) / 180);
                
                const largeArcFlag = angle > 180 ? 1 : 0;
                
                currentAngle += angle;
                
                return (
                  <path
                    key={index}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={item.color}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#111418]">{total}</div>
                <div className="text-sm text-[#637588]">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-[#111418]">{item.label}</span>
              <span className="text-sm text-[#637588] ml-auto">
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Reports & Analytics</p>
              <div className="flex items-center gap-2">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as 'week' | 'month' | 'quarter')}
                  className="px-3 py-2 rounded-xl border border-[#dce0e5] text-sm focus:outline-none focus:ring-2 focus:ring-[#4798ea]"
                  aria-label="Select date range"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                </select>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-4 py-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-[#4798ea] text-white'
                    : 'bg-[#f0f2f4] text-[#111418] hover:bg-[#e1e5e9]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'students'
                    ? 'bg-[#4798ea] text-white'
                    : 'bg-[#f0f2f4] text-[#111418] hover:bg-[#e1e5e9]'
                }`}
              >
                Student Performance
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === 'modules'
                    ? 'bg-[#4798ea] text-white'
                    : 'bg-[#f0f2f4] text-[#111418] hover:bg-[#e1e5e9]'
                }`}
              >
                Module Analytics
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading reports...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 p-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[#637588] text-sm font-medium">Total Students</p>
                            <p className="text-[#111418] text-2xl font-bold">{totalStudents}</p>
                          </div>
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[#637588] text-sm font-medium">Active Modules</p>
                            <p className="text-[#111418] text-2xl font-bold">{totalModules}</p>
                          </div>
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[#637588] text-sm font-medium">Average Score</p>
                            <p className="text-[#111418] text-2xl font-bold">{averageScore}%</p>
                          </div>
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[#637588] text-sm font-medium">Completion Rate</p>
                            <p className="text-[#111418] text-2xl font-bold">{completionRate}%</p>
                          </div>
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <LineChart 
                        data={performanceData} 
                        title="Performance Over Time" 
                      />
                      <BarChart 
                        data={moduleCompletionData} 
                        title="Module Completion Rates" 
                      />
                    </div>

                    {/* Performance Distribution */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <PieChart 
                        data={[
                          { label: 'Excellent (90%+)', value: completedProgress.filter(p => p.score >= 90).length, color: '#10B981' },
                          { label: 'Good (80-89%)', value: completedProgress.filter(p => p.score >= 80 && p.score < 90).length, color: '#F59E0B' },
                          { label: 'Needs Improvement (<80%)', value: completedProgress.filter(p => p.score < 80).length, color: '#EF4444' }
                        ]} 
                        title="Score Distribution" 
                      />
                      
                      {/* Performance Trend */}
                      <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                        <h3 className="text-[#111418] text-lg font-semibold mb-4">Performance Trend</h3>
                        <div className="flex items-center gap-4">
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            performanceTrend === 'improving' ? 'bg-green-100 text-green-800' :
                            performanceTrend === 'declining' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {performanceTrend === 'improving' ? '↗ Improving' :
                             performanceTrend === 'declining' ? '↘ Declining' :
                             '→ Stable'}
                          </div>
                          <p className="text-[#637588] text-sm">
                            Based on the last 5 assessments
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                      <h3 className="text-[#111418] text-lg font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-3">
                        {filteredProgress.slice(0, 5).map((p, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div>
                              <p className="text-[#111418] font-medium">{p.studentId.name}</p>
                              <p className="text-[#637588] text-sm">{p.moduleId.title}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[#111418] font-medium">{p.score}%</p>
                              <p className="text-[#637588] text-sm">
                                {new Date(p.lastActivity).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Student Performance Tab */}
                {activeTab === 'students' && (
                  <div className="space-y-6 p-4">
                    {/* Filters */}
                    <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                      <h3 className="text-[#111418] text-lg font-semibold mb-4">Student Performance</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[#111418] text-sm font-medium mb-2">Select Student</label>
                          <select
                            value={selectedStudent}
                            onChange={(e) => setSelectedStudent(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#dce0e5] focus:outline-none focus:ring-2 focus:ring-[#4798ea]"
                            aria-label="Select student"
                          >
                            <option value="">All Students</option>
                            {students.map(student => (
                              <option key={student._id} value={student._id}>
                                {student.name} ({student.grade})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[#111418] text-sm font-medium mb-2">Select Module</label>
                          <select
                            value={selectedModule}
                            onChange={(e) => setSelectedModule(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-[#dce0e5] focus:outline-none focus:ring-2 focus:ring-[#4798ea]"
                            aria-label="Select module"
                          >
                            <option value="">All Modules</option>
                            {modules.map(module => (
                              <option key={module._id} value={module._id}>
                                {module.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Student Progress Chart */}
                    <LineChart 
                      data={performanceData} 
                      title="Student Performance Over Time" 
                    />

                    {/* Student Progress Table */}
                    <div className="bg-white rounded-xl border border-[#dce0e5] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#dce0e5]">
                        <h3 className="text-[#111418] text-lg font-semibold">Progress Details</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#f8f9fa]">
                            <tr>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Student</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Module</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Score</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Time Spent</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Completed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProgress.map((p, index) => (
                              <tr key={index} className="border-t border-[#dce0e5]">
                                <td className="px-6 py-4 text-[#111418] font-medium">
                                  {p.studentId.name}
                                </td>
                                <td className="px-6 py-4 text-[#637588]">
                                  {p.moduleId.title}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    p.score >= 90 ? 'bg-green-100 text-green-800' :
                                    p.score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {p.score}%
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-[#637588]">
                                  {Math.round(p.timeSpent / 60)} min
                                </td>
                                <td className="px-6 py-4 text-[#637588]">
                                  {new Date(p.lastActivity).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Module Analytics Tab */}
                {activeTab === 'modules' && (
                  <div className="space-y-6 p-4">
                    {/* Module Performance Chart */}
                    <BarChart 
                      data={moduleCompletionData} 
                      title="Module Performance Overview" 
                    />

                    {/* Module Performance */}
                    <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                      <h3 className="text-[#111418] text-lg font-semibold mb-4">Module Performance</h3>
                      <div className="space-y-4">
                        {modules.map(module => {
                          const moduleProgress = completedProgress.filter(p => p.moduleId._id === module._id);
                          const avgScore = moduleProgress.length > 0 
                            ? Math.round(moduleProgress.reduce((sum, p) => sum + p.score, 0) / moduleProgress.length)
                            : 0;
                          const completionCount = moduleProgress.length;
                          
                          return (
                            <div key={module._id} className="flex items-center justify-between p-4 bg-[#f8f9fa] rounded-xl">
                              <div>
                                <p className="text-[#111418] font-medium">{module.title}</p>
                                <p className="text-[#637588] text-sm">{module.description}</p>
                                <p className="text-[#637588] text-sm">
                                  Grade: {module.gradeLevel} • Difficulty: {module.difficulty}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-[#111418] font-medium">{avgScore}%</p>
                                <p className="text-[#637588] text-sm">{completionCount} completions</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Quiz Results */}
                    <div className="bg-white rounded-xl border border-[#dce0e5] overflow-hidden">
                      <div className="px-6 py-4 border-b border-[#dce0e5]">
                        <h3 className="text-[#111418] text-lg font-semibold">Quiz Results</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-[#f8f9fa]">
                            <tr>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Student</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Quiz</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Score</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Questions</th>
                              <th className="px-6 py-3 text-left text-[#111418] text-sm font-medium">Completed</th>
                            </tr>
                          </thead>
                                                     <tbody>
                             {filteredQuizResults.length > 0 ? (
                               filteredQuizResults.map((quiz, index) => (
                                 <tr key={index} className="border-t border-[#dce0e5]">
                                   <td className="px-6 py-4 text-[#111418] font-medium">
                                     {quiz.studentName}
                                   </td>
                                   <td className="px-6 py-4 text-[#637588]">
                                     {quiz.assignmentTitle}
                                   </td>
                                   <td className="px-6 py-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                       quiz.score >= 90 ? 'bg-green-100 text-green-800' :
                                       quiz.score >= 80 ? 'bg-yellow-100 text-yellow-800' :
                                       'bg-red-100 text-red-800'
                                     }`}>
                                       {quiz.score}%
                                     </span>
                                   </td>
                                   <td className="px-6 py-4 text-[#637588]">
                                     {quiz.correctAnswers}/{quiz.totalQuestions}
                                   </td>
                                   <td className="px-6 py-4 text-[#637588]">
                                     {new Date(quiz.completedAt).toLocaleDateString()}
                                   </td>
                                 </tr>
                               ))
                             ) : (
                               <tr>
                                 <td colSpan={5} className="px-6 py-8 text-center text-[#637588]">
                                   <div className="flex flex-col items-center gap-2">
                                     <svg className="w-8 h-8 text-[#dce0e5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                     </svg>
                                     <p className="text-sm">No quiz results available</p>
                                     <p className="text-xs">Students will appear here once they complete quizzes</p>
                                   </div>
                                 </td>
                               </tr>
                             )}
                           </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherReportsPage;