"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavigationBar from '../../../components/NavigationBar';
import { assignmentAPI } from '../../../../../services/api';

interface QuizQuestion {
  questionIndex: number;
  question: string;
  options: string[];
  points: number;
}

interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
}

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    loadQuizQuestions();
    setStartTime(new Date());
  }, [assignmentId]);

  useEffect(() => {
    if (startTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const spent = Math.floor((now.getTime() - startTime.getTime()) / 1000);
        setTimeSpent(spent);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTime]);

  const loadQuizQuestions = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getQuizQuestions(assignmentId);
      setQuizQuestions(response.quizQuestions);
      setAssignmentTitle(response.assignmentTitle);
      setTotalQuestions(response.totalQuestions);
    } catch (error) {
      console.error('Error loading quiz questions:', error);
      setError('Failed to load quiz questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, selectedAnswer: number) => {
    setAnswers(prev => {
      const existing = prev.find(a => a.questionIndex === questionIndex);
      if (existing) {
        return prev.map(a => a.questionIndex === questionIndex ? { ...a, selectedAnswer } : a);
      } else {
        return [...prev, { questionIndex, selectedAnswer }];
      }
    });
  };

  const handleSubmit = async () => {
    if (answers.length < totalQuestions) {
      setError(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await assignmentAPI.submitQuiz(assignmentId, answers, timeSpent);
      
      // Redirect to results page
      router.push(`/student-dashboard/assignments/${assignmentId}/quiz/results`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
                  <p className="text-[#637588] text-lg">Loading quiz...</p>
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
          <NavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-gray-900 text-2xl font-bold mb-2">Quiz: {assignmentTitle}</h1>
                <p className="text-[#637588]">Answer all questions to complete the quiz</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-[#637588]">Time Spent</div>
                <div className="text-lg font-semibold text-[#4798ea]">{formatTime(timeSpent)}</div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-gray-900 text-xl font-semibold">Quiz Questions</h2>
                  <div className="text-sm text-[#637588]">
                    {answers.length} of {totalQuestions} answered
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#4798ea] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answers.length / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-8">
                {quizQuestions.map((question, index) => (
                  <div key={question.questionIndex} className="border border-[#dce0e5] rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 bg-[#4798ea] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 text-lg font-medium mb-2">{question.question}</h3>
                        <p className="text-sm text-[#637588]">{question.points} points</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="radio"
                            name={`question-${question.questionIndex}`}
                            value={optionIndex}
                            checked={answers.find(a => a.questionIndex === question.questionIndex)?.selectedAnswer === optionIndex}
                            onChange={() => handleAnswerSelect(question.questionIndex, optionIndex)}
                            className="text-[#4798ea] focus:ring-[#4798ea]"
                          />
                          <span className="text-gray-900">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#dce0e5]">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#637588]">
                    {answers.length === totalQuestions ? 'All questions answered' : `${totalQuestions - answers.length} questions remaining`}
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || answers.length < totalQuestions}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 