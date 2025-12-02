import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Heart } from 'lucide-react';

interface SubstackLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChat?: () => void;
}

const SUBSTACK_LETTER_URL =
  'https://open.substack.com/pub/justareallyannoyingperson/p/dear-my-angel-my-harper?r=6u4l44&selection=13cec3c7-02d0-4fe9-8a9b-00838cbf57b2&utm_campaign=post-share-selection&utm_medium=web&aspectRatio=square&textColor=%23ffffff&bgImage=true';

export function SubstackLetterModal({ isOpen, onClose, onStartChat }: SubstackLetterModalProps) {
  const handleOpenLetter = () => {
    window.open(SUBSTACK_LETTER_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative bg-white/95 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)] w-full max-w-2xl flex flex-col"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="substack-letter-title"
          >
            {/* Start Chat Button - Top Left */}
            {onStartChat && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartChat();
                }}
                className="absolute top-4 left-4 z-10 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold text-sm shadow-lg hover:scale-105 transition-all hover:shadow-xl"
                aria-label="Start chat with Daddy"
              >
                +Start Chat
              </button>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
              <h2 id="substack-letter-title" className="text-xl font-headline text-gray-800">
                Daddy's Letter to Harper
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-600 hover:text-gray-800"
                aria-label="Close letter"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Card */}
            <div className="flex-1 p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center shadow-lg">
                <Heart className="w-10 h-10 text-white" fill="currentColor" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-gray-800">
                  A Special Letter from Daddy
                </h3>
                <p className="text-gray-600 max-w-md">
                  Daddy wrote you a beautiful letter. Click the button below to read it in a new window.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={handleOpenLetter}
                  className="flex-1 px-6 py-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-all hover:shadow-xl flex items-center justify-center gap-2"
                  aria-label="Open Daddy's letter in new tab"
                >
                  <span>Read Letter</span>
                  <ExternalLink size={20} />
                </button>
                
                {onStartChat && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartChat();
                    }}
                    className="flex-1 px-6 py-4 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold text-lg shadow-lg hover:scale-105 transition-all hover:shadow-xl"
                    aria-label="Start chat with Daddy"
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

