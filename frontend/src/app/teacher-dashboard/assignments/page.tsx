"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import Link from 'next/link';
import { assignmentAPI } from '../../../services/api';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  gradeLevel: string;
  estimatedTime: number;
  dueDate: string;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
  status: 'active' | 'completed' | 'draft';
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await assignmentAPI.getAssignments();
      setAssignments(response.assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Reading':
        return 'bg-blue-100 text-blue-800';
      case 'Writing':
        return 'bg-purple-100 text-purple-800';
      case 'Grammar':
        return 'bg-indigo-100 text-indigo-800';
      case 'Vocabulary':
        return 'bg-pink-100 text-pink-800';
      case 'Comprehension':
        return 'bg-teal-100 text-teal-800';
      case 'Phonics':
        return 'bg-orange-100 text-orange-800';
      case 'Literature':
        return 'bg-emerald-100 text-emerald-800';
      case 'Creative Writing':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
                  <p className="text-[#637588] text-lg">Loading assignments...</p>
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
                <h1 className="text-gray-900 text-2xl font-bold mb-2">Assignments</h1>
                <p className="text-[#637588]">Manage and track your student assignments</p>
              </div>
              <Link
                href="/teacher-dashboard/assignments/add"
                className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Assignment
              </Link>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {assignments.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#dce0e5] p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 text-lg font-semibold mb-2">No assignments yet</h3>
                <p className="text-[#637588] mb-6">Create your first assignment to get started</p>
                <Link
                  href="/teacher-dashboard/assignments/add"
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                >
                  Create Your First Assignment
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment._id} className="bg-white rounded-xl border border-[#dce0e5] p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-gray-900 text-lg font-semibold">{assignment.title}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(assignment.status)}`}>
                            {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                        </div>
                        
                        <p className="text-[#637588] mb-4 line-clamp-2">{assignment.description}</p>
                        
                        <div className="flex items-center gap-4 mb-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(assignment.category)}`}>
                            {assignment.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(assignment.difficulty)}`}>
                            {assignment.difficulty}
                          </span>
                          <span className="text-sm text-[#637588]">
                            Grade {assignment.gradeLevel}
                          </span>
                          <span className="text-sm text-[#637588]">
                            {assignment.estimatedTime} min
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-[#637588]">
                          <div className="flex items-center gap-4">
                            <span>Created: {formatDate(assignment.createdAt)}</span>
                            {assignment.dueDate && (
                              <span>Due: {formatDate(assignment.dueDate)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/teacher-dashboard/assignments/${assignment._id}`}
                              className="px-3 py-1 text-[#4798ea] hover:text-[#3a7bc8] transition-colors"
                            >
                              View
                            </Link>
                            <Link
                              href={`/teacher-dashboard/assignments/${assignment._id}/edit`}
                              className="px-3 py-1 text-[#4798ea] hover:text-[#3a7bc8] transition-colors"
                            >
                              Edit
                            </Link>
                            <button
                              className="px-3 py-1 text-red-500 hover:text-red-700 transition-colors"
                              onClick={() => {
                                // TODO: Implement delete functionality
                                console.log('Delete assignment:', assignment._id);
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 