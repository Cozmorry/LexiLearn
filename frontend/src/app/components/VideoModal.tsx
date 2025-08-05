"use client";

import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';
import VideoProgress from './VideoProgress';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoSrc: string;
  videoTitle?: string;
  videoId?: string;
  moduleId?: string;
  studentId?: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoSrc,
  videoTitle,
  videoId,
  moduleId,
  studentId,
  onProgress,
  onComplete
}) => {
  console.log('VideoModal: Props received:', { videoId, moduleId, studentId, videoTitle });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);

  if (!isOpen) return null;

  const handleProgressUpdate = (progress: number) => {
    console.log('VideoModal: Received progress:', progress);
    setCurrentProgress(progress);
    console.log('VideoModal: Updated currentProgress to:', progress);
    if (onProgress) {
      onProgress(progress);
    }
  };

  const handleVideoComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-6xl max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
          aria-label="Close video"
          title="Close video"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Video Player */}
        <div className="w-full h-full">
          <VideoPlayer
            src={videoSrc}
            title={videoTitle}
            onProgress={handleProgressUpdate}
            onComplete={handleVideoComplete}
            className="w-full h-full"
            showControls={true}
          />
        </div>

        {/* Video Progress (if videoId, moduleId, and studentId are provided) */}
        {videoId && moduleId && studentId && (
          <div className="absolute top-4 left-4 z-10">
            {console.log('VideoModal: Rendering VideoProgress with externalProgress:', currentProgress)}
            <VideoProgress
              videoId={videoId}
              moduleId={moduleId}
              studentId={studentId}
              onProgressUpdate={handleProgressUpdate}
              onComplete={handleVideoComplete}
              externalProgress={currentProgress}
              className="bg-white/90 backdrop-blur-sm"
            />
          </div>
        )}

        {/* Video Info */}
        {videoTitle && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/50 rounded-lg p-4 text-white">
            <h3 className="text-lg font-semibold">{videoTitle}</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModal; 