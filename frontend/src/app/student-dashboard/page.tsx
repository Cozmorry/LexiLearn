
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { authAPI, moduleAPI, progressAPI, quizAPI, tokenUtils } from '../../services/api';

interface User {
  _id: string;
  name: string;
  role: string;
  grade: string;
}

interface Module {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  gradeLevel: string;
  estimatedDuration: number;
  content: Array<{
    type: 'text' | 'image' | 'audio' | 'video' | 'interactive';
    data: string;
    order: number;
  }>;
  exercises: Array<{
    type: 'multiple-choice' | 'fill-blank' | 'matching' | 'drag-drop' | 'typing';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
  }>;
  isActive: boolean;
}

interface Progress {
  _id: string;
  moduleId: Module;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  currentStep: number;
  totalSteps: number;
  score: number;
  timeSpent: number;
  completionPercentage: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: Array<{
    type: 'multiple-choice' | 'fill-blank' | 'matching' | 'drag-drop' | 'typing';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
  }>;
  estimatedDuration: number;
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenUtils.getToken();
        if (!token) {
          router.push('/student-login');
          return;
        }

        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        await loadDashboardData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load modules, quizzes, and progress in parallel
      const [modulesData, quizzesData, progressData] = await Promise.all([
        moduleAPI.getModules(),
        quizAPI.getQuizzes(),
        progressAPI.getProgress()
      ]);

      setModules(modulesData.modules || []);
      setQuizzes(quizzesData.quizzes || []);
      setProgress(progressData.progress || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/student-dashboard/module/${moduleId}`);
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/student-dashboard/quiz/${quizId}`);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authAPI.logout();
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  const getProgressForModule = (moduleId: string) => {
    return progress.find(p => p.moduleId._id === moduleId);
  };

  const getOverallProgress = () => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.status === 'completed').length;
    return Math.round((completed / progress.length) * 100);
  };

  const getCategoryProgress = (category: string) => {
    const categoryProgress = progress.filter(p => p.moduleId.category === category);
    if (categoryProgress.length === 0) return 0;
    const completed = categoryProgress.filter(p => p.status === 'completed').length;
    return Math.round((completed / categoryProgress.length) * 100);
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#637588] text-lg">Loading your dashboard...</p>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                <p className="text-red-600 text-lg font-medium">Oops! Something went wrong</p>
                <p className="text-[#637588] text-center">{error}</p>
                <button
                  onClick={loadDashboardData}
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
                  Welcome back, {user?.name || 'Student'}!
                </p>
                <p className="text-[#637588] text-sm font-normal leading-normal">
                  Continue your learning journey with personalized modules and quizzes.
                </p>
              </div>
            </div>
            
            {/* Assigned Modules */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Assigned Modules ({modules.length})
            </h2>
            {modules.length > 0 ? (
              <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-stretch p-4 gap-3">
                  {modules.map((module) => {
                    const moduleProgress = getProgressForModule(module._id);
                    return (
                      <div 
                        key={module._id}
                        className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40 cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleModuleClick(module._id)}
                      >
                        <div
                          className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex flex-col relative"
                          style={{ 
                            backgroundImage: `url('https://picsum.photos/300/300?random=${module._id}')` 
                          }}
                        >
                          {moduleProgress && (
                            <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                              {moduleProgress.status === 'completed' ? '✓' : 
                               moduleProgress.status === 'in-progress' ? '▶' : '○'}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-[#111418] text-base font-medium leading-normal">{module.title}</p>
                          <p className="text-[#637588] text-sm font-normal leading-normal">{module.description}</p>
                          {moduleProgress && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs text-[#637588] mb-1">
                                <span>Progress</span>
                                <span>{moduleProgress.completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-[#dce0e5] rounded-full h-1">
                                <div 
                                  className="bg-[#4798ea] h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${moduleProgress.completionPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[#637588] text-lg">No modules assigned yet.</p>
                <p className="text-[#637588] text-sm">Your teacher will assign modules for you to work on.</p>
              </div>
            )}
            
            {/* Quizzes */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Quizzes ({quizzes.length})
            </h2>
            {quizzes.length > 0 ? (
              <div className="flex overflow-y-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex items-stretch p-4 gap-3">
                  {quizzes.map((quiz) => (
                    <div 
                      key={quiz._id}
                      className="flex h-full flex-1 flex-col gap-4 rounded-lg min-w-40 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => handleQuizClick(quiz._id)}
                    >
                      <div
                        className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl flex flex-col"
                        style={{ 
                          backgroundImage: `url('https://picsum.photos/300/300?random=quiz-${quiz._id}')` 
                        }}
                      ></div>
                      <div>
                        <p className="text-[#111418] text-base font-medium leading-normal">{quiz.title}</p>
                        <p className="text-[#637588] text-sm font-normal leading-normal">{quiz.description}</p>
                        <p className="text-[#637588] text-xs mt-1">{quiz.estimatedDuration} min</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-[#637588] text-lg">No quizzes available yet.</p>
                <p className="text-[#637588] text-sm">Complete modules to unlock quizzes.</p>
              </div>
            )}
            
            {/* Recommendations */}
            {modules.length > 0 && (
              <>
                <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
                  Recommendations
                </h2>
                <div className="p-4">
                  <div className="flex items-stretch justify-between gap-4 rounded-xl bg-[#f8f9fa] p-4">
                    <div className="flex flex-[2_2_0px] flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-[#637588] text-sm font-normal leading-normal">New</p>
                        <p className="text-[#111418] text-base font-bold leading-tight">
                          {modules[0]?.title || 'Continue Learning'}
                        </p>
                        <p className="text-[#637588] text-sm font-normal leading-normal">
                          {modules[0]?.description || 'Keep up the great work!'}
                        </p>
                      </div>
                      <button
                        className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 flex-row-reverse bg-[#4798ea] text-white text-sm font-medium leading-normal w-fit hover:bg-[#3a7bc8] transition-colors"
                        onClick={() => modules[0] && handleModuleClick(modules[0]._id)}
                      >
                        <span className="truncate">Start</span>
                      </button>
                    </div>
                    <div
                      className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                      style={{ 
                        backgroundImage: `url('https://picsum.photos/400/200?random=recommendation')` 
                      }}
                    ></div>
                  </div>
                </div>
              </>
            )}
            
            {/* Progress */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Progress
            </h2>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-6 justify-between">
                <p className="text-[#111418] text-base font-medium leading-normal">Overall Progress</p>
                <p className="text-[#111418] text-sm font-normal leading-normal">{getOverallProgress()}%</p>
              </div>
              <div className="rounded bg-[#dce0e5]">
                <div 
                  className="h-2 rounded bg-[#4798ea] transition-all duration-300" 
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
            </div>
            
            {/* Category Progress */}
            {['reading', 'spelling', 'comprehension'].map((category) => (
              <div key={category} className="flex flex-col gap-3 p-4">
                <div className="flex gap-6 justify-between">
                  <p className="text-[#111418] text-base font-medium leading-normal">
                    {category.charAt(0).toUpperCase() + category.slice(1)} Progress
                  </p>
                  <p className="text-[#111418] text-sm font-normal leading-normal">
                    {getCategoryProgress(category)}%
                  </p>
                </div>
                <div className="rounded bg-[#dce0e5]">
                  <div 
                    className="h-2 rounded bg-[#4798ea] transition-all duration-300" 
                    style={{ width: `${getCategoryProgress(category)}%` }}
                  ></div>
                </div>
              </div>
            ))}
            
            {/* Rewards */}
            <h2 className="text-[#111418] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
              Rewards
            </h2>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(158px,1fr))] gap-3 p-4">
              {progress.filter(p => p.status === 'completed').slice(0, 3).map((_, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <div 
                    className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" 
                    style={{ 
                      backgroundImage: `url('https://picsum.photos/200/200?random=reward-${index}` 
                    }}
                  ></div>
                </div>
              ))}
              {progress.filter(p => p.status === 'completed').length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-[#637588] text-lg">No rewards yet</p>
                  <p className="text-[#637588] text-sm">Complete modules to earn rewards!</p>
                </div>
              )}
            </div>
            
            {/* Logout Button */}
            <div className="flex px-4 py-3 justify-end">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#e1e5e9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Logout from student dashboard"
              >
                {isLoggingOut ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#111418] border-t-transparent rounded-full animate-spin"></div>
                    Logging out...
                  </div>
                ) : (
                  <span className="truncate">Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}