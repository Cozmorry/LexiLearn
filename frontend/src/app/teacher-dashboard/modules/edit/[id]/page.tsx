"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavigationBar from '../../../components/NavigationBar';
import Link from 'next/link';
import { moduleAPI } from '../../../../../services/api';



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
  content: Array<{
    type: 'text' | 'interactive' | 'quiz';
    data: string;
    quizData?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    };
  }>;
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

interface ModuleFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  gradeLevel: string;
  estimatedTime: number;
  objectives: string;
  prerequisites: string;
  materials: string;
  instructions: string;
  assessment: string;
  content: Array<{
    type: 'text' | 'interactive' | 'quiz';
    data: string;
    quizData?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    };
  }>;
  photos: File[];
  videos: File[];
}

export default function EditModulePage() {
  const params = useParams();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    gradeLevel: '',
    estimatedTime: 0,
    objectives: '',
    prerequisites: '',
    materials: '',
    instructions: '',
    assessment: '',
    content: [],
    photos: [],
    videos: []
  });

  useEffect(() => {
    if (params.id) {
      loadModule(params.id as string);
    }
  }, [params.id]);

  const loadModule = async (moduleId: string) => {
    try {
      setLoading(true);
      const response = await moduleAPI.getModule(moduleId);
      const moduleData = response.module;
      setModule(moduleData);
      
      // Populate form data
      setFormData({
        title: moduleData.title,
        description: moduleData.description,
        category: moduleData.category,
        difficulty: moduleData.difficulty,
        gradeLevel: moduleData.gradeLevel,
        estimatedTime: moduleData.estimatedTime,
        objectives: moduleData.objectives || '',
        prerequisites: moduleData.prerequisites || '',
        materials: moduleData.materials || '',
        instructions: moduleData.instructions || '',
        assessment: moduleData.assessment || '',
        content: moduleData.content || [],
        photos: [],
        videos: []
      });
    } catch (error) {
      console.error('Error loading module:', error);
      setError('Failed to load module details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'estimatedTime' ? parseInt(value) || 0 : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'photos' | 'videos') => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      [type]: files
    }));
  };

  const addContentSection = (type: 'text' | 'interactive' | 'quiz') => {
    const newContent = {
      type,
      data: '',
      ...(type === 'quiz' && {
        quizData: {
          question: '',
          options: ['', '', '', ''],
          correctAnswer: 0,
          points: 1
        }
      })
    };
    
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, newContent]
    }));
  };

  const updateContentSection = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((item, i) => 
        i === index 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const updateQuizData = (contentIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((item, i) => 
        i === contentIndex && item.type === 'quiz' && item.quizData
          ? { 
              ...item, 
              quizData: { 
                ...item.quizData, 
                [field]: value 
              } 
            }
          : item
      )
    }));
  };

  const updateQuizOption = (contentIndex: number, optionIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.map((item, i) => 
        i === contentIndex && item.type === 'quiz' && item.quizData
          ? { 
              ...item, 
              quizData: { 
                ...item.quizData, 
                options: item.quizData.options.map((opt, j) => 
                  j === optionIndex ? value : opt
                )
              } 
            }
          : item
      )
    }));
  };

  const removeContentSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('difficulty', formData.difficulty);
      formDataToSend.append('gradeLevel', formData.gradeLevel);
      formDataToSend.append('estimatedTime', String(formData.estimatedTime));
      formDataToSend.append('objectives', formData.objectives);
      formDataToSend.append('prerequisites', formData.prerequisites);
      formDataToSend.append('materials', formData.materials);
      formDataToSend.append('instructions', formData.instructions);
      formDataToSend.append('assessment', formData.assessment);
      formDataToSend.append('content', JSON.stringify(formData.content));


      // Add files
      formData.photos.forEach(file => {
        formDataToSend.append('photos', file);
      });
      
      formData.videos.forEach(file => {
        formDataToSend.append('videos', file);
      });

      await moduleAPI.updateModule(params.id as string, formDataToSend);
      router.push(`/teacher-dashboard/modules/${params.id}`);
    } catch (error) {
      console.error('Error updating module:', error);
      setError('Failed to update module');
    } finally {
      setSaving(false);
    }
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
                  <p className="text-[#637588] text-lg">Loading module...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !module) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
        <div className="layout-container flex h-full grow flex-col">
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <NavigationBar/>
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-4">
                  <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-gray-900 text-lg font-semibold mb-2">Module not found</h3>
                  <p className="text-[#637588] mb-6">{error}</p>
                  <Link 
                    href="/teacher-dashboard/modules"
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                  >
                    Back to Modules
                  </Link>
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
          <NavigationBar/>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight">Edit Module</h1>
                <p className="text-[#637588] text-base mt-2">Update your module details and content</p>
              </div>
              <Link 
                href={`/teacher-dashboard/modules/${params.id}`}
                className="px-6 py-2 text-[#637588] border border-[#dce0e5] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mx-4 mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-gray-900 text-sm font-medium mb-2">
                      Module Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter module title"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-gray-900 text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      required
                      aria-label="Select category"
                    >
                      <option value="">Select category</option>
                      <option value="Reading">Reading</option>
                      <option value="Writing">Writing</option>
                      <option value="Grammar">Grammar</option>
                      <option value="Vocabulary">Vocabulary</option>
                      <option value="Comprehension">Comprehension</option>
                      <option value="Phonics">Phonics</option>
                      <option value="Literature">Literature</option>
                      <option value="Creative Writing">Creative Writing</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="difficulty" className="block text-gray-900 text-sm font-medium mb-2">
                      Difficulty
                    </label>
                    <select
                      id="difficulty"
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      required
                      aria-label="Select difficulty"
                    >
                      <option value="">Select difficulty</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gradeLevel" className="block text-gray-900 text-sm font-medium mb-2">
                      Grade Level
                    </label>
                    <select
                      id="gradeLevel"
                      name="gradeLevel"
                      value={formData.gradeLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      required
                      aria-label="Select grade level"
                    >
                      <option value="">Select grade level</option>
                      <option value="1">Grade 1</option>
                      <option value="2">Grade 2</option>
                      <option value="3">Grade 3</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="estimatedTime" className="block text-gray-900 text-sm font-medium mb-2">
                      Estimated Time (minutes)
                    </label>
                    <input
                      type="number"
                      id="estimatedTime"
                      name="estimatedTime"
                      value={formData.estimatedTime}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter estimated time"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-gray-900 text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                    placeholder="Enter module description"
                    required
                  />
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-4">Additional Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="objectives" className="block text-gray-900 text-sm font-medium mb-2">
                      Learning Objectives
                    </label>
                    <textarea
                      id="objectives"
                      name="objectives"
                      value={formData.objectives}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter learning objectives"
                    />
                  </div>

                  <div>
                    <label htmlFor="prerequisites" className="block text-gray-900 text-sm font-medium mb-2">
                      Prerequisites
                    </label>
                    <textarea
                      id="prerequisites"
                      name="prerequisites"
                      value={formData.prerequisites}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter prerequisites"
                    />
                  </div>

                  <div>
                    <label htmlFor="materials" className="block text-gray-900 text-sm font-medium mb-2">
                      Materials Needed
                    </label>
                    <textarea
                      id="materials"
                      name="materials"
                      value={formData.materials}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter materials needed"
                    />
                  </div>

                  <div>
                    <label htmlFor="instructions" className="block text-gray-900 text-sm font-medium mb-2">
                      Instructions
                    </label>
                    <textarea
                      id="instructions"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter instructions"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="assessment" className="block text-gray-900 text-sm font-medium mb-2">
                      Assessment
                    </label>
                    <textarea
                      id="assessment"
                      name="assessment"
                      value={formData.assessment}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                      placeholder="Enter assessment criteria"
                    />
                  </div>
                </div>
              </div>

              {/* Media Uploads */}
              <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-4">Media Files</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="photos" className="block text-gray-900 text-sm font-medium mb-2">
                      Photos
                    </label>
                    <input
                      type="file"
                      id="photos"
                      name="photos"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'photos')}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4798ea] file:text-white hover:file:bg-[#3a7bc8]"
                    />
                    <p className="text-sm text-gray-900 mt-1">Upload photos to support your module content</p>
                  </div>

                  <div>
                    <label htmlFor="videos" className="block text-gray-900 text-sm font-medium mb-2">
                      Videos
                    </label>
                    <input
                      type="file"
                      id="videos"
                      name="videos"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'videos')}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#4798ea] file:text-white hover:file:bg-[#3a7bc8]"
                    />
                    <p className="text-sm text-gray-900 mt-1">Upload videos to support your module content</p>
                  </div>
                </div>
              </div>

              {/* Content Editor */}
              <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-4">Module Content</h2>
                
                <div className="space-y-4">
                  {formData.content.map((item, index) => (
                    <div key={index} className="border border-[#dce0e5] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                        </span>
                                                 <button
                           type="button"
                           onClick={() => removeContentSection(index)}
                           className="text-red-500 hover:text-red-700"
                           aria-label="Remove content section"
                           title="Remove content section"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                           </svg>
                         </button>
                      </div>

                      {item.type === 'text' && (
                        <div>
                          <label className="block text-gray-900 text-sm font-medium mb-2">
                            Text Content
                          </label>
                          <textarea
                            value={item.data}
                            onChange={(e) => updateContentSection(index, 'data', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                            placeholder="Enter text content"
                          />
                        </div>
                      )}

                      {item.type === 'interactive' && (
                        <div>
                          <label className="block text-gray-900 text-sm font-medium mb-2">
                            Interactive Content
                          </label>
                          <textarea
                            value={item.data}
                            onChange={(e) => updateContentSection(index, 'data', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                            placeholder="Enter interactive content"
                          />
                        </div>
                      )}

                      {item.type === 'quiz' && item.quizData && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-900 text-sm font-medium mb-2">
                              Question
                            </label>
                            <input
                              type="text"
                              value={item.quizData.question}
                              onChange={(e) => updateQuizData(index, 'question', e.target.value)}
                              className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                              placeholder="Enter question"
                            />
                          </div>

                          <div>
                            <label className="block text-gray-900 text-sm font-medium mb-2">
                              Options
                            </label>
                                                         <div className="space-y-2">
                               {item.quizData.options.map((option, optionIndex) => (
                                 <div key={optionIndex} className="flex items-center gap-2">
                                   <input
                                     type="radio"
                                     id={`correct-${index}-${optionIndex}`}
                                     name={`correct-${index}`}
                                     checked={optionIndex === item.quizData!.correctAnswer}
                                     onChange={() => updateQuizData(index, 'correctAnswer', optionIndex)}
                                     className="w-4 h-4 text-[#4798ea] bg-gray-100 border-gray-300 focus:ring-[#4798ea]"
                                     aria-label={`Correct answer option ${optionIndex + 1}`}
                                   />
                                   <input
                                     type="text"
                                     id={`option-${index}-${optionIndex}`}
                                     value={option}
                                     onChange={(e) => updateQuizOption(index, optionIndex, e.target.value)}
                                     className="flex-1 px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                     placeholder={`Option ${optionIndex + 1}`}
                                     aria-label={`Quiz option ${optionIndex + 1}`}
                                   />
                                 </div>
                               ))}
                             </div>
                          </div>

                          <div>
                            <label className="block text-gray-900 text-sm font-medium mb-2">
                              Points
                            </label>
                            <input
                              type="number"
                              value={item.quizData.points}
                              onChange={(e) => updateQuizData(index, 'points', parseInt(e.target.value) || 1)}
                              className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                              placeholder="Enter points"
                              min="1"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => addContentSection('text')}
                      className="px-4 py-2 text-[#4798ea] border border-[#4798ea] rounded-lg hover:bg-[#4798ea] hover:text-white transition-colors"
                    >
                      + Add Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentSection('interactive')}
                      className="px-4 py-2 text-[#4798ea] border border-[#4798ea] rounded-lg hover:bg-[#4798ea] hover:text-white transition-colors"
                    >
                      + Add Interactive
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentSection('quiz')}
                      className="px-4 py-2 text-[#4798ea] border border-[#4798ea] rounded-lg hover:bg-[#4798ea] hover:text-white transition-colors"
                    >
                      + Add Quiz
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <Link 
                  href={`/teacher-dashboard/modules/${params.id}`}
                  className="px-6 py-2 text-[#637588] border border-[#dce0e5] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 