"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import NavigationBar from '../../components/NavigationBar';
import Link from 'next/link';
import { moduleAPI } from '../../../../services/api';
import VideoPlayer from '../../../components/VideoPlayer';

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
    type: 'text' | 'interactive' | 'quiz' | 'video';
    data: string;
    quizData?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    };
    videoInfo?: {
      originalName: string;
      mimetype: string;
      size: number;
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

export default function ModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      loadModule(params.id as string);
    }
  }, [params.id]);

  const loadModule = async (moduleId: string) => {
    try {
      setLoading(true);
      const response = await moduleAPI.getModule(moduleId);
      setModule(response.module);
    } catch (error) {
      console.error('Error loading module:', error);
      setError('Failed to load module details');
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
                  <p className="text-[#637588] text-lg">Loading module details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !module) {
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
                  <p className="text-[#637588] mb-6">{error || 'The module you are looking for does not exist.'}</p>
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
                <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight">{module.title}</h1>
                <p className="text-[#637588] text-base mt-2">Module Details</p>
              </div>
              <div className="flex gap-2">
                <Link 
                  href={`/teacher-dashboard/modules/edit/${module._id}`}
                  className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                >
                  Edit Module
                </Link>
                <Link 
                  href="/teacher-dashboard/modules"
                  className="px-6 py-2 text-[#637588] border border-[#dce0e5] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Modules
                </Link>
              </div>
            </div>

            {/* Module Content */}
            <div className="p-4 space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                <h2 className="text-gray-900 text-xl font-semibold mb-4">Module Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-gray-900 font-medium mb-2">Description</h3>
                    <p className="text-[#637588]">{module.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-gray-900 font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(module.category)}`}>
                        {module.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                        {module.difficulty}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Grade {module.gradeLevel}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </div>

              {/* Additional Details */}
              {(module.objectives || module.prerequisites || module.materials || module.instructions || module.assessment) && (
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Additional Details</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {module.objectives && (
                      <div>
                        <h3 className="text-gray-900 font-medium mb-2">Learning Objectives</h3>
                        <p className="text-[#637588]">{module.objectives}</p>
                      </div>
                    )}
                    
                    {module.prerequisites && (
                      <div>
                        <h3 className="text-gray-900 font-medium mb-2">Prerequisites</h3>
                        <p className="text-[#637588]">{module.prerequisites}</p>
                      </div>
                    )}
                    
                    {module.materials && (
                      <div>
                        <h3 className="text-gray-900 font-medium mb-2">Materials Needed</h3>
                        <p className="text-[#637588]">{module.materials}</p>
                      </div>
                    )}
                    
                    {module.instructions && (
                      <div>
                        <h3 className="text-gray-900 font-medium mb-2">Instructions</h3>
                        <p className="text-[#637588]">{module.instructions}</p>
                      </div>
                    )}
                    
                    {module.assessment && (
                      <div>
                        <h3 className="text-gray-900 font-medium mb-2">Assessment</h3>
                        <p className="text-[#637588]">{module.assessment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Module Content */}
              {module.content && module.content.length > 0 && (
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Module Content</h2>
                  
                  <div className="space-y-4">

                    {module.content.map((item, index) => (
                      <div key={index} className="border border-[#dce0e5] rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                          </span>
                          {item.type === 'quiz' && item.quizData && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {item.quizData.points} points
                            </span>
                          )}
                        </div>
                        
                        {item.type === 'text' && (
                          <p className="text-[#637588]">{item.data}</p>
                        )}
                        
                        {item.type === 'video' && (
                          <div>
                            <p className="text-[#637588] mb-2">Video content</p>
                            {item.videoInfo && (
                              <div className="text-xs text-[#637588]">
                                <p>File: {item.videoInfo.originalName}</p>
                                <p>Size: {Math.round(item.videoInfo.size / (1024 * 1024) * 10) / 10} MB</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {item.type === 'interactive' && (
                          <p className="text-[#637588]">{item.data}</p>
                        )}
                        
                        {item.type === 'quiz' && item.quizData && (
                          <div>
                            <p className="text-gray-900 font-medium mb-2">{item.quizData.question}</p>
                            <div className="space-y-2">
                              {item.quizData.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    optionIndex === item.quizData!.correctAnswer 
                                      ? 'border-green-500 bg-green-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {optionIndex === item.quizData!.correctAnswer && (
                                      <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                  </span>
                                  <span className={`text-sm ${
                                    optionIndex === item.quizData!.correctAnswer 
                                      ? 'text-green-600 font-medium' 
                                      : 'text-[#637588]'
                                  }`}>
                                    {option}
                                  </span>
                                  {optionIndex === item.quizData!.correctAnswer && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      Correct Answer
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 text-xs text-gray-500">
                              Correct Answer: Option {item.quizData!.correctAnswer + 1} • Points: {item.quizData!.points}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Files */}
              {(module.photos.length > 0 || module.videos.length > 0) && (
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Media Files</h2>
                  
                  {module.photos.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-gray-900 font-medium mb-3">Photos</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {module.photos.map((photo, index) => (
                          <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <img 
                              src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/modules/uploads/${photo.filename}`}
                              alt={photo.originalName}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                console.error('Image failed to load:', e.currentTarget.src);
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                              onLoad={() => {
                                console.log('Image loaded successfully:', photo.filename);
                              }}
                            />
                            <div className="hidden w-full h-full flex flex-col items-center justify-center text-gray-500 text-sm p-4">
                              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-center break-words">{photo.originalName}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {module.videos.length > 0 && (
                    <div>
                      <h3 className="text-gray-900 font-medium mb-3">Learning Videos</h3>
                      <div className="space-y-6">
                        {module.videos.map((video, index) => (
                          <div key={index} className="bg-white rounded-xl border border-[#dde0e4] overflow-hidden">
                            <div className="aspect-video">
                              <VideoPlayer
                                src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/modules/uploads/${video.filename}`}
                                title={video.originalName}
                                className="w-full h-full"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="text-gray-900 font-medium mb-2">{video.originalName}</h4>
                              <div className="flex items-center gap-4 text-sm text-[#637588]">
                                <span>Size: {(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                                <span>Type: {video.mimetype}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
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