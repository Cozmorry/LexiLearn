"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import Link from 'next/link';
import { moduleAPI } from '../../../services/api';

interface Module {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  gradeLevel: string;
  estimatedTime: number;
  objectives?: string;
  prerequisites?: string;
  materials?: string;
  instructions?: string;
  assessment?: string;
  photos: Array<{
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  }>;
  videos: Array<{
    filename: string;
    originalName: string;
    path: string;
    mimetype: string;
    size: number;
  }>;
  createdAt: string;
  createdBy: {
    _id: string;
    name: string;
  };
}

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      const response = await moduleAPI.getModules();
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      setError('Failed to load modules');
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

  const handleDeleteClick = (module: Module) => {
    setModuleToDelete(module);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!moduleToDelete) return;

    try {
      setDeleting(true);
      await moduleAPI.deleteModule(moduleToDelete._id);
      
      // Remove the module from the local state
      setModules(modules.filter(m => m._id !== moduleToDelete._id));
      
      // Show success message
      setSuccessMessage(`Module "${moduleToDelete.title}" has been deleted successfully.`);
      
      // Close modal and reset state
      setShowDeleteModal(false);
      setModuleToDelete(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting module:', error);
      setError('Failed to delete module. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setModuleToDelete(null);
  };

  if (loading) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <NavigationBar/>
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading modules...</p>
                </div>
                          </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && moduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Module</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{moduleToDelete.title}"</strong>? 
              This will permanently remove the module and all associated content.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Module'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar/>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight">My Modules</h1>
                <p className="text-[#637588] text-base mt-2">Manage your learning modules and content</p>
              </div>
              <Link 
                href="/teacher-dashboard/add-module"
                className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
              >
                + Create Module
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mx-4 mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Modules Grid */}
            <div className="p-4">
              {modules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {modules.map((module) => (
                    <div key={module._id} className="bg-white rounded-xl border border-[#dce0e5] p-6 hover:shadow-lg transition-shadow">
                      {/* Module Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-gray-900 text-lg font-semibold mb-2 line-clamp-2">
                            {module.title}
                          </h3>
                          <p className="text-[#637588] text-sm line-clamp-3">
                            {module.description}
                          </p>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                          {module.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                          {module.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {module.gradeLevel}
                        </span>
                      </div>

                      {/* Module Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-[#637588]">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{module.estimatedTime} minutes</span>
                        </div>
                        
                        {module.photos.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-[#637588]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{module.photos.length} photo{module.photos.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        
                        {module.videos.length > 0 && (
                          <div className="flex items-center gap-2 text-sm text-[#637588]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span>{module.videos.length} video{module.videos.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Link
                          href={`/teacher-dashboard/modules/${module._id}`}
                          className="flex-1 px-4 py-2 text-center text-[#4798ea] border border-[#4798ea] rounded-lg hover:bg-[#4798ea] hover:text-white transition-colors"
                        >
                          View Details
                        </Link>
                        <Link
                          href={`/teacher-dashboard/modules/edit/${module._id}`}
                          className="px-4 py-2 text-[#637588] border border-[#dce0e5] rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(module)}
                          className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          title="Delete module"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-[#dce0e5] p-8 text-center">
                  <div className="text-[#637588] mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">No modules yet</h3>
                  <p className="text-[#637588] mb-6">Create your first module to get started with your students.</p>
                  <Link 
                    href="/teacher-dashboard/add-module"
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                  >
                    Create Module
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && moduleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Module</h3>
                <p className="text-sm text-gray-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{moduleToDelete.title}"</strong>? 
              This will permanently remove the module and all associated content.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete Module'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}