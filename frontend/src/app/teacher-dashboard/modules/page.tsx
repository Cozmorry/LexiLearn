"use client";

import React, { useState, useEffect } from 'react';
import NavigationBar from '../components/NavigationBar';
import { moduleAPI } from '../../../services/api';

interface Module {
  _id: string;
  title: string;
  description: string;
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
  gradeLevel: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ModulesPage: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gradeLevel: '',
    difficulty: 'beginner' as 'beginner' | 'intermediate' | 'advanced',
    estimatedTime: 30
  });

  useEffect(() => {
    loadModules();
  }, []);

  const loadModules = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await moduleAPI.getModules();
      setModules(response.modules || []);
    } catch (error) {
      console.error('Error loading modules:', error);
      setError('Failed to load modules. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedTime' ? parseInt(value) || 30 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (editingModule) {
        await moduleAPI.updateModule(editingModule._id, formData);
      } else {
        await moduleAPI.createModule(formData);
      }
      
      await loadModules();
      setShowCreateModal(false);
      setEditingModule(null);
      setFormData({
        title: '',
        description: '',
        gradeLevel: '',
        difficulty: 'beginner',
        estimatedTime: 30
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save module. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (module: Module) => {
    setEditingModule(module);
    setFormData({
      title: module.title,
      description: module.description,
      gradeLevel: module.gradeLevel,
      difficulty: module.difficulty,
      estimatedTime: module.estimatedTime
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (moduleId: string) => {
    if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await moduleAPI.deleteModule(moduleId);
      await loadModules();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete module. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#111418] tracking-light text-[32px] font-bold leading-tight min-w-72">Modules</p>
              <button
                onClick={() => {
                  setEditingModule(null);
                  setFormData({
                    title: '',
                    description: '',
                    gradeLevel: '',
                    difficulty: 'beginner',
                    estimatedTime: 30
                  });
                  setShowCreateModal(true);
                }}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#4798ea] text-white gap-2 pl-4 text-sm font-bold leading-normal tracking-[0.015em]"
              >
                <div className="text-white" data-icon="Plus" data-size="20px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
                  </svg>
                </div>
                <span className="truncate">New Module</span>
              </button>
            </div>

            <div className="px-4 py-3">
              <div className="flex items-center rounded-xl border border-[#dce0e5] overflow-hidden bg-white">
                <input
                  type="text"
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm font-normal leading-normal focus:outline-none text-[#111418] placeholder:text-[#637588]"
                />
                <div className="text-[#637588] px-3" data-icon="MagnifyingGlass" data-size="24px" data-weight="regular">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                    <path d="M232.49,215.51L185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.08,68.08,0,0,1,44,112Z"></path>
                  </svg>
                </div>
              </div>
            </div>

            {error && (
              <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-[#4798ea] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[#637588] text-lg">Loading modules...</p>
                </div>
              </div>
            ) : filteredModules.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4 p-8">
                  <div className="w-16 h-16 bg-[#f0f2f4] rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-[#637588] text-lg">
                    {searchTerm ? 'No modules found matching your search.' : 'No modules yet'}
                  </p>
                  {!searchTerm && (
                    <p className="text-[#637588] text-sm text-center">Create your first module to get started.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3">
                <div className="flex overflow-hidden rounded-xl border border-[#dce0e5] bg-white">
                  <table className="flex-1">
                    <thead>
                      <tr className="bg-white">
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Title</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Description</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Grade</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Difficulty</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Time</th>
                        <th className="px-4 py-3 text-left text-[#111418] text-sm font-medium leading-normal">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredModules.map((module) => (
                        <tr key={module._id} className="border-t border-t-[#dce0e5]">
                          <td className="h-[72px] px-4 py-2 text-[#111418] text-sm font-normal leading-normal">
                            {module.title}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            {module.description}
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            {module.gradeLevel}
                          </td>
                          <td className="h-[72px] px-4 py-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                              {module.difficulty}
                            </span>
                          </td>
                          <td className="h-[72px] px-4 py-2 text-[#637588] text-sm font-normal leading-normal">
                            {module.estimatedTime} min
                          </td>
                          <td className="h-[72px] px-4 py-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(module)}
                                className="text-[#4798ea] hover:text-[#3a7bc8] text-sm font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(module._id)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#111418]">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingModule(null);
                  setFormData({
                    title: '',
                    description: '',
                    gradeLevel: '',
                    difficulty: 'beginner',
                    estimatedTime: 30
                  });
                }}
                className="text-[#637588] hover:text-[#111418]"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-[#637588] text-[#111418]"
                  placeholder="Enter module title"
                  required
                />
              </div>

              <div>
                <label className="block text-[#111418] text-sm font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full h-24 px-4 py-3 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 placeholder:text-[#637588] text-[#111418] resize-none"
                  placeholder="Enter module description"
                  required
                />
              </div>

                             <div>
                 <label className="block text-[#111418] text-sm font-medium mb-2">Grade Level</label>
                 <select
                   name="gradeLevel"
                   value={formData.gradeLevel}
                   onChange={handleInputChange}
                   className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 text-[#111418]"
                   aria-label="Select grade level"
                 >
                   <option value="">Select grade level</option>
                   <option value="1st">1st Grade</option>
                   <option value="2nd">2nd Grade</option>
                   <option value="3rd">3rd Grade</option>
                 </select>
               </div>

               <div>
                 <label className="block text-[#111418] text-sm font-medium mb-2">Difficulty</label>
                 <select
                   name="difficulty"
                   value={formData.difficulty}
                   onChange={handleInputChange}
                   className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 text-[#111418]"
                   aria-label="Select difficulty level"
                 >
                   <option value="beginner">Beginner</option>
                   <option value="intermediate">Intermediate</option>
                   <option value="advanced">Advanced</option>
                 </select>
               </div>

               <div>
                 <label className="block text-[#111418] text-sm font-medium mb-2">Estimated Time (minutes)</label>
                 <input
                   type="number"
                   name="estimatedTime"
                   value={formData.estimatedTime}
                   onChange={handleInputChange}
                   min="5"
                   max="120"
                   className="w-full h-12 px-4 rounded-xl border border-[#dde0e4] bg-white focus:border-[#4798ea] focus:outline-none focus:ring-2 focus:ring-[#4798ea]/20 transition-all duration-200 text-[#111418]"
                   placeholder="Enter estimated time in minutes"
                   aria-label="Estimated time in minutes"
                 />
               </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingModule(null);
                    setFormData({
                      title: '',
                      description: '',
                      gradeLevel: '',
                      difficulty: 'beginner',
                      estimatedTime: 30
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-[#dde0e4] text-[#111418] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-[#4798ea] text-white rounded-xl hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {editingModule ? 'Updating...' : 'Creating...'}
                    </div>
                  ) : (
                    editingModule ? 'Update Module' : 'Create Module'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModulesPage;