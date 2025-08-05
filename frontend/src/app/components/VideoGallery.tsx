"use client";

import React, { useState } from 'react';
import VideoModal from './VideoModal';

interface Video {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
}

interface VideoGalleryProps {
  videos: Video[];
  moduleId?: string;
  studentId?: string;
  className?: string;
}

const VideoGallery: React.FC<VideoGalleryProps> = ({ 
  videos, 
  moduleId, 
  studentId, 
  className = "" 
}) => {
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  if (videos.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="w-16 h-16 bg-[#f0f2f4] rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-[#637588]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-[#637588] text-lg">No videos available</p>
        <p className="text-[#637588] text-sm">Videos will appear here when uploaded</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <div
            key={index}
            className="bg-white rounded-xl border border-[#dde0e4] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleVideoClick(video)}
          >
            {/* Video Thumbnail */}
            <div className="aspect-video bg-[#f0f2f4] relative group">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white group-hover:bg-black/70 transition-colors">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              
              {/* Video Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {(video.size / (1024 * 1024)).toFixed(1)} MB
              </div>
            </div>
            
            {/* Video Info */}
            <div className="p-4">
              <h4 className="text-[#111418] font-medium mb-2 line-clamp-2">
                {video.originalName}
              </h4>
              <div className="flex items-center justify-between text-xs text-[#637588]">
                <span>{video.mimetype}</span>
                <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <VideoModal
          isOpen={isModalOpen}
          onClose={closeModal}
          videoSrc={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/modules/uploads/${selectedVideo.filename}`}
          videoTitle={selectedVideo.originalName}
          videoId={`${moduleId}-${selectedVideo.filename}`}
          moduleId={moduleId}
          studentId={studentId}
        />
      )}
    </div>
  );
};

export default VideoGallery; 