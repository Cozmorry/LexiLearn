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

export default function StudentProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

        await loadProgressData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [router]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load modules and progress in parallel
      const [modulesData, progressData] = await Promise.all([
        moduleAPI.getModules(),
        progressAPI.getProgress()
      ]);

      setModules(modulesData.modules || []);
      setProgress(progressData.progress || []);
    } catch (error) {
      console.error('Error loading progress data:', error);
      setError('Failed to load progress data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getOverallProgress = () => {
    if (progress.length === 0) return 0;
    const completed = progress.filter(p => p.status === 'completed').length;
    return Math.round((completed / progress.length) * 100);
  };

  const getCategoryProgress = (category: string) => {
    const categoryProgress = progress.filter(p => p.moduleId && p.moduleId.category === category);
    if (categoryProgress.length === 0) return 0;
    const completed = categoryProgress.filter(p => p.status === 'completed').length;
    return Math.round((completed / categoryProgress.length) * 100);
  };

  const getTotalTimeSpent = () => {
    return progress.reduce((total, p) => total + (p.timeSpent || 0), 0);
  };

  const getAverageScore = () => {
    const completedProgress = progress.filter(p => p.status === 'completed' && p.score > 0);
    if (completedProgress.length === 0) return 0;
    const totalScore = completedProgress.reduce((sum, p) => sum + p.score, 0);
    return Math.round(totalScore / completedProgress.length);
  };

  const getRecentActivity = () => {
    return progress
      .filter(p => p.status === 'completed' || p.status === 'in-progress')
      .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
      .slice(0, 5);
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
                <p className="text-[#637588] text-lg">Loading your progress...</p>
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
                  onClick={loadProgressData}
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
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <StudentNavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight">
                  Your Progress
                </p>
                <p className="text-[#637588] text-sm font-normal leading-normal">
                  Track your learning journey and celebrate your achievements.
                </p>
              </div>
            </div>
            
            {/* Progress Overview */}
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Overall Progress */}
                <div className="bg-gradient-to-r from-[#4798ea] to-[#3a7bc8] rounded-xl p-4 text-white">
                  <div className="text-2xl font-bold">{getOverallProgress()}%</div>
                  <div className="text-sm opacity-90">Overall Progress</div>
                </div>
                
                {/* Completed Modules */}
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {progress.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-600">Modules Completed</div>
                </div>
                
                {/* Average Score */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-600">{getAverageScore()}%</div>
                  <div className="text-sm text-blue-600">Average Score</div>
                </div>
                
                {/* Time Spent */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(getTotalTimeSpent() / 60)}m
                  </div>
                  <div className="text-sm text-purple-600">Time Spent</div>
                </div>
              </div>
              
              {/* Category Progress */}
              <div className="mb-6">
                <h3 className="text-[#111418] text-lg font-bold mb-4">Progress by Category</h3>
                <div className="space-y-4">
                  {['Reading', 'Writing', 'Grammar', 'Vocabulary', 'Comprehension', 'Phonics'].map((category) => {
                    const categoryProgress = getCategoryProgress(category);
                    const categoryModules = progress.filter(p => p.moduleId && p.moduleId.category === category);
                    
                    if (categoryModules.length === 0) return null;
                    
                    return (
                      <div key={category} className="bg-white border border-[#dde0e4] rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[#111418] font-medium">{category}</span>
                          <span className="text-[#637588] text-sm">{categoryProgress}%</span>
                        </div>
                        <div className="w-full bg-[#dce0e5] rounded-full h-2">
                          <div 
                            className="bg-[#4798ea] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${categoryProgress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-[#637588] mt-1">
                          {categoryModules.filter(p => p.status === 'completed').length} of {categoryModules.length} modules completed
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-[#111418] text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {getRecentActivity().map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-white border border-[#dde0e4] rounded-xl">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1">
                        <div className="text-[#111418] font-medium">{item.moduleId?.title || 'Unknown Module'}</div>
                        <div className="text-[#637588] text-sm">
                          {item.status === 'completed' ? 'Completed' : 'In Progress'} - {item.completionPercentage}%
                        </div>
                      </div>
                      {item.status === 'completed' && (
                        <div className="text-green-600 font-medium">{item.score}%</div>
                      )}
                    </div>
                  ))}
                  
                  {getRecentActivity().length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-[#637588] text-lg">No recent activity</p>
                      <p className="text-[#637588] text-sm">Start working on modules to see your progress here!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
} 