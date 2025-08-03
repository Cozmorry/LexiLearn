"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../components/Header';
import Footer from '../../../components/Footer';
import { quizAPI, progressAPI, tokenUtils } from '../../../../services/api';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  gradeLevel: string;
  estimatedDuration: number;
  questions: Array<{
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

export default function QuizDetailPage() {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenUtils.getToken();
        if (!token) {
          router.push('/student-login');
          return;
        }

        await loadQuizData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [quizId, router]);

  const loadQuizData = async () => {
    try {
      setLoading(true);
      setError('');

      const [quizData, progressData] = await Promise.all([
        quizAPI.getQuiz(quizId),
        progressAPI.getProgress({ quizId })
      ]);

      setQuiz(quizData.quiz);
      setProgress(progressData.progress?.[0] || null);
    } catch (error) {
      console.error('Error loading quiz data:', error);
      setError('Failed to load quiz data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    try {
      if (!quiz) return;

      const response = await quizAPI.startQuiz(quizId);
      setProgress(response.progress);
      
      // Navigate to the quiz interface
      router.push(`/student-dashboard/quiz/${quizId}/take`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz. Please try again.');
    }
  };

  const handleContinueQuiz = () => {
    if (!progress) return;
    router.push(`/student-dashboard/quiz/${quizId}/take`);
  };

  const handleViewResults = () => {
    router.push(`/student-dashboard/quiz/${quizId}/results`);
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
                <p className="text-[#637588] text-lg">Loading quiz...</p>
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
                  onClick={loadQuizData}
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

  if (!quiz) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <Header />
          <div className="px-40 flex flex-1 justify-center py-5">
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8">
                <p className="text-[#637588] text-lg">Quiz not found</p>
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
              <span>{quiz.title}</span>
            </div>

            {/* Quiz Header */}
            <div className="p-4">
              <div className="flex items-start gap-6">
                <div
                  className="w-32 h-32 bg-center bg-no-repeat bg-cover rounded-xl flex-shrink-0"
                  style={{ 
                    backgroundImage: `url('https://picsum.photos/300/300?random=quiz-${quiz._id}')` 
                  }}
                ></div>
                <div className="flex-1">
                  <h1 className="text-[#111418] text-3xl font-bold leading-tight mb-2">
                    {quiz.title}
                  </h1>
                  <p className="text-[#637588] text-lg mb-4">
                    {quiz.description}
                  </p>
                  <div className="flex gap-4 text-sm text-[#637588]">
                    <span>Category: {quiz.category}</span>
                    <span>Difficulty: {quiz.difficulty}</span>
                    <span>Duration: {quiz.estimatedDuration} min</span>
                    <span>Questions: {quiz.questions.length}</span>
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
                  <span>Question {progress.currentStep} of {progress.totalSteps}</span>
                  <span>Score: {progress.score}%</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="p-4 flex gap-4">
              {!progress || progress.status === 'not-started' ? (
                <button
                  onClick={handleStartQuiz}
                  className="px-8 py-3 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors font-medium"
                >
                  Start Quiz
                </button>
              ) : progress.status === 'in-progress' ? (
                <button
                  onClick={handleContinueQuiz}
                  className="px-8 py-3 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors font-medium"
                >
                  Continue Quiz
                </button>
              ) : progress.status === 'completed' ? (
                <button
                  onClick={handleViewResults}
                  className="px-8 py-3 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors font-medium"
                >
                  View Results
                </button>
              ) : null}
              
              <Link
                href="/student-dashboard"
                className="px-8 py-3 bg-[#f0f2f4] text-[#111418] rounded-lg hover:bg-[#e1e5e9] transition-colors font-medium"
              >
                Back to Dashboard
              </Link>
            </div>

            {/* Quiz Instructions */}
            <div className="p-4">
              <h3 className="text-[#111418] text-xl font-semibold mb-4">Quiz Instructions</h3>
              <div className="bg-[#f8f9fa] p-4 rounded-lg">
                <ul className="space-y-2 text-[#111418] text-sm">
                  <li>• This quiz contains {quiz.questions.length} questions</li>
                  <li>• Estimated time: {quiz.estimatedDuration} minutes</li>
                  <li>• You can pause and resume the quiz at any time</li>
                  <li>• Your progress will be saved automatically</li>
                  <li>• You can review your answers before submitting</li>
                </ul>
              </div>
            </div>

            {/* Question Types Preview */}
            <div className="p-4">
              <h3 className="text-[#111418] text-xl font-semibold mb-4">Question Types</h3>
              <div className="grid gap-3">
                {quiz.questions.slice(0, 3).map((question, index) => (
                  <div key={index} className="p-3 border border-[#dde0e4] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-[#f0f2f4] text-[#111418] px-2 py-1 rounded">
                        {question.type}
                      </span>
                      <span className="text-sm text-[#637588]">Question {index + 1}</span>
                      <span className="text-xs text-[#637588]">{question.points} points</span>
                    </div>
                    <p className="text-[#111418] text-sm">
                      {question.question.length > 80 ? `${question.question.substring(0, 80)}...` : question.question}
                    </p>
                    {question.options && question.options.length > 0 && (
                      <div className="mt-2 text-xs text-[#637588]">
                        {question.options.length} options available
                      </div>
                    )}
                  </div>
                ))}
                {quiz.questions.length > 3 && (
                  <div className="text-center text-[#637588] text-sm">
                    +{quiz.questions.length - 3} more questions
                  </div>
                )}
              </div>
            </div>

            {/* Quiz Statistics */}
            {progress && progress.status === 'completed' && (
              <div className="p-4">
                <h3 className="text-[#111418] text-xl font-semibold mb-4">Your Results</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
                    <div className="text-2xl font-bold text-[#4798ea]">{progress.score}%</div>
                    <div className="text-sm text-[#637588]">Score</div>
                  </div>
                  <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
                    <div className="text-2xl font-bold text-[#4798ea]">{Math.floor(progress.timeSpent / 60)}</div>
                    <div className="text-sm text-[#637588]">Minutes</div>
                  </div>
                  <div className="text-center p-4 bg-[#f8f9fa] rounded-lg">
                    <div className="text-2xl font-bold text-[#4798ea]">{progress.totalSteps}</div>
                    <div className="text-sm text-[#637588]">Questions</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
} 