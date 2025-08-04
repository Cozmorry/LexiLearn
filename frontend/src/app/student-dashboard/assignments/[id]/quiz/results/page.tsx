"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NavigationBar from '../../../../components/NavigationBar';
import { assignmentAPI } from '../../../../../../services/api';

interface QuizSubmission {
  _id: string;
  assignment: string;
  student: {
    _id: string;
    name: string;
  };
  answers: Array<{
    questionIndex: number;
    selectedAnswer: number;
    isCorrect: boolean;
    points: number;
  }>;
  totalScore: number;
  maxScore: number;
  percentage: number;
  completedAt: string;
  timeSpent: number;
}

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuizResults();
  }, [assignmentId]);

  const loadQuizResults = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getQuizResults(assignmentId);
      setSubmission(response.submission);
    } catch (error) {
      console.error('Error loading quiz results:', error);
      setError('Failed to load quiz results');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage: number) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
                  <p className="text-[#637588] text-lg">Loading results...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <NavigationBar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="bg-white rounded-xl border border-[#dce0e5] p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-[#637588] mb-6">{error || 'No quiz submission found for this assignment.'}</p>
                <Link
                  href={`/student-dashboard/assignments/${assignmentId}/quiz`}
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                >
                  Take Quiz
                </Link>
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
          <NavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-gray-900 text-2xl font-bold mb-2">Quiz Results</h1>
                <p className="text-[#637588]">Your quiz submission has been graded</p>
              </div>
              <Link
                href="/student-dashboard/assignments"
                className="px-4 py-2 text-[#637588] hover:text-gray-900 transition-colors"
              >
                ← Back to Assignments
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Score Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Score Summary</h2>
                  
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className={`text-4xl font-bold ${getGradeColor(submission.percentage)}`}>
                        {submission.percentage}%
                      </div>
                      <div className={`text-2xl font-semibold ${getGradeColor(submission.percentage)}`}>
                        Grade: {getGradeLetter(submission.percentage)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-[#637588]">Score</span>
                        <span className="font-semibold">{submission.totalScore} / {submission.maxScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#637588]">Correct Answers</span>
                        <span className="font-semibold">{submission.answers.filter(a => a.isCorrect).length} / {submission.answers.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#637588]">Time Spent</span>
                        <span className="font-semibold">{formatTime(submission.timeSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#637588]">Completed</span>
                        <span className="font-semibold">{formatDate(submission.completedAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Results */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Question Details</h2>
                  
                  <div className="space-y-4">
                    {submission.answers.map((answer, index) => (
                      <div key={index} className="border border-[#dce0e5] rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-gray-900 font-medium">Question {index + 1}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-[#637588]">{answer.points} points</span>
                            {answer.isCorrect ? (
                              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                Correct
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                Incorrect
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-[#637588]">
                          Your answer: Option {answer.selectedAnswer + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/student-dashboard/assignments"
                className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
              >
                Back to Assignments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 