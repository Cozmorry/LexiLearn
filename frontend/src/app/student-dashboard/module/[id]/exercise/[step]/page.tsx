"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

import StudentNavigationBar from '../../../../components/StudentNavigationBar';
import { authAPI, moduleAPI, progressAPI, tokenUtils } from '../../../../../../services/api';

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
    type: 'text' | 'image' | 'audio' | 'video' | 'interactive' | 'quiz';
    data: string;
    order: number;
    quizData?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    };
    comprehensionQuestion?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    };
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

export default function ExercisePage() {
  const [module, setModule] = useState<Module | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [showComprehensionQuestion, setShowComprehensionQuestion] = useState(false);
  const [comprehensionAnswer, setComprehensionAnswer] = useState<string>('');
  
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;
  const currentStep = parseInt(params.step as string);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenUtils.getToken();
        if (!token) {
          router.push('/student-login');
          return;
        }

        await loadExerciseData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [moduleId, currentStep, router]);

  useEffect(() => {
    // Track time spent on exercise
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadExerciseData = async () => {
    try {
      setLoading(true);
      setError('');

      const [moduleData, progressData] = await Promise.all([
        moduleAPI.getModule(moduleId),
        progressAPI.getProgress({ moduleId })
      ]);



      setModule(moduleData.module);
      setProgress(progressData.progress?.[0] || null);

      // Initialize progress if not exists
      if (!progressData.progress?.[0]) {
        await initializeProgress();
              } else {
          // Check if this exercise has already been completed
          const existingProgress = progressData.progress[0];
          if (existingProgress.currentStep > currentStep) {
            // Exercise already completed, redirect to next exercise or module
            if (currentStep + 1 < (moduleData.module?.content.length || 0)) {
              router.push(`/student-dashboard/module/${moduleId}/exercise/${currentStep + 1}`);
            } else {
              router.push(`/student-dashboard/module/${moduleId}?completed=true`);
            }
            return;
          }
          
          // Check if student is trying to access an exercise beyond their current step
          if (existingProgress.currentStep < currentStep) {
            // Redirect to the current step they should be on
            router.push(`/student-dashboard/module/${moduleId}/exercise/${existingProgress.currentStep}`);
            return;
          }
        }
    } catch (error) {
      console.error('Error loading exercise data:', error);
      setError(error.message || 'Failed to load exercise data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeProgress = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const progressData = {
        studentId: user._id,
        moduleId: moduleId,
        totalSteps: module?.content.length || 0,
        currentStep: currentStep,
        status: 'not-started' // Always start with not-started for new progress
      };

      const response = await progressAPI.updateProgress(progressData);
      setProgress(response.progress);
    } catch (error) {
      console.error('Error initializing progress:', error);
      setError(error.message || 'Failed to initialize progress. Please try again.');
    }
  };

  const currentExercise = module?.content[currentStep];
  const isLastExercise = currentStep === (module?.content.length || 0) - 1;
  const isQuiz = currentExercise?.type === 'quiz';
  
  // Debug logging
  console.log('Current exercise:', currentExercise);
  console.log('Comprehension question:', currentExercise?.comprehensionQuestion);
  console.log('Show comprehension question:', showComprehensionQuestion);

  const handleAnswerSelect = (answer: string) => {
    if (isQuiz) {
      setSelectedAnswers([answer]);
    }
  };

  const handleMarkAsComplete = async () => {
    try {
      setIsSubmitting(true);
      
      // Check if this text content has a comprehension question
      if (currentExercise?.comprehensionQuestion && !showComprehensionQuestion) {
        setShowComprehensionQuestion(true);
        setIsSubmitting(false);
        return;
      }
      
      // Update progress to next step or complete
      const nextStep = isLastExercise ? (module?.content.length || 0) : currentStep + 1;
      const newStatus = isLastExercise ? 'completed' : 'in-progress';
      
      // If this is the first exercise (step 0) and status is not-started, change to in-progress
      const shouldStartProgress = currentStep === 0 && progress?.status === 'not-started';
      
      // Calculate points for comprehension question if answered
      let comprehensionPoints = 0;
      let comprehensionScore = 0;
      if (currentExercise?.comprehensionQuestion && comprehensionAnswer) {
        const correctAnswer = currentExercise.comprehensionQuestion.options[currentExercise.comprehensionQuestion.correctAnswer];
        const isCorrect = comprehensionAnswer === correctAnswer;
        comprehensionPoints = isCorrect ? currentExercise.comprehensionQuestion.points : 0;
        // Calculate score as percentage (100% if correct, 0% if incorrect)
        comprehensionScore = isCorrect ? 100 : 0;
      }
      
      const progressData = {
        studentId: JSON.parse(localStorage.getItem('user') || '{}')._id,
        moduleId: moduleId,
        currentStep: nextStep,
        status: shouldStartProgress ? 'in-progress' : newStatus,
        timeSpent: (progress?.timeSpent || 0) + timeSpent,
        score: comprehensionScore // Use percentage score instead of raw points
      };

      const response = await progressAPI.updateProgress(progressData);
      setProgress(response.progress);

      if (isLastExercise) {
        // Module completed
        router.push(`/student-dashboard/module/${moduleId}?completed=true`);
      } else {
        // Move to next exercise
        router.push(`/student-dashboard/module/${moduleId}/exercise/${nextStep}`);
      }
    } catch (error) {
      console.error('Error marking as complete:', error);
      setError(error.message || 'Failed to update progress. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuizSubmit = async () => {
    if (selectedAnswers.length === 0) {
      setError('Please select an answer before submitting.');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Auto-grade the quiz
      const isCorrect = selectedAnswers[0] === currentExercise?.quizData?.options[currentExercise?.quizData?.correctAnswer];
      const points = isCorrect ? currentExercise?.quizData?.points || 0 : 0;
      
      setQuizScore(points);
      setShowResults(true);

      // Update progress
      const nextStep = isLastExercise ? (module?.content.length || 0) : currentStep + 1;
      const newStatus = isLastExercise ? 'completed' : 'in-progress';
      
      // If this is the first exercise (step 0) and status is not-started, change to in-progress
      const shouldStartProgress = currentStep === 0 && progress?.status === 'not-started';
      
      // Check if this exercise has already been completed to avoid score accumulation
      const existingResult = progress?.exerciseResults?.find(result => result.exerciseIndex === currentStep);
      
      // Calculate total possible points for this module
      const totalPossiblePoints = module?.content
        .filter(content => content.type === 'quiz')
        .reduce((total, content) => total + (content.quizData?.points || 0), 0) || 1;
      
      // Calculate current total earned points (convert existing score back to points if needed)
      let currentTotalPoints = 0;
      if (existingResult) {
        // If already completed, keep existing score (which should be percentage)
        currentTotalPoints = progress?.score || 0;
      } else {
        // Calculate new total points and convert to percentage
        // Get all existing quiz results to calculate total earned points
        const existingResults = progress?.exerciseResults || [];
        const existingPoints = existingResults.reduce((total, result) => total + (result.points || 0), 0);
        const totalEarnedPoints = existingPoints + points;
        currentTotalPoints = Math.round((totalEarnedPoints / totalPossiblePoints) * 100);
      }
      
      // Ensure score is within valid range
      currentTotalPoints = Math.max(0, Math.min(100, currentTotalPoints));
      
      console.log('Quiz submission debug:', {
        points,
        totalPossiblePoints,
        currentPoints: (progress?.score || 0) + points,
        currentTotalPoints,
        existingResult: !!existingResult,
        isCorrect,
        selectedAnswer: selectedAnswers[0],
        correctAnswer: currentExercise?.quizData?.options[currentExercise?.quizData?.correctAnswer]
      });
      
      // Prepare exercise result for this quiz
      const exerciseResult = {
        exerciseIndex: currentStep,
        question: currentExercise?.quizData?.question || '',
        userAnswer: selectedAnswers[0] || '',
        correctAnswer: currentExercise?.quizData?.options[currentExercise?.quizData?.correctAnswer] || '',
        isCorrect: isCorrect,
        timeSpent: timeSpent,
        points: points || 0,
        totalPoints: currentExercise?.quizData?.points || 0
      };
      
      const progressData = {
        studentId: JSON.parse(localStorage.getItem('user') || '{}')._id,
        moduleId: moduleId,
        currentStep: nextStep,
        status: shouldStartProgress ? 'in-progress' : newStatus,
        score: currentTotalPoints, // Always send a valid score
        timeSpent: (progress?.timeSpent || 0) + timeSpent,
        exerciseResult: exerciseResult
      };

      const response = await progressAPI.updateProgress(progressData);
      setProgress(response.progress);

      // Show results for 3 seconds then proceed
      setTimeout(() => {
        if (isLastExercise) {
          router.push(`/student-dashboard/module/${moduleId}?completed=true`);
        } else {
          router.push(`/student-dashboard/module/${moduleId}/exercise/${nextStep}`);
        }
      }, 3000);

    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError(error.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToModule = () => {
    router.push(`/student-dashboard/module/${moduleId}`);
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
                <p className="text-[#637588] text-lg">Loading exercise...</p>
              </div>
            </div>
                     </div>
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
                   onClick={loadExerciseData}
                   className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                 >
                   Try Again
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     );
   }

       if (!module) {
      return (
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
          <div className="layout-container flex h-full grow flex-col">
            <div className="gap-1 px-6 flex flex-1 justify-center py-5">
              <StudentNavigationBar />
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                  <p className="text-red-600 text-lg font-medium">Module not found</p>
                  <button
                    onClick={handleBackToModule}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                  >
                    Back to Modules
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!module.content || module.content.length === 0) {
      return (
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
          <div className="layout-container flex h-full grow flex-col">
            <div className="gap-1 px-6 flex flex-1 justify-center py-5">
              <StudentNavigationBar />
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                  <p className="text-red-600 text-lg font-medium">No content available</p>
                  <p className="text-[#637588] text-center">This module doesn't have any content yet.</p>
                  <button
                    onClick={handleBackToModule}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                  >
                    Back to Module
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (currentStep >= module.content.length) {
      return (
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
          <div className="layout-container flex h-full grow flex-col">
            <div className="gap-1 px-6 flex flex-1 justify-center py-5">
              <StudentNavigationBar />
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                  <p className="text-red-600 text-lg font-medium">Exercise not found</p>
                  <p className="text-[#637588] text-center">The requested exercise step doesn't exist.</p>
                  <button
                    onClick={handleBackToModule}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                  >
                    Back to Module
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (!currentExercise) {
      return (
        <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
          <div className="layout-container flex h-full grow flex-col">
            <div className="gap-1 px-6 flex flex-1 justify-center py-5">
              <StudentNavigationBar />
              <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
                <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                  <p className="text-red-600 text-lg font-medium">Exercise not found</p>
                  <button
                    onClick={handleBackToModule}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                  >
                    Back to Module
                  </button>
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
          <StudentNavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#dde0e4]">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleBackToModule}
                  className="flex items-center gap-2 text-[#637588] hover:text-[#111418] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Module
                </button>
              </div>
              <div className="flex items-center gap-4">
                                 <span className="text-[#637588] text-sm">
                   Step {currentStep + 1} of {module.content.length}
                 </span>
                 <div className="w-32 bg-[#dce0e5] rounded-full h-2">
                   <div 
                     className="bg-[#4798ea] h-2 rounded-full transition-all duration-300"
                     style={{ width: `${((currentStep + 1) / module.content.length) * 100}%` }}
                   ></div>
                 </div>
              </div>
            </div>

            {/* Exercise Content */}
            <div className="p-6">
              {showResults ? (
                // Quiz Results
                <div className="text-center py-8">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    quizScore > 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <svg className={`w-8 h-8 ${quizScore > 0 ? 'text-green-600' : 'text-red-600'}`} fill="currentColor" viewBox="0 0 24 24">
                      {quizScore > 0 ? (
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      ) : (
                        <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      )}
                    </svg>
                  </div>
                  <h2 className={`text-2xl font-bold mb-2 ${quizScore > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {quizScore > 0 ? 'Correct!' : 'Incorrect'}
                  </h2>
                  <p className="text-[#637588] mb-4">
                    {quizScore > 0 ? `You earned ${quizScore} points!` : 'Better luck next time!'}
                  </p>
                  <p className="text-[#637588] text-sm">
                    {isLastExercise ? 'Module completed!' : 'Moving to next exercise...'}
                  </p>
                </div>
              ) : (
                // Exercise Content
                <div>
                                                       {isQuiz ? (
                    // Quiz Exercise
                    <div className="space-y-4">
                      <h1 className="text-[#111418] text-2xl font-bold mb-6">
                        {currentExercise.quizData?.question}
                      </h1>
                      {currentExercise.quizData?.options?.map((option, index) => (
                        <label
                          key={index}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                            selectedAnswers.includes(option)
                              ? 'border-[#4798ea] bg-[#f0f8ff]'
                              : 'border-[#dde0e4] hover:border-[#4798ea]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={option}
                            checked={selectedAnswers.includes(option)}
                            onChange={() => handleAnswerSelect(option)}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                            selectedAnswers.includes(option)
                              ? 'border-[#4798ea] bg-[#4798ea]'
                              : 'border-[#dde0e4]'
                          }`}>
                            {selectedAnswers.includes(option) && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="text-[#111418]">{option}</span>
                        </label>
                      ))}
                      
                      <button
                        onClick={handleQuizSubmit}
                        disabled={selectedAnswers.length === 0 || isSubmitting}
                        className="w-full mt-6 px-6 py-3 bg-[#4798ea] text-white rounded-xl font-bold hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Answer'}
                      </button>
                    </div>
                  ) : (
                    // Text/Reading Exercise
                    <div className="space-y-6">
                      <div className="bg-[#f8f9fa] p-6 rounded-xl">
                        <div className="prose max-w-none text-[#111418] prose-p:text-[#111418] prose-strong:text-[#111418] prose-em:text-[#111418]">
                          <div dangerouslySetInnerHTML={{ __html: currentExercise.data }} />
                        </div>
                      </div>
                      
                      {showComprehensionQuestion ? (
                        // Comprehension Question
                        <div className="bg-white border border-[#dde0e4] rounded-xl p-6">
                          <h3 className="text-[#111418] text-lg font-semibold mb-4">
                            Comprehension Check
                          </h3>
                          <p className="text-[#637588] mb-4">
                            {currentExercise.comprehensionQuestion?.question || 'No question found'}
                          </p>
                          <div className="space-y-3">
                            {(currentExercise.comprehensionQuestion?.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4']).map((option, index) => (
                              <label
                                key={index}
                                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                                  comprehensionAnswer === option
                                    ? 'border-[#4798ea] bg-[#f0f8ff]'
                                    : 'border-[#dde0e4] hover:border-[#4798ea]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="comprehension"
                                  value={option}
                                  checked={comprehensionAnswer === option}
                                  onChange={(e) => setComprehensionAnswer(e.target.value)}
                                  className="sr-only"
                                />
                                <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                                  comprehensionAnswer === option
                                    ? 'border-[#4798ea] bg-[#4798ea]'
                                    : 'border-[#dde0e4]'
                                }`}>
                                  {comprehensionAnswer === option && (
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  )}
                                </div>
                                <span className="text-[#111418]">{option}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      
                      <button
                        onClick={handleMarkAsComplete}
                        disabled={isSubmitting || (showComprehensionQuestion && !comprehensionAnswer)}
                        className="w-full px-6 py-3 bg-[#4798ea] text-white rounded-xl font-bold hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Updating...' : 
                         showComprehensionQuestion ? 'Submit Answer & Continue' : 
                         'Mark as Complete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
                     </div>
         </div>
       </div>
     </div>
   );
 } 