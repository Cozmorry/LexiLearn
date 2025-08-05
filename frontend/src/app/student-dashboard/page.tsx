
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from '../components/Footer';
import StudentNavigationBar from './components/StudentNavigationBar';
import { moduleAPI, progressAPI, quizAPI, tokenUtils } from '../../services/api';

interface User {
  _id: string;
  name: string;
  role: string;
  grade: string;
}

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
  isActive: boolean;
}

interface Progress {
  _id: string;
  moduleId: Module;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused';
  currentStep: number;
  totalSteps: number;
  score: number;
  timeSpent: number;
  completionPercentage: number;
}

interface Quiz {
  _id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  questions: Array<{
    type: 'multiple-choice' | 'fill-blank' | 'matching' | 'drag-drop' | 'typing';
    question: string;
    options?: string[];
    correctAnswer: string | string[];
    explanation?: string;
    points: number;
  }>;
  estimatedDuration: number;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'quiz' | 'resource' | 'tip';
  category: string;
  difficulty: string;
  estimatedTime: number;
  icon: string;
  color: string;
}

interface ExternalResource {
  id: string;
  title: string;
  description: string;
  url: string;
  coverImage: string;
  category: string;
  difficulty: string;
  estimatedTime: number;
  source: string;
  tags: string[];
}

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [externalResources, setExternalResources] = useState<ExternalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAlphabetModal, setShowAlphabetModal] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const router = useRouter();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = tokenUtils.getToken();
        if (!token) {
          router.push('/student-login');
          return;
        }

        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        }

        await loadDashboardData();
      } catch (error) {
        console.error('Authentication error:', error);
        router.push('/student-login');
      }
    };

    checkAuth();
  }, [router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load modules, quizzes, and progress in parallel
      const [modulesData, quizzesData, progressData] = await Promise.all([
        moduleAPI.getModules(),
        quizAPI.getQuizzes(),
        progressAPI.getProgress()
      ]);

      setModules(modulesData.modules || []);
      setQuizzes(quizzesData.quizzes || []);
      setProgress(progressData.progress || []);
      
      // Generate daily recommendations
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const dailyRecommendations = generateDailyRecommendations(
        userData._id || 'default',
        progressData.progress || [],
        modulesData.modules || []
      );
      setRecommendations(dailyRecommendations);
      
      // Generate external resources
      const externalResources = generateExternalResources(userData._id || 'default');
      setExternalResources(externalResources);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleModuleClick = (moduleId: string) => {
    router.push(`/student-dashboard/module/${moduleId}`);
  };

  const handleQuizClick = (quizId: string) => {
    router.push(`/student-dashboard/quiz/${quizId}`);
  };

  const handleExternalResourceClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleAlphabetClick = () => {
    setShowAlphabetModal(true);
  };

  const speakLetter = (letter: string) => {
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.rate = 0.7; // Slower speed for better comprehension
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const speakAlphabet = () => {
    if ('speechSynthesis' in window) {
      setSpeaking(true);
      const alphabet = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z';
      const utterance = new SpeechSynthesisUtterance(alphabet);
      utterance.rate = 0.6; // Even slower for full alphabet
      utterance.pitch = 1.0; // Normal pitch
      utterance.volume = 1.0; // Full volume
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authAPI.logout();
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local data even if API call fails
      tokenUtils.removeToken();
      localStorage.removeItem('user');
      router.push('/');
    }
  };

  const getProgressForModule = (moduleId: string) => {
    return progress.find(p => p.moduleId._id === moduleId);
  };

  const getModuleImage = (module: Module) => {
    // Use the first uploaded photo if available
    if (module.photos && module.photos.length > 0) {
      const photo = module.photos[0];
      // Use the base URL without /api for serving static files
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
      const imageUrl = `${baseUrl}/modules/uploads/${photo.filename}`;
      console.log('Module image URL:', imageUrl, 'for module:', module.title);
      return imageUrl;
    }
    
    console.log('No photos found for module:', module.title, 'photos:', module.photos);
    
    // Fallback to a placeholder based on category
    const categoryColors = {
      'Reading': 'bg-blue-100',
      'Writing': 'bg-green-100', 
      'Grammar': 'bg-purple-100',
      'Vocabulary': 'bg-yellow-100',
      'Comprehension': 'bg-red-100',
      'Phonics': 'bg-pink-100',
      'Literature': 'bg-indigo-100',
      'Creative Writing': 'bg-orange-100'
    };
    
    return categoryColors[module.category as keyof typeof categoryColors] || 'bg-gray-100';
  };

  const getModuleStatus = (moduleId: string) => {
    const moduleProgress = getProgressForModule(moduleId);
    if (!moduleProgress) return 'Start';
    if (moduleProgress.status === 'completed') return 'Completed';
    if (moduleProgress.status === 'in-progress') return 'Continue';
    return 'Start';
  };

  const generateDailyRecommendations = (userId: string, userProgress: Progress[], availableModules: Module[]) => {
    const today = new Date().toDateString();
    const seed = userId + today; // Create unique seed for each user and day
    
    // Simple hash function to generate consistent recommendations
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const recommendations: Recommendation[] = [];
    
    // Get user's weak areas based on progress
    const completedModules = userProgress.filter(p => p.status === 'completed');
    const inProgressModules = userProgress.filter(p => p.status === 'in-progress');
    
    // Recommendation 1: Continue in-progress module
    if (inProgressModules.length > 0) {
      const randomIndex = Math.abs(hash) % inProgressModules.length;
      const module = availableModules.find(m => m._id === inProgressModules[randomIndex].moduleId._id);
      if (module) {
        recommendations.push({
          id: `continue-${module._id}`,
          title: `Continue: ${module.title}`,
          description: `Pick up where you left off in this ${module.category.toLowerCase()} module.`,
          type: 'module',
          category: module.category,
          difficulty: module.difficulty,
          estimatedTime: module.estimatedDuration,
          icon: '📚',
          color: 'bg-blue-100 text-blue-800'
        });
      }
    }
    
    // Recommendation 2: Try a new module in user's preferred category
    const preferredCategories = completedModules.length > 0 
      ? completedModules.map(p => availableModules.find(m => m._id === p.moduleId._id)?.category).filter(Boolean)
      : ['Reading', 'Comprehension'];
    
    const availableNewModules = availableModules.filter(m => 
      !userProgress.some(p => p.moduleId._id === m._id)
    );
    
    if (availableNewModules.length > 0) {
      const preferredCategory = preferredCategories[Math.abs(hash + 1) % preferredCategories.length] || 'Reading';
      const categoryModules = availableNewModules.filter(m => m.category === preferredCategory);
      const module = categoryModules.length > 0 
        ? categoryModules[Math.abs(hash + 2) % categoryModules.length]
        : availableNewModules[Math.abs(hash + 2) % availableNewModules.length];
      
      if (module) {
        recommendations.push({
          id: `new-${module._id}`,
          title: `Try: ${module.title}`,
          description: `Explore this ${module.category.toLowerCase()} module to build your skills.`,
          type: 'module',
          category: module.category,
          difficulty: module.difficulty,
          estimatedTime: module.estimatedDuration,
          icon: '🚀',
          color: 'bg-green-100 text-green-800'
        });
      }
    }
    
    // Recommendation 3: Alphabet Practice (always include)
    recommendations.push({
      id: 'alphabet-practice',
      title: 'Alphabet Practice',
      description: 'Practice the alphabet with audio pronunciation.',
      type: 'alphabet',
      category: 'Phonics',
      difficulty: 'Beginner',
      estimatedTime: 10,
      icon: '🔤',
      color: 'bg-indigo-100 text-indigo-800'
    });
    
    // Recommendation 4: Daily tip based on user's progress
    const tips = [
      {
        title: 'Reading Strategy',
        description: 'Try reading aloud to improve comprehension and fluency.',
        icon: '🎯',
        color: 'bg-purple-100 text-purple-800'
      },
      {
        title: 'Break It Down',
        description: 'Take short breaks every 15 minutes to maintain focus.',
        icon: '⏰',
        color: 'bg-orange-100 text-orange-800'
      },
      {
        title: 'Visual Learning',
        description: 'Use highlighters and notes to organize information.',
        icon: '✏️',
        color: 'bg-pink-100 text-pink-800'
      }
    ];
    
    const tipIndex = Math.abs(hash + 3) % tips.length;
    const tip = tips[tipIndex];
    
    recommendations.push({
      id: `tip-${tipIndex}`,
      title: tip.title,
      description: tip.description,
      type: 'tip',
      category: 'Learning Strategy',
      difficulty: 'Beginner',
      estimatedTime: 5,
      icon: tip.icon,
      color: tip.color
    });
    
    return recommendations;
  };

  const generateExternalResources = (userId: string) => {
    const today = new Date().toDateString();
    const seed = userId + today;
    
    // Simple hash function for consistent daily resources
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    
    const resources: ExternalResource[] = [
      {
        id: '1',
        title: 'Reading Rockets: Phonics and Decoding',
        description: 'Learn phonics strategies to improve reading fluency and decoding skills.',
        url: 'https://www.readingrockets.org/teaching/reading-basics/phonics',
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
        category: 'Phonics',
        difficulty: 'Beginner',
        estimatedTime: 15,
        source: 'Reading Rockets',
        tags: ['phonics', 'decoding', 'reading']
      },
      {
        id: '2',
        title: 'Khan Academy: Reading Comprehension',
        description: 'Interactive lessons on reading comprehension strategies and techniques.',
        url: 'https://www.khanacademy.org/ela/cc-2nd-reading-vocab',
        coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
        category: 'Comprehension',
        difficulty: 'Intermediate',
        estimatedTime: 20,
        source: 'Khan Academy',
        tags: ['comprehension', 'reading', 'strategies']
      },
      {
        id: '3',
        title: 'Dyslexia Help: Visual Learning Techniques',
        description: 'Discover visual learning strategies specifically designed for dyslexic learners.',
        url: 'https://dyslexiahelp.umich.edu/tools/visual-learning',
        coverImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
        category: 'Learning Strategies',
        difficulty: 'Beginner',
        estimatedTime: 10,
        source: 'Dyslexia Help',
        tags: ['visual learning', 'dyslexia', 'strategies']
      },
      {
        id: '4',
        title: 'BBC Bitesize: Grammar and Writing',
        description: 'Fun, interactive grammar lessons with games and quizzes.',
        url: 'https://www.bbc.co.uk/bitesize/subjects/zv48q6f',
        coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop',
        category: 'Grammar',
        difficulty: 'Intermediate',
        estimatedTime: 25,
        source: 'BBC Bitesize',
        tags: ['grammar', 'writing', 'interactive']
      },
      {
        id: '5',
        title: 'Storybird: Creative Writing Prompts',
        description: 'Inspire creativity with beautiful writing prompts and story starters.',
        url: 'https://storybird.com/',
        coverImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop',
        category: 'Creative Writing',
        difficulty: 'Beginner',
        estimatedTime: 30,
        source: 'Storybird',
        tags: ['creative writing', 'storytelling', 'prompts']
      },
      {
        id: '6',
        title: 'Vocabulary.com: Word Learning Games',
        description: 'Expand your vocabulary through fun, adaptive word games.',
        url: 'https://www.vocabulary.com/',
        coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop',
        category: 'Vocabulary',
        difficulty: 'Beginner',
        estimatedTime: 15,
        source: 'Vocabulary.com',
        tags: ['vocabulary', 'games', 'word learning']
      }
    ];
    
    // Select 3 random resources based on the hash
    const selectedResources: ExternalResource[] = [];
    const shuffled = [...resources].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < 3; i++) {
      const index = Math.abs(hash + i) % shuffled.length;
      selectedResources.push(shuffled[index]);
    }
    
    return selectedResources;
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
                <p className="text-[#637588] text-lg">Loading your dashboard...</p>
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
          <div className="gap-1 px-6 flex flex-1 justify-center py-5">
            <StudentNavigationBar />
            <div className="layout-content-container flex flex-col max-w-[960px] flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-4 p-8 bg-red-50 rounded-xl">
                <p className="text-red-600 text-lg font-medium">Oops! Something went wrong</p>
                <p className="text-[#637588] text-center">{error}</p>
                <button
                  onClick={loadDashboardData}
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

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        <div className="gap-1 px-6 flex flex-1 justify-center py-5 relative">
          <StudentNavigationBar />
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">

            
            {/* Welcome Section */}
            <div className="p-6">
              <div className="mb-8">
                <h1 className="text-[#111418] text-3xl font-bold mb-2">
                  Welcome back, {user?.name || 'Student'}! 👋
                </h1>
                <p className="text-[#637588] text-lg">
                  Ready to continue your learning journey? Here's what's waiting for you today.
                </p>
              </div>

              {/* Daily Recommendations */}
              {recommendations.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#4798ea] to-[#3a7bc8] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h2 className="text-[#111418] text-xl font-bold">Today's Recommendations</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec) => (
                      <div 
                        key={rec.id}
                        className="bg-white border border-[#dde0e4] rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                        onClick={() => {
                          if (rec.type === 'module' && rec.id.includes('-')) {
                            const moduleId = rec.id.split('-')[1];
                            handleModuleClick(moduleId);
                          } else if (rec.type === 'alphabet') {
                            handleAlphabetClick();
                          }
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl">{rec.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-[#111418] font-semibold text-sm mb-1">{rec.title}</h3>
                            <p className="text-[#637588] text-xs mb-2">{rec.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.color}`}>
                            {rec.category}
                          </span>
                          <span className="text-[#637588] text-xs">
                            {rec.estimatedTime} min
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* External Learning Resources */}
              {externalResources.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#f59e0b] to-[#d97706] rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </div>
                    <h2 className="text-[#111418] text-xl font-bold">External Learning Resources</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {externalResources.map((resource) => (
                      <div 
                        key={resource.id}
                        className="bg-white border border-[#dde0e4] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        onClick={() => handleExternalResourceClick(resource.url)}
                      >
                        {/* Cover Image */}
                        <div className="w-full h-48 relative overflow-hidden">
                          <img 
                            src={resource.coverImage}
                            alt={resource.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        </div>
                        
                        {/* Content */}
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[#637588] text-xs font-medium">{resource.source}</span>
                            <span className="text-[#637588] text-xs">•</span>
                            <span className="text-[#637588] text-xs">{resource.difficulty}</span>
                          </div>
                          <h3 className="text-[#111418] font-semibold text-sm mb-2 line-clamp-2">{resource.title}</h3>
                          <p className="text-[#637588] text-xs mb-3 line-clamp-2">{resource.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                              {resource.category}
                            </span>
                            <span className="text-[#637588] text-xs">{resource.estimatedTime} min</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assigned Modules */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#10b981] to-[#059669] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <h2 className="text-[#111418] text-xl font-bold">Your Learning Modules</h2>
                </div>
                
                {modules.length > 0 ? (
                  <div className="grid gap-4">
                    {modules.map((module, index) => {
                      const moduleProgress = getProgressForModule(module._id);
                      const moduleImage = getModuleImage(module);
                      const status = getModuleStatus(module._id);
                      
                      return (
                        <div 
                          key={module._id}
                          className="bg-white border border-[#dde0e4] rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer"
                          onClick={() => handleModuleClick(module._id)}
                        >
                          <div className="flex items-center gap-4">
                            {/* Module Image */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                              {module.photos && module.photos.length > 0 ? (
                                <img 
                                  src={moduleImage}
                                  alt={module.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : (
                                <div className={`w-full h-full ${moduleImage} flex items-center justify-center`}>
                                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                    <svg className="w-5 h-5 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Module Content */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[#637588] text-xs font-medium">Module {index + 1}</span>
                                <span className="text-[#637588] text-xs">•</span>
                                <span className="text-[#637588] text-xs">{module.category}</span>
                              </div>
                              <h3 className="text-[#111418] text-lg font-bold mb-2">{module.title}</h3>
                              <p className="text-[#637588] text-sm mb-3 line-clamp-2">{module.description}</p>
                              <div className="flex items-center justify-between">
                                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  status === 'Completed' 
                                    ? 'bg-green-100 text-green-800' 
                                    : status === 'Continue'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {status}
                                </button>
                                <span className="text-[#637588] text-xs">{module.estimatedDuration} min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white border border-[#dde0e4] rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-[#111418] text-lg font-semibold mb-2">No modules assigned yet</h3>
                    <p className="text-[#637588] text-sm">Your teacher will assign modules for you to work on.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>

      {/* Alphabet Modal */}
      {showAlphabetModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#111418]">Alphabet Practice</h2>
              <button
                onClick={() => setShowAlphabetModal(false)}
                className="text-[#637588] hover:text-[#111418] transition-colors"
                aria-label="Close alphabet modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Full Alphabet Button */}
            <div className="mb-6">
              <button
                onClick={speakAlphabet}
                disabled={speaking}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
              >
                {speaking ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
                <span className="font-semibold">Listen to Full Alphabet</span>
              </button>
            </div>

            {/* Alphabet Grid */}
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map((letter) => (
                <button
                  key={letter}
                  onClick={() => speakLetter(letter)}
                  disabled={speaking}
                  className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 disabled:opacity-50 group"
                >
                  <div className="text-3xl font-bold text-[#111418] mb-2 group-hover:scale-110 transition-transform">
                    {letter}
                  </div>
                  <div className="text-xs text-[#637588] font-medium">
                    {letter.toLowerCase()}
                  </div>
                  <div className="mt-2">
                    <svg className="w-4 h-4 text-[#637588] group-hover:text-[#111418]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-[#111418] mb-2">How to use:</h3>
              <ul className="text-sm text-[#637588] space-y-1">
                <li>• Click any letter to hear its pronunciation</li>
                <li>• Click "Listen to Full Alphabet" to hear all letters</li>
                <li>• Practice saying each letter after hearing it</li>
                <li>• Great for building phonics and pronunciation skills!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}