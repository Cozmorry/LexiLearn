"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';
import StudentNavigationBar from '../components/StudentNavigationBar';
import { authAPI, moduleAPI, progressAPI, tokenUtils } from '../../../services/api';

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
  photos: Array<{
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  }>;
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

export default function StudentModulesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
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

        await loadModulesData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [router]);

  const loadModulesData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load modules and progress in parallel
      const [modulesData, progressData] = await Promise.all([
        moduleAPI.getModules(),
        progressAPI.getProgress()
      ]);

      console.log('Modules data received:', modulesData);
      console.log('Modules with photos:', modulesData.modules?.filter(m => m.photos && m.photos.length > 0));
      
      setModules(modulesData.modules || []);
      setProgress(progressData.progress || []);
    } catch (error) {
      console.error('Error loading modules data:', error);
      setError('Failed to load modules data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/student-dashboard/module/${moduleId}`);
  };

  const getProgressForModule = (moduleId: string) => {
    return progress.find(p => p.moduleId._id === moduleId);
  };

  const getModuleImage = (module: Module) => {
    // Use the first uploaded photo if available
    if (module.photos && module.photos.length > 0) {
      const photo = module.photos[0];
      // Use the base URL without /api for serving static files
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const imageUrl = `${baseUrl}/modules/uploads/${photo.filename}`;
      console.log('Module image URL:', imageUrl, 'for module:', module.title);
      return imageUrl;
    }
    
    console.log('No photos found for module:', module.title, 'photos:', module.photos);
    
    // Fallback to a placeholder based on category
    const categoryColors = {
      'Reading': 'bg-blue-100',
      'Writing': 'bg-green-100', 
      'Grammar': 'bg-purple-100',
      'Vocabulary': 'bg-yellow-100',
      'Comprehension': 'bg-red-100',
      'Phonics': 'bg-pink-100',
      'Literature': 'bg-indigo-100',
      'Creative Writing': 'bg-orange-100'
    };
    
    return categoryColors[module.category as keyof typeof categoryColors] || 'bg-gray-100';
  };

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = getProgressForModule(moduleId);
    if (!moduleProgress) return 'Start';
    if (moduleProgress.status === 'completed') return 'Completed';
    if (moduleProgress.status === 'in-progress') return 'Continue';
    return 'Start';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Continue':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to student login
      router.push('/student-login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <StudentNavigationBar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[#637588] text-lg">Loading modules...</p>
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
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <StudentNavigationBar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                <p className="text-red-600 text-lg font-medium">Oops! Something went wrong</p>
                <p className="text-[#637588] text-center">{error}</p>
                <button
                  onClick={loadModulesData}
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
        <div className="gap-1 px-6 flex flex-1 justify-center py-5 relative">
          <StudentNavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Logout Button - Bottom Left of Page */}
            <div className="absolute bottom-4 left-6 z-10">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-2 px-4 py-2 bg-[#f0f2f4] text-[#111418] rounded-lg text-sm font-medium hover:bg-[#e1e5e9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Logout from student modules"
              >
                {isLoggingOut ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#111418] border-t-transparent rounded-full animate-spin"></div>
                    <span>Logging out...</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M112,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h56a8,8,0,0,1,0,16H48V208h56A8,8,0,0,1,112,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L196.69,120H104a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,221.66,122.34Z"></path>
                    </svg>
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
                  All Modules
                </p>
                <p className="text-[#637588] text-sm font-normal leading-normal">
                  Explore all available learning modules and track your progress.
                </p>
              </div>
            </div>
            
            {/* Modules Grid */}
            <div className="p-4">
              {modules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {modules.map((module) => {
                    const moduleProgress = getProgressForModule(module._id);
                    const moduleImage = getModuleImage(module);
                    const status = getModuleStatus(module._id);
                    
                    return (
                      <div 
                        key={module._id}
                        className="flex flex-col border border-[#dde0e4] rounded-xl hover:bg-[#f8f9fa] transition-colors cursor-pointer overflow-hidden"
                        onClick={() => handleModuleClick(module._id)}
                      >
                        {/* Module Image */}
                        <div className="w-full h-48 relative">
                          {module.photos && module.photos.length > 0 ? (
                            <>
                              <img 
                                src={moduleImage}
                                alt={module.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  console.log('Image failed to load:', moduleImage, 'for module:', module.title);
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', moduleImage, 'for module:', module.title);
                                }}
                              />
                              <div className={`w-full h-full ${moduleImage} flex items-center justify-center hidden`}>
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                  </svg>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className={`w-full h-full ${moduleImage} flex items-center justify-center`}>
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                              </div>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </div>
                        </div>
                        
                        {/* Module Content */}
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="text-[#111418] text-lg font-bold mb-2">{module.title}</h3>
                          <p className="text-[#637588] text-sm mb-3 flex-1">{module.description}</p>
                          
                          {/* Module Details */}
                          <div className="flex items-center justify-between text-xs text-[#637588]">
                            <span>{module.category}</span>
                            <span>{module.estimatedDuration} min</span>
                          </div>
                          
                          {/* Progress Bar */}
                          {moduleProgress && (
                            <div className="mt-3">
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
              ) : (
                <div className="p-8 text-center">
                  <p className="text-[#637588] text-lg">No modules available yet.</p>
                  <p className="text-[#637588] text-sm">Your teacher will assign modules for you to work on.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
} 