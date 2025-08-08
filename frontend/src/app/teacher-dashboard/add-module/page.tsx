"use client";

import React, { useState } from 'react';
import NavigationBar from '../../teacher-dashboard/components/NavigationBar';
import Link from 'next/link';
import { moduleAPI } from '../../../services/api';



interface ModuleFormData {
  title: string;
  description: string;
  gradeLevel: string;
  difficulty: string;
  estimatedTime: number;
  category: string;
  objectives: string;
  prerequisites: string;
  materials: string;
  instructions: string;
  assessment: string;
  content: Array<{
    type: 'text' | 'interactive' | 'quiz';
    data: string;
    order: number;
    quizData?: {
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    };
    comprehensionQuestions?: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      points: number;
    }>;
    videoInfo?: {
      originalName: string;
      mimetype: string;
      size: number;
    };
  }>;

  photos: File[];
  videos: File[];
}

export default function AddModulePage() {
  const [formData, setFormData] = useState<ModuleFormData>({
    title: '',
    description: '',
    gradeLevel: '',
    difficulty: 'Beginner',
    estimatedTime: 30,
    category: '',
    objectives: '',
    prerequisites: '',
    materials: '',
    instructions: '',
    assessment: '',
    content: [],
    photos: [],
    videos: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      [type]: [...prev[type], ...files]
    }));
  };

  const removeFile = (index: number, type: 'photos' | 'videos') => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData for file uploads
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'photos' && key !== 'videos' && key !== 'content') {
          const value = formData[key as keyof Omit<ModuleFormData, 'photos' | 'videos' | 'content'>];
          submitData.append(key, String(value));
        }
      });

      // Add content as JSON string
      console.log('Submitting content:', formData.content);
      submitData.append('content', JSON.stringify(formData.content));




      // Add files
      formData.photos.forEach((file) => {
        submitData.append(`photos`, file);
      });

      formData.videos.forEach((file) => {
        submitData.append(`videos`, file);
      });

      await moduleAPI.createModule(submitData);
      
      // Redirect to modules list or dashboard
      window.location.href = '/teacher-dashboard';
    } catch (error) {
      console.error('Error creating module:', error);
      setError('Failed to create module. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5">
          <NavigationBar/>
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <div>
                <h1 className="text-gray-900 tracking-light text-[32px] font-bold leading-tight">Create New Module</h1>
                <p className="text-[#637588] text-base mt-2">Design engaging learning experiences for your students</p>
              </div>
              <Link 
                href="/teacher-dashboard"
                className="px-4 py-2 text-[#637588] hover:text-[#111418] transition-colors"
              >
                ← Back to Dashboard
              </Link>
            </div>

            {/* Form */}
            <div className="p-4">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-600">{error}</p>
                  </div>
                )}

                {/* Basic Information */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Basic Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div>
                       <label htmlFor="title" className="block text-gray-900 text-sm font-medium mb-2">
                         Title *
                       </label>
                       <input
                         id="title"
                         type="text"
                         name="title"
                         value={formData.title}
                         onChange={handleInputChange}
                         placeholder="Enter module title"
                         className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                         required
                       />
                     </div>

                                         <div>
                       <label htmlFor="category" className="block text-gray-900 text-sm font-medium mb-2">
                         Category *
                       </label>
                                               <select
                          id="category"
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent text-gray-900"
                          required
                          aria-label="Select module category"
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
                       <label htmlFor="gradeLevel" className="block text-gray-900 text-sm font-medium mb-2">
                         Grade Level *
                       </label>
                                               <select
                          id="gradeLevel"
                          name="gradeLevel"
                          value={formData.gradeLevel}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent text-gray-900"
                          required
                          aria-label="Select grade level"
                        >
                                                 <option value="">Select grade level</option>
                         <option value="1">1</option>
                         <option value="2">2</option>
                         <option value="3">3</option>
                      </select>
                    </div>

                    <div>
                                             <label htmlFor="difficulty" className="block text-gray-900 text-sm font-medium mb-2">
                         Difficulty *
                       </label>
                                                                    <select
                         id="difficulty"
                         name="difficulty"
                         value={formData.difficulty}
                         onChange={handleInputChange}
                         className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent text-gray-900"
                         required
                         aria-label="Select difficulty level"
                       >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div>
                                             <label htmlFor="estimatedTime" className="block text-gray-900 text-sm font-medium mb-2">
                         Estimated Time (minutes) *
                       </label>
                                             <input
                         id="estimatedTime"
                         type="number"
                         name="estimatedTime"
                         value={formData.estimatedTime}
                         onChange={handleInputChange}
                         min="1"
                         className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                         required
                       />
                    </div>
                  </div>

                  <div className="mt-4">
                                           <label htmlFor="description" className="block text-gray-900 text-sm font-medium mb-2">
                         Description *
                       </label>
                                           <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter a detailed description of the module"
                        rows={4}
                        className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                        required
                      />
                  </div>
                </div>

                                {/* Learning Objectives */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Learning Objectives</h2>
                  <textarea
                    id="objectives"
                    name="objectives"
                    value={formData.objectives}
                    onChange={handleInputChange}
                    placeholder="What will students learn from this module? List the key learning objectives..."
                    rows={4}
                    className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                  />
                </div>

                {/* Prerequisites */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Prerequisites</h2>
                  <textarea
                    name="prerequisites"
                    value={formData.prerequisites}
                    onChange={handleInputChange}
                    placeholder="What knowledge or skills should students have before starting this module?"
                    rows={3}
                    className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                  />
                </div>

                {/* Materials & Resources */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Materials & Resources</h2>
                  <textarea
                    name="materials"
                    value={formData.materials}
                    onChange={handleInputChange}
                    placeholder="List any materials, books, or resources needed for this module..."
                    rows={3}
                    className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-500 text-gray-900"
                  />
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Instructions</h2>
                                     <textarea
                     name="instructions"
                     value={formData.instructions}
                     onChange={handleInputChange}
                                           placeholder="Provide step-by-step instructions for completing this module..."
                      rows={6}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-500 text-gray-900"
                   />
                </div>

                {/* Assessment */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Assessment</h2>
                                     <textarea
                     name="assessment"
                     value={formData.assessment}
                     onChange={handleInputChange}
                                           placeholder="How will you assess student understanding? Describe the assessment method..."
                      rows={4}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-500 text-gray-900"
                   />
                </div>

                {/* Content Editor */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Module Content</h2>
                  <div className="space-y-4">
                    {formData.content.map((item, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 border border-[#dce0e5]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-900">Section {index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newContent = [...formData.content];
                              newContent.splice(index, 1);
                              setFormData(prev => ({ ...prev, content: newContent }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                                                 <div className="flex items-center gap-2 mb-2">
                           <label htmlFor={`content-type-${index}`} className="block text-gray-900 text-sm font-medium">
                             Content Type
                           </label>
                           <select
                             id={`content-type-${index}`}
                             value={item.type}
                             onChange={(e) => {
                               const newContent = [...formData.content];
                               newContent[index] = { ...newContent[index], type: e.target.value as 'text' | 'interactive' | 'quiz' };
                               setFormData(prev => ({ ...prev, content: newContent }));
                             }}
                             className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent text-gray-900"
                             aria-label="Select content type"
                           >
                              <option value="text">Text Section</option>
                              <option value="interactive">Interactive Section</option>
                              <option value="quiz">Quiz Section</option>
                           </select>
                         </div>
                                                 {item.type === 'quiz' ? (
                           <div className="space-y-4">
                             <div>
                               <label htmlFor={`quiz-question-${index}`} className="block text-gray-900 text-sm font-medium mb-2">
                                 Question
                               </label>
                               <textarea
                                 id={`quiz-question-${index}`}
                                 value={item.quizData?.question || ''}
                                 onChange={(e) => {
                                   const newContent = [...formData.content];
                                   newContent[index] = { 
                                     ...newContent[index], 
                                     quizData: { 
                                       ...newContent[index].quizData, 
                                       question: e.target.value 
                                     } 
                                   };
                                   setFormData(prev => ({ ...prev, content: newContent }));
                                 }}
                                 placeholder="Enter the quiz question..."
                                 rows={3}
                                 className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                               />
                             </div>
                             
                             <div>
                               <label className="block text-gray-900 text-sm font-medium mb-2">
                                 Options
                               </label>
                               {[0, 1, 2, 3].map((optionIndex) => (
                                 <div key={optionIndex} className="flex items-center gap-2 mb-2">
                                   <input
                                     type="radio"
                                     name={`correct-answer-${index}`}
                                     id={`correct-answer-${index}-${optionIndex}`}
                                     checked={item.quizData?.correctAnswer === optionIndex}
                                     onChange={() => {
                                       const newContent = [...formData.content];
                                       newContent[index] = { 
                                         ...newContent[index], 
                                         quizData: { 
                                           ...newContent[index].quizData, 
                                           correctAnswer: optionIndex 
                                         } 
                                       };
                                       setFormData(prev => ({ ...prev, content: newContent }));
                                     }}
                                     className="text-[#4798ea]"
                                     aria-label={`Mark option ${optionIndex + 1} as correct answer`}
                                   />
                                   <input
                                     type="text"
                                     id={`quiz-option-${index}-${optionIndex}`}
                                     value={item.quizData?.options?.[optionIndex] || ''}
                                     onChange={(e) => {
                                       const newContent = [...formData.content];
                                       const options = [...(newContent[index].quizData?.options || ['', '', '', ''])];
                                       options[optionIndex] = e.target.value;
                                       newContent[index] = { 
                                         ...newContent[index], 
                                         quizData: { 
                                           ...newContent[index].quizData, 
                                           options 
                                         } 
                                       };
                                       setFormData(prev => ({ ...prev, content: newContent }));
                                     }}
                                     placeholder={`Option ${optionIndex + 1}`}
                                     className="flex-1 px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                     aria-label={`Quiz option ${optionIndex + 1}`}
                                   />
                                 </div>
                               ))}
                             </div>
                             
                             <div>
                               <label htmlFor={`quiz-points-${index}`} className="block text-gray-900 text-sm font-medium mb-2">
                                 Points
                               </label>
                               <input
                                 id={`quiz-points-${index}`}
                                 type="number"
                                 value={item.quizData?.points || 10}
                                 onChange={(e) => {
                                   const newContent = [...formData.content];
                                   newContent[index] = { 
                                     ...newContent[index], 
                                     quizData: { 
                                       ...newContent[index].quizData, 
                                       points: parseInt(e.target.value) || 10 
                                     } 
                                   };
                                   setFormData(prev => ({ ...prev, content: newContent }));
                                 }}
                                 min="1"
                                 max="100"
                                 className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                               />
                             </div>

                             {/* Comprehension Questions for Quiz sections */}
                             <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                               <div className="flex items-center justify-between mb-3">
                                 <h4 className="text-sm font-medium text-gray-900">Additional Questions (Optional)</h4>
                                 <button
                                   type="button"
                                   onClick={() => {
                                     const newContent = [...formData.content];
                                     newContent[index] = {
                                       ...newContent[index],
                                       comprehensionQuestions: [...(newContent[index].comprehensionQuestions || []), {
                                         question: '',
                                         options: ['', '', '', ''],
                                         correctAnswer: 0,
                                         points: 10
                                       }]
                                     };
                                     setFormData(prev => ({ ...prev, content: newContent }));
                                   }}
                                   className="text-sm text-[#4798ea] hover:text-[#3a7bc8]"
                                 >
                                   Add Question
                                 </button>
                               </div>
                               
                               {(item.comprehensionQuestions || []).map((compQuestion, compIndex) => (
                                 <div key={compIndex} className="space-y-3 mb-4 p-3 border border-gray-200 rounded-lg">
                                   <div className="flex items-center justify-between">
                                     <h5 className="text-sm font-medium text-gray-800">Question {compIndex + 1}</h5>
                                     <button
                                       type="button"
                                       onClick={() => {
                                         const newContent = [...formData.content];
                                         newContent[index] = {
                                           ...newContent[index],
                                           comprehensionQuestions: newContent[index].comprehensionQuestions?.filter((_, idx) => idx !== compIndex) || []
                                         };
                                         setFormData(prev => ({ ...prev, content: newContent }));
                                       }}
                                       className="text-xs text-red-600 hover:text-red-800"
                                     >
                                       Remove
                                     </button>
                                   </div>
                                   
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                     <textarea
                                       value={compQuestion.question}
                                       onChange={(e) => {
                                         const newContent = [...formData.content];
                                         const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                         newQuestions[compIndex] = { ...newQuestions[compIndex], question: e.target.value };
                                         newContent[index] = {
                                           ...newContent[index],
                                           comprehensionQuestions: newQuestions
                                         };
                                         setFormData(prev => ({ ...prev, content: newContent }));
                                       }}
                                       placeholder="Enter a comprehension question..."
                                       rows={2}
                                       className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                     />
                                   </div>
                                   
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
                                     {compQuestion.options.map((option, optionIndex) => (
                                       <div key={optionIndex} className="flex items-center gap-2 mb-2">
                                         <input
                                           type="radio"
                                           name={`quiz-comp-correct-${index}-${compIndex}`}
                                           checked={compQuestion.correctAnswer === optionIndex}
                                           onChange={() => {
                                             const newContent = [...formData.content];
                                             const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                             newQuestions[compIndex] = { ...newQuestions[compIndex], correctAnswer: optionIndex };
                                             newContent[index] = {
                                               ...newContent[index],
                                               comprehensionQuestions: newQuestions
                                             };
                                             setFormData(prev => ({ ...prev, content: newContent }));
                                           }}
                                           className="text-[#4798ea] focus:ring-[#4798ea]"
                                           aria-label={`Mark option ${optionIndex + 1} as correct answer`}
                                         />
                                         <input
                                           type="text"
                                           value={option}
                                           onChange={(e) => {
                                             const newContent = [...formData.content];
                                             const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                             const newOptions = [...(newQuestions[compIndex].options || ['', '', '', ''])];
                                             newOptions[optionIndex] = e.target.value;
                                             newQuestions[compIndex] = { ...newQuestions[compIndex], options: newOptions };
                                             newContent[index] = {
                                               ...newContent[index],
                                               comprehensionQuestions: newQuestions
                                             };
                                             setFormData(prev => ({ ...prev, content: newContent }));
                                           }}
                                           placeholder={`Option ${optionIndex + 1}`}
                                           className="flex-1 px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                           aria-label={`Comprehension question option ${optionIndex + 1}`}
                                         />
                                       </div>
                                     ))}
                                   </div>
                                   
                                   <div>
                                     <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                                     <input
                                       type="number"
                                       value={compQuestion.points}
                                       onChange={(e) => {
                                         const newContent = [...formData.content];
                                         const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                         newQuestions[compIndex] = { ...newQuestions[compIndex], points: parseInt(e.target.value) || 10 };
                                         newContent[index] = {
                                           ...newContent[index],
                                           comprehensionQuestions: newQuestions
                                         };
                                         setFormData(prev => ({ ...prev, content: newContent }));
                                       }}
                                       min="1"
                                       max="100"
                                       className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                       aria-label="Comprehension question points"
                                     />
                                   </div>
                                 </div>
                               ))}
                             </div>
                           </div>
                          ) : (
                           <>
                             <label htmlFor={`content-data-${index}`} className="block text-gray-900 text-sm font-medium mb-2">
                               Content
                             </label>
                              <textarea
                                id={`content-data-${index}`}
                                value={item.data}
                                onChange={(e) => {
                                  const newContent = [...formData.content];
                                  newContent[index] = { ...newContent[index], data: e.target.value };
                                  setFormData(prev => ({ ...prev, content: newContent }));
                                }}
                                placeholder={item.type === 'text' ? 'Enter text content for this section...' : 'Enter interactive content for this section...'}
                                rows={item.type === 'text' ? 4 : 8}
                                className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                              />
                             
                                                                {(item.type === 'text' || item.type === 'video') && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-medium text-gray-900">Comprehension Questions (Optional)</h4>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newContent = [...formData.content];
                                        newContent[index] = {
                                          ...newContent[index],
                                          comprehensionQuestions: [...(newContent[index].comprehensionQuestions || []), {
                                            question: '',
                                            options: ['', '', '', ''],
                                            correctAnswer: 0,
                                            points: 10
                                          }]
                                        };
                                        setFormData(prev => ({ ...prev, content: newContent }));
                                      }}
                                      className="text-sm text-[#4798ea] hover:text-[#3a7bc8]"
                                    >
                                      Add Question
                                    </button>
                                  </div>
                                  
                                  {(item.comprehensionQuestions || []).map((compQuestion, compIndex) => (
                                    <div key={compIndex} className="space-y-3 mb-4 p-3 border border-gray-200 rounded-lg">
                                      <div className="flex items-center justify-between">
                                        <h5 className="text-sm font-medium text-gray-800">Question {compIndex + 1}</h5>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const newContent = [...formData.content];
                                            newContent[index] = {
                                              ...newContent[index],
                                              comprehensionQuestions: newContent[index].comprehensionQuestions?.filter((_, idx) => idx !== compIndex) || []
                                            };
                                            setFormData(prev => ({ ...prev, content: newContent }));
                                          }}
                                          className="text-xs text-red-600 hover:text-red-800"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Question
                                        </label>
                                        <textarea
                                          value={compQuestion.question}
                                          onChange={(e) => {
                                            const newContent = [...formData.content];
                                            const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                            newQuestions[compIndex] = { ...newQuestions[compIndex], question: e.target.value };
                                            newContent[index] = {
                                              ...newContent[index],
                                              comprehensionQuestions: newQuestions
                                            };
                                            setFormData(prev => ({ ...prev, content: newContent }));
                                          }}
                                          placeholder="Enter a comprehension question..."
                                          rows={2}
                                          className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                        />
                                      </div>
                                      
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                          Options
                                        </label>
                                        {compQuestion.options.map((option, optionIndex) => (
                                          <div key={optionIndex} className="flex items-center gap-2 mb-2">
                                            <input
                                              type="radio"
                                              name={`comprehension-correct-${index}-${compIndex}`}
                                              checked={compQuestion.correctAnswer === optionIndex}
                                              onChange={() => {
                                                const newContent = [...formData.content];
                                                const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                                newQuestions[compIndex] = { ...newQuestions[compIndex], correctAnswer: optionIndex };
                                                newContent[index] = {
                                                  ...newContent[index],
                                                  comprehensionQuestions: newQuestions
                                                };
                                                setFormData(prev => ({ ...prev, content: newContent }));
                                              }}
                                              className="text-[#4798ea] focus:ring-[#4798ea]"
                                              aria-label={`Mark option ${optionIndex + 1} as correct answer`}
                                            />
                                                                                        <input
                                              type="text"
                                              value={option}
                                              onChange={(e) => {
                                                const newContent = [...formData.content];
                                                const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                                const newOptions = [...(newQuestions[compIndex].options || ['', '', '', ''])];
                                                newOptions[optionIndex] = e.target.value;
                                                newQuestions[compIndex] = { ...newQuestions[compIndex], options: newOptions };
                                                newContent[index] = {
                                                  ...newContent[index],
                                                  comprehensionQuestions: newQuestions
                                                };
                                                setFormData(prev => ({ ...prev, content: newContent }));
                                              }}
                                              placeholder={`Option ${optionIndex + 1}`}
                                              className="flex-1 px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                              aria-label={`Comprehension question option ${optionIndex + 1}`}
                                            />
                                          </div>
                                        ))}
                                      </div>
                                      
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                          Points
                                        </label>
                                        <input
                                          type="number"
                                          value={compQuestion.points}
                                          onChange={(e) => {
                                            const newContent = [...formData.content];
                                            const newQuestions = [...(newContent[index].comprehensionQuestions || [])];
                                            newQuestions[compIndex] = { ...newQuestions[compIndex], points: parseInt(e.target.value) || 10 };
                                            newContent[index] = {
                                              ...newContent[index],
                                              comprehensionQuestions: newQuestions
                                            };
                                            setFormData(prev => ({ ...prev, content: newContent }));
                                          }}
                                          min="1"
                                          max="100"
                                          className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent placeholder:text-gray-600 text-gray-900"
                                          aria-label="Comprehension question points"
                                        />
                                      </div>
                                    </div>
                                   ))}

                               </div>
                             )}
                           </>
                         )}
                      </div>
                    ))}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 w-full">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              content: [...prev.content, { 
                                type: 'text', 
                                data: '', 
                                order: prev.content.length + 1
                              }]
                            }));
                          }}
                          className="px-4 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                        >
                          + Add Text
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              content: [...prev.content, { 
                                type: 'interactive', 
                                data: '', 
                                order: prev.content.length + 1
                              }]
                            }));
                          }}
                          className="px-4 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                        >
                          + Add Interactive
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              content: [...prev.content, { 
                                type: 'quiz', 
                                data: '', 
                                order: prev.content.length + 1,
                                quizData: {
                                  question: '',
                                  options: ['', '', '', ''],
                                  correctAnswer: 0,
                                  points: 10
                                }
                              }]
                            }));
                          }}
                          className="px-4 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors"
                        >
                          + Add Quiz
                        </button>
                      </div>
                  </div>
                </div>

                {/* Media Uploads */}
                <div className="bg-white rounded-xl border border-[#dce0e5] p-6">
                  <h2 className="text-gray-900 text-xl font-semibold mb-4">Media & Resources</h2>
                  
                                    {/* Photos */}
                  <div className="mb-6">
                    <label htmlFor="photos" className="block text-gray-900 text-sm font-medium mb-2">
                      Photos (optional)
                    </label>
                    <p className="text-sm text-gray-700 mb-3 font-medium">
                      Upload images to support your learning module. These can include diagrams, illustrations, or visual aids that help explain concepts.
                    </p>
                    <input
                      id="photos"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'photos')}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4798ea] file:text-white hover:file:bg-[#3a7bc8] file:cursor-pointer text-gray-900"
                    />
                    {formData.photos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-900 mb-2">Selected photos:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.photos.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                              <span className="text-sm text-gray-800 font-medium">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'photos')}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                                    {/* Videos */}
                  <div>
                    <label htmlFor="videos" className="block text-gray-900 text-sm font-medium mb-2">
                      Videos (optional)
                    </label>
                    <p className="text-sm text-gray-700 mb-3 font-medium">
                      Upload video content to enhance your module. Videos will automatically appear first in the module flow, followed by text content and quizzes. Videos can include demonstrations, explanations, or interactive content.
                    </p>
                    <input
                      id="videos"
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={(e) => handleFileChange(e, 'videos')}
                      className="w-full px-3 py-2 border border-[#dce0e5] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4798ea] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4798ea] file:text-white hover:file:bg-[#3a7bc8] file:cursor-pointer text-gray-900"
                    />
                    {formData.videos.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-900 mb-2">Selected videos:</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.videos.map((file, index) => (
                            <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
                              <span className="text-sm text-gray-800 font-medium">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeFile(index, 'videos')}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                  <Link
                    href="/teacher-dashboard"
                    className="px-6 py-2 border border-[#dce0e5] text-[#637588] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-[#4798ea] text-white rounded-lg hover:bg-[#3a7bc8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating Module...' : 'Create Module'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 