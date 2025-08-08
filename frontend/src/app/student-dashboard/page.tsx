
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
  // Optional when the progress record is for a quiz instead of a module
  quizId?: string | { _id: string };
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

export default function StudentDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
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
      
      // Generate recommendations strictly from quiz performance
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      const dailyRecommendations = generateDailyRecommendations(
        userData._id || 'default',
        progressData.progress || [],
        modulesData.modules || [],
        quizzesData.quizzes || []
      );
      setRecommendations(dailyRecommendations);
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
    return progress.find(p => p.moduleId && p.moduleId._id === moduleId);
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

  const generateDailyRecommendations = (
    userId: string,
    userProgress: Progress[],
    availableModules: Module[],
    availableQuizzes: Quiz[]
  ) => {
    // Filter to quiz progress entries only
    const quizProgress = (userProgress || []).filter((p) => p.quizId);

    const getQuizId = (p: Progress) => {
      if (!p.quizId) return undefined;
      return typeof p.quizId === 'string' ? p.quizId : p.quizId._id;
    };

    const recommendations: Recommendation[] = [];

    // If no quiz performance yet, provide starter recommendations
    if (quizProgress.length === 0) {
      // Recommend first available modules
      const starterModules = availableModules.slice(0, 2);
      starterModules.forEach((module) => {
        recommendations.push({
          id: `module-${module._id}`,
          title: `Start Learning: ${module.title}`,
          description: `Begin your learning journey with this ${module.category.toLowerCase()} module.`,
          type: 'module',
          category: module.category,
          difficulty: module.difficulty,
          estimatedTime: module.estimatedDuration,
          icon: '🚀',
          color: 'bg-green-100 text-green-800',
        });
      });

      // Recommend first available quiz
      if (availableQuizzes.length > 0) {
        const firstQuiz = availableQuizzes[0];
        recommendations.push({
          id: `quiz-${firstQuiz._id}`,
          title: `Take Your First Quiz: ${firstQuiz.title}`,
          description: `Test your knowledge with this ${firstQuiz.category.toLowerCase()} quiz.`,
          type: 'quiz',
          category: firstQuiz.category,
          difficulty: firstQuiz.difficulty,
          estimatedTime: firstQuiz.estimatedDuration,
          icon: '🧪',
          color: 'bg-blue-100 text-blue-800',
        });
      }

      return recommendations;
    }

    // Map quiz progress to quiz metadata (category, difficulty)
    const progressWithQuizMeta = quizProgress
      .map((p) => {
        const qid = getQuizId(p);
        const quiz = availableQuizzes.find((q) => q._id === qid);
        if (!qid || !quiz) return null;
        return {
          progress: p,
          quiz,
        };
      })
      .filter(Boolean) as { progress: Progress; quiz: Quiz }[];

    // Compute average score by category
    const categoryScores: Record<string, { total: number; count: number; recentScores: number[] }> = {};
    progressWithQuizMeta.forEach(({ progress, quiz }) => {
      const category = quiz.category || 'General';
      if (!categoryScores[category]) {
        categoryScores[category] = { total: 0, count: 0, recentScores: [] };
      }
      categoryScores[category].total += progress.score || 0;
      categoryScores[category].count += 1;
      categoryScores[category].recentScores.push(progress.score || 0);
    });

    const categoriesByWeakness = Object.entries(categoryScores)
      .map(([category, { total, count, recentScores }]) => ({ 
        category, 
        avg: total / Math.max(count, 1),
        recentAvg: recentScores.slice(-3).reduce((sum, score) => sum + score, 0) / Math.max(recentScores.slice(-3).length, 1)
      }))
      .sort((a, b) => a.recentAvg - b.recentAvg);

    // 1) Recommend retaking quizzes with low scores (< 70)
    const lowScoreAttempts = progressWithQuizMeta
      .filter(({ progress }) => (progress.score || 0) < 70)
      .slice(0, 2);
    lowScoreAttempts.forEach(({ quiz }) => {
      recommendations.push({
        id: `quiz-${quiz._id}`,
        title: `Retake: ${quiz.title}`,
        description: `Improve your score in ${quiz.category.toLowerCase()}. Your last score was below 70%.`,
        type: 'quiz',
        category: quiz.category,
        difficulty: quiz.difficulty,
        estimatedTime: quiz.estimatedDuration,
        icon: '🔁',
        color: 'bg-red-100 text-red-800',
      });
    });

    // 2) For weakest categories, recommend a related module to practice
    const weakestCategories = categoriesByWeakness.slice(0, 2).map((c) => c.category);
    weakestCategories.forEach((weakCat) => {
      const candidateModules = availableModules.filter((m) => m.category === weakCat);
      if (candidateModules.length > 0) {
        const module = candidateModules[0];
        const avgScore = categoryScores[weakCat]?.avg || 0;
        recommendations.push({
          id: `module-${module._id}`,
          title: `Practice Module: ${module.title}`,
          description: `Reinforce ${module.category.toLowerCase()} concepts. Your average score: ${Math.round(avgScore)}%.`,
          type: 'module',
          category: module.category,
          difficulty: module.difficulty,
          estimatedTime: module.estimatedDuration,
          icon: '📘',
          color: 'bg-orange-100 text-orange-800',
        });
      }
    });

    // 3) Suggest an easier quiz in the weakest category (if available)
    weakestCategories.forEach((weakCat) => {
      const quizzesInCategory = availableQuizzes.filter((q) => q.category === weakCat);
      const takenQuizIds = new Set(progressWithQuizMeta.map(({ quiz }) => quiz._id));
      const untakenQuizzes = quizzesInCategory.filter(q => !takenQuizIds.has(q._id));
      
      if (untakenQuizzes.length > 0) {
        const quiz = untakenQuizzes[0];
        recommendations.push({
          id: `quiz-${quiz._id}`,
          title: `Try Another Quiz: ${quiz.title}`,
          description: `Focus on ${quiz.category.toLowerCase()} with another practice quiz.`,
          type: 'quiz',
          category: quiz.category,
          difficulty: quiz.difficulty,
          estimatedTime: quiz.estimatedDuration,
          icon: '🧪',
          color: 'bg-yellow-100 text-yellow-800',
        });
      }
    });

    // 4) If user is doing well, suggest advanced content
    const strongCategories = categoriesByWeakness
      .filter(c => c.recentAvg >= 80)
      .slice(0, 1);
    
    strongCategories.forEach((strongCat) => {
      const advancedModules = availableModules.filter(m => 
        m.category === strongCat.category && 
        m.difficulty === 'Advanced'
      );
      if (advancedModules.length > 0) {
        const module = advancedModules[0];
        recommendations.push({
          id: `module-${module._id}`,
          title: `Advanced Challenge: ${module.title}`,
          description: `You're excelling in ${module.category.toLowerCase()}! Try this advanced module.`,
          type: 'module',
          category: module.category,
          difficulty: module.difficulty,
          estimatedTime: module.estimatedDuration,
          icon: '⭐',
          color: 'bg-purple-100 text-purple-800',
        });
      }
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

              {/* Performance Summary */}
              <div className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Quizzes Taken */}
                  <div className="bg-white border border-[#dde0e4] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[#637588] text-xs">Quizzes Taken</p>
                        <p className="text-[#111418] text-lg font-bold">
                          {(() => {
                            // Count standalone quizzes
                            const standaloneQuizzes = (progress || []).filter(p => p.quizId).length;
                            // Count quizzes within completed modules (estimate 1 quiz per completed module)
                            const moduleQuizzes = (progress || []).filter(p => p.moduleId && p.status === 'completed').length;
                            return standaloneQuizzes + moduleQuizzes;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="bg-white border border-[#dde0e4] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[#637588] text-xs">Average Score</p>
                        <p className="text-[#111418] text-lg font-bold">
                          {(() => {
                            // Get standalone quiz scores
                            const standaloneQuizProgress = (progress || []).filter(p => p.quizId);
                            const standaloneScores = standaloneQuizProgress.map(p => p.score || 0);
                            
                            // Get module scores (completed modules likely have good scores)
                            const completedModules = (progress || []).filter(p => p.moduleId && p.status === 'completed');
                            const moduleScores = completedModules.map(p => p.score || 100); // Assume good scores for completed modules
                            
                            // Combine all scores
                            const allScores = [...standaloneScores, ...moduleScores];
                            
                            if (allScores.length === 0) return 'N/A';
                            const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
                            return `${Math.round(avgScore)}%`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Modules Completed */}
                  <div className="bg-white border border-[#dde0e4] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-[#637588] text-xs">Modules Completed</p>
                        <p className="text-[#111418] text-lg font-bold">
                          {(progress || []).filter(p => p.moduleId && p.status === 'completed').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance-Based Recommendations */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#4798ea] to-[#3a7bc8] rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-[#111418] text-xl font-bold">Smart Recommendations</h2>
                    <p className="text-[#637588] text-sm">Based on your performance and learning patterns</p>
                  </div>
                </div>
                
                {recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.map((rec) => (
                      <div 
                        key={rec.id}
                        className="bg-white border border-[#dde0e4] rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                        onClick={() => {
                          if (rec.type === 'module' && rec.id.includes('-')) {
                            const moduleId = rec.id.split('-').pop() as string;
                            handleModuleClick(moduleId);
                          } else if (rec.type === 'quiz' && rec.id.includes('-')) {
                            const quizId = rec.id.split('-').pop() as string;
                            handleQuizClick(quizId);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="text-2xl group-hover:scale-110 transition-transform">{rec.icon}</div>
                          <div className="flex-1">
                            <h3 className="text-[#111418] font-semibold text-sm mb-1">{rec.title}</h3>
                            <p className="text-[#637588] text-xs mb-2">{rec.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${rec.color}`}>
                            {rec.category}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#637588] text-xs">
                              {rec.estimatedTime} min
                            </span>
                            <span className="text-[#637588] text-xs">
                              {rec.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-[#dde0e4] rounded-xl p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#4798ea]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-[#111418] text-lg font-semibold mb-2">No recommendations yet</h3>
                    <p className="text-[#637588] text-sm">Complete some quizzes to get personalized recommendations!</p>
                  </div>
                )}
              </div>

              {/* External Learning Resources removed per requirement */}

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