"use client";

import React, { useState, useEffect, useCallback } from 'react';

interface VideoProgressProps {
  videoId: string;
  moduleId: string;
  studentId: string;
  onProgressUpdate?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
  externalProgress?: number;
}

const VideoProgress: React.FC<VideoProgressProps> = ({
  videoId,
  moduleId,
  studentId,
  onProgressUpdate,
  onComplete,
  className = "",
  externalProgress
}) => {
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const updateProgress = useCallback((newProgress: number) => {
    console.log('VideoProgress: updateProgress called with:', newProgress, 'current progress:', progress);
    // Only update if progress has actually changed significantly
    if (Math.abs(newProgress - progress) >= 0.5) {
      console.log('VideoProgress: Updating progress from', progress, 'to', newProgress);
      setProgress(newProgress);
      setIsTracking(true);
      
      // Save to localStorage
      const progressKey = `video-progress-${videoId}-${studentId}`;
      localStorage.setItem(progressKey, newProgress.toString());
      console.log('VideoProgress: Saved progress to localStorage:', progressKey, newProgress);
      
      // Call parent callback
      if (onProgressUpdate) {
        onProgressUpdate(newProgress);
      }

      // Check if video is completed (exactly 100% watched)
      if (newProgress >= 100 && !isCompleted) {
        console.log('VideoProgress: Video reached 100%, marking as completed');
        markAsCompleted();
      }

      // Auto-save to backend if progress is significant (every 10%)
      if (newProgress % 10 < 1 && newProgress > 0) {
        saveProgressToBackend(newProgress);
      }

      // Reset tracking indicator after a delay
      setTimeout(() => setIsTracking(false), 2000);
    } else {
      console.log('VideoProgress: Progress change too small, not updating');
    }
  }, [progress, videoId, studentId, onProgressUpdate, isCompleted]);

  const markAsCompleted = () => {
    console.log('VideoProgress: markAsCompleted called');
    setIsCompleted(true);
    setProgress(100);
    const completionKey = `video-completed-${videoId}-${studentId}`;
    localStorage.setItem(completionKey, 'true');
    console.log('VideoProgress: Marked as completed:', completionKey);
    
    if (onComplete) {
      console.log('VideoProgress: Calling onComplete callback');
      onComplete();
    }
  };

  const saveProgressToBackend = async (progressValue: number) => {
    try {
      // This would integrate with your progress API
      // await progressAPI.updateVideoProgress({
      //   studentId,
      //   moduleId,
      //   videoId,
      //   progress: progressValue
      // });
      console.log('Video progress saved:', progressValue);
    } catch (error) {
      console.error('Error saving video progress:', error);
    }
  };

  useEffect(() => {
    // Load existing progress from localStorage
    const progressKey = `video-progress-${videoId}-${studentId}`;
    const completionKey = `video-completed-${videoId}-${studentId}`;
    
    console.log('VideoProgress: Loading progress with keys:', { progressKey, completionKey });
    
    const savedProgress = localStorage.getItem(progressKey);
    const savedCompletion = localStorage.getItem(completionKey);
    
    console.log('VideoProgress: Saved progress:', savedProgress, 'saved completion:', savedCompletion);
    
    if (savedProgress) {
      const progressValue = parseFloat(savedProgress);
      setProgress(progressValue);
      
      // If progress is 100% or completion is saved, mark as completed
      if (progressValue >= 100 || savedCompletion === 'true') {
        setIsCompleted(true);
        setProgress(100);
      }
    }
    
    if (savedCompletion === 'true') {
      setIsCompleted(true);
      setProgress(100);
    }
  }, [videoId, studentId]);

  // Handle external progress updates
  useEffect(() => {
    if (externalProgress !== undefined) {
      console.log('VideoProgress: Received external progress:', externalProgress);
      updateProgress(externalProgress);
    }
  }, [externalProgress, updateProgress]);

  const getProgressColor = (progress: number) => {
    if (progress >= 90 || isCompleted) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const getProgressLabel = (progress: number) => {
    if (isCompleted) return 'Completed';
    if (progress >= 95) return 'Almost Complete';
    if (progress >= 70) return 'Good Progress';
    if (progress >= 50) return 'Halfway There';
    if (progress >= 25) return 'Getting Started';
    return 'Just Started';
  };

  return (
    <div className={`bg-white rounded-lg border border-[#dde0e4] p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[#111418] font-medium">Video Progress</h4>
        <span className="text-sm text-[#637588]">{Math.round(progress)}%</span>
      </div>
      
      <div className="w-full bg-[#f0f2f4] rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-[#637588]">
        <span>{getProgressLabel(progress)}</span>
        <span>{isTracking ? 'Tracking...' : isCompleted ? 'Completed' : 'Saved'}</span>
      </div>
      
      {isCompleted && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Video completed - Redirecting...</span>
          </div>
        </div>
      )}
      
      {!isCompleted && progress > 0 && progress < 100 && (
        <div className="mt-3">
          <button
            onClick={markAsCompleted}
            className="w-full px-3 py-2 bg-[#4798ea] text-white text-sm rounded-lg hover:bg-[#3a7bc8] transition-colors"
          >
            Mark as Complete
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoProgress; 