import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play } from 'lucide-react';

export interface VideoOption {
  id: string;
  url: string;
  title: string;
  thumbnail?: string;
}

interface VideoSelectionModalProps {
  isOpen: boolean;
  videos: VideoOption[];
  onSelectVideo: (video: VideoOption) => void;
  onClose: () => void;
}

/**
 * Extract video ID from YouTube URL for thumbnail generation
 */
function getVideoId(url: string): string | null {
  if (!url) return null;
  
  // Handle different YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^"&?\/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^"&?\/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([^"&?\/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^"&?\/\s]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/embed\/([^"&?\/\s]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

/**
 * Generate YouTube thumbnail URL from video ID
 */
function getThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export function VideoSelectionModal({
  isOpen,
  videos,
  onSelectVideo,
  onClose,
}: VideoSelectionModalProps) {
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-selection-title"
        >
          <motion.div
            className="relative bg-white/95 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] w-full max-w-4xl max-h-[90vh] flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 id="video-selection-title" className="text-xl font-headline text-gray-800">
                Choose a Video to Watch
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
                aria-label="Close video selection"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video List */}
            <div className="overflow-y-auto flex-1 p-6 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videos.map((video, index) => {
                  const videoId = getVideoId(video.url);
                  const thumbnail = video.thumbnail || (videoId ? getThumbnailUrl(videoId) : '');

                  return (
                    <motion.button
                      key={video.id}
                      onClick={() => {
                        onSelectVideo(video);
                        onClose();
                      }}
                      className="relative group rounded-xl overflow-hidden border-2 border-pink-200 hover:border-pink-400 transition-all bg-white shadow-md hover:shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      aria-label={`Select video: ${video.title}`}
                    >
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-pink-100 to-purple-100">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Play className="w-12 h-12 text-pink-400" />
                          </div>
                        )}

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <Play className="w-8 h-8 text-pink-500 ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {/* Video Info */}
                      <div className="p-4 bg-white">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1 group-hover:text-pink-600 transition-colors">
                          {video.title}
                        </h3>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50 text-center">
              <p className="text-sm text-gray-600">
                Click on a video to start watching
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

