const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  
  return data;
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Authentication API calls
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Login with email and password
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  // Student login with secret code
  studentLogin: async (secretCode, name = '') => {
    const response = await fetch(`${API_BASE_URL}/auth/student-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ secretCode, name }),
    });
    return handleResponse(response);
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Logout (client-side token removal)
  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Refresh token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// User management API calls
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update user profile
  updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // Update user settings
  updateSettings: async (settingsData) => {
    const response = await fetch(`${API_BASE_URL}/users/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settingsData),
    });
    return handleResponse(response);
  },

  // Change user password
  changePassword: async (currentPassword, newPassword) => {
    const response = await fetch(`${API_BASE_URL}/users/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return handleResponse(response);
  },

  // Get teacher's students
  getStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/users/students`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get my students (for teachers)
  getMyStudents: async () => {
    const response = await fetch(`${API_BASE_URL}/users/students`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add new student
  addStudent: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}/users/students`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Get specific student
  getStudent: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/users/students/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update student
  updateStudent: async (studentId, studentData) => {
    const response = await fetch(`${API_BASE_URL}/users/students/${studentId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  // Delete student (soft delete)
  deleteStudent: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/users/students/${studentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Module management API calls
export const moduleAPI = {
  // Get all modules
  getModules: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/modules?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific module
  getModule: async (moduleId) => {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create new module
  createModule: async (moduleData) => {
    const response = await fetch(`${API_BASE_URL}/modules`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(moduleData),
    });
    return handleResponse(response);
  },

  // Update module
  updateModule: async (moduleId, moduleData) => {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(moduleData),
    });
    return handleResponse(response);
  },

  // Delete module
  deleteModule: async (moduleId) => {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Assign module to students
  assignModule: async (moduleId, studentIds) => {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/assign`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentIds }),
    });
    return handleResponse(response);
  },

  // Remove module assignment
  removeModuleAssignment: async (moduleId, studentIds) => {
    const response = await fetch(`${API_BASE_URL}/modules/${moduleId}/assign`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ studentIds }),
    });
    return handleResponse(response);
  },
};

// Progress tracking API calls
export const progressAPI = {
  // Get user's progress
  getProgress: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/progress?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific progress record
  getProgressRecord: async (progressId) => {
    const response = await fetch(`${API_BASE_URL}/progress/${progressId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create or update progress
  updateProgress: async (progressData) => {
    const response = await fetch(`${API_BASE_URL}/progress`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
    return handleResponse(response);
  },

  // Update progress record
  updateProgressRecord: async (progressId, progressData) => {
    const response = await fetch(`${API_BASE_URL}/progress/${progressId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(progressData),
    });
    return handleResponse(response);
  },

  // Get student progress summary (teachers only)
  getStudentProgress: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/progress/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get module statistics (teachers only)
  getModuleStats: async (moduleId) => {
    const response = await fetch(`${API_BASE_URL}/progress/module/${moduleId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get student summary (for teacher dashboard/reports)
  getStudentSummary: async () => {
    const response = await fetch(`${API_BASE_URL}/progress/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Add exercise result
  addExerciseResult: async (progressId, exerciseData) => {
    const response = await fetch(`${API_BASE_URL}/progress/${progressId}/exercise`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(exerciseData),
    });
    return handleResponse(response);
  },
};

// Quiz API calls
export const quizAPI = {
  // Get available quizzes
  getQuizzes: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/quizzes?${params}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific quiz
  getQuiz: async (quizId) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Start quiz
  startQuiz: async (quizId) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Submit quiz
  submitQuiz: async (quizId, answers, timeSpent) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ answers, timeSpent }),
    });
    return handleResponse(response);
  },

  // Get quiz results
  getQuizResults: async (quizId) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/results`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get student's quiz results (teachers only)
  getStudentQuizResults: async (studentId) => {
    const response = await fetch(`${API_BASE_URL}/quizzes/student/${studentId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Health check
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};

// Token management utilities
export const tokenUtils = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
}; 