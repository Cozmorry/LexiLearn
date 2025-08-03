"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { moduleAPI, progressAPI, tokenUtils } from '../../../../services/api';

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
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  currentStep: number;
  totalSteps: number;
  score: number;
  timeSpent: number;
  completionPercentage: number;
}

export default function ModuleDetailPage() {
  const [module, setModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenUtils.getToken();
        if (!token) {
          router.push('/student-login');
          return;
        }

        await loadModuleData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [moduleId, router]);

  const loadModuleData = async () => {
    try {
      setLoading(true);
      setError('');

      const [moduleData, progressData] = await Promise.all([
        moduleAPI.getModule(moduleId),
        progressAPI.getProgress({ moduleId })
      ]);

      setModule(moduleData.module);
      setProgress(progressData.progress?.[0] || null);
    } catch (error) {
      console.error('Error loading module data:', error);
      setError('Failed to load module data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartModule = async () => {
    try {
      if (!module) return;

      const progressData = {
        studentId: JSON.parse(localStorage.getItem('user') || '{}')._id,
        moduleId: module._id,
        totalSteps: module.exercises.length,
        currentStep: 0,
        status: 'in-progress'
      };

      const response = await progressAPI.updateProgress(progressData);
      setProgress(response.progress);
      
      // Navigate to the first exercise
      router.push(`/student-dashboard/module/${moduleId}/exercise/0`);
    } catch (error) {
      console.error('Error starting module:', error);
      setError('Failed to start module. Please try again.');
    }
  };

  const handleContinueModule = () => {
    if (!progress) return;
    router.push(`/student-dashboard/module/${moduleId}/exercise/${progress.currentStep}`);
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
                <p className="text-[#637588] text-lg">Loading module...</p>
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
                  onClick={loadModuleData}
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

  if (!module) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8">
                <p className="text-[#637588] text-lg">Module not found</p>
                <Link href="/student-dashboard" className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors">
                  Back to Dashboard
                </Link>
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
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 px-4 py-2 text-sm text-[#637588]">
              <Link href="/student-dashboard" className="hover:text-[#4798ea] transition-colors">
                Dashboard
              </Link>
              <span>→</span>
              <span>{module.title}</span>
            </div>

            {/* Module Header */}
            <div className="p-4">
              <div className="flex items-start gap-6">
                <div
                  className="w-32 h-32 bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0"
                  style={{ 
                    backgroundImage: `url('https://picsum.photos/300/300?random=${module._id}')` 
                  }}
                ></div>
                <div className="flex-1">
                  <h1 className="text-[#111418] text-3xl font-bold leading-tight mb-2">
                    {module.title}
                  </h1>
                  <p className="text-[#637588] text-lg mb-4">
                    {module.description}
                  </p>
                  <div className="flex gap-4 text-sm text-[#637588]">
                    <span>Category: {module.category}</span>
                    <span>Difficulty: {module.difficulty}</span>
                    <span>Duration: {module.estimatedDuration} min</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            {progress && (
              <div className="p-4 bg-[#f8f9fa] rounded-xl mx-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#111418] font-semibold">Your Progress</h3>
                  <span className="text-[#4798ea] font-medium">
                    {progress.completionPercentage}% Complete
                  </span>
                </div>
                <div className="w-full bg-[#dce0e5] rounded-full h-2">
                  <div 
                    className="bg-[#4798ea] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress.completionPercentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-[#637588] mt-1">
                  <span>Step {progress.currentStep} of {progress.totalSteps}</span>
                  <span>Score: {progress.score}%</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 flex gap-4">
              {!progress || progress.status === 'not-started' ? (
                <button
                  onClick={handleStartModule}
                  className="px-8 py-3 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors font-medium"
                >
                  Start Module
                </button>
              ) : progress.status === 'in-progress' ? (
                <button
                  onClick={handleContinueModule}
                  className="px-8 py-3 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors font-medium"
                >
                  Continue Module
                </button>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <span>✓</span>
                  <span className="font-medium">Module Completed!</span>
                </div>
              )}
              
              <Link
                href="/student-dashboard"
                className="px-8 py-3 bg-[#f0f2f4] text-[#111418] rounded-lg hover:bg-[#e1e5e9] transition-colors font-medium"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Module Content Preview */}
            <div className="p-4">
              <h3 className="text-[#111418] text-xl font-semibold mb-4">Module Content</h3>
              <div className="grid gap-4">
                {module.content.slice(0, 3).map((item, index) => (
                  <div key={index} className="p-4 border border-[#dde0e4] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#4798ea] text-white px-2 py-1 rounded">
                        {item.type}
                      </span>
                      <span className="text-sm text-[#637588]">Step {index + 1}</span>
                    </div>
                    <p className="text-[#111418] text-sm">
                      {item.data.length > 100 ? `${item.data.substring(0, 100)}...` : item.data}
                    </p>
                  </div>
                ))}
                {module.content.length > 3 && (
                  <div className="text-center text-[#637588] text-sm">
                    +{module.content.length - 3} more content items
                  </div>
                )}
              </div>
            </div>

            {/* Exercises Preview */}
            <div className="p-4">
              <h3 className="text-[#111418] text-xl font-semibold mb-4">Exercises ({module.exercises.length})</h3>
              <div className="grid gap-3">
                {module.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={index} className="p-3 border border-[#dde0e4] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#f0f2f4] text-[#111418] px-2 py-1 rounded">
                        {exercise.type}
                      </span>
                      <span className="text-sm text-[#637588]">Exercise {index + 1}</span>
                      <span className="text-xs text-[#637588]">{exercise.points} points</span>
                    </div>
                    <p className="text-[#111418] text-sm">
                      {exercise.question.length > 80 ? `${exercise.question.substring(0, 80)}...` : exercise.question}
                    </p>
                  </div>
                ))}
                {module.exercises.length > 3 && (
                  <div className="text-center text-[#637588] text-sm">
                    +{module.exercises.length - 3} more exercises
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
} 