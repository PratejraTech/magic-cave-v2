import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getAdelaideDate } from '../../../lib/date';

interface DecemberBubbleProps {
  forceUnlock: boolean;
}

export function DecemberBubble({ forceUnlock }: DecemberBubbleProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if we should show the bubble
    const checkDate = () => {
      if (forceUnlock || isDismissed) {
        setIsVisible(false);
        return;
      }

      const adelaideDate = getAdelaideDate();
      const currentMonth = adelaideDate.getMonth(); // 0-11, November is 10
      const currentDay = adelaideDate.getDate();

      // Show if before December 1st (month < 11 or month === 11 and day < 1)
      const isBeforeDecember = currentMonth < 11 || (currentMonth === 11 && currentDay < 1);
      
      setIsVisible(isBeforeDecember);
    };

    checkDate();
    // Check every minute to update if date changes
    const interval = setInterval(checkDate, 60000);
    return () => clearInterval(interval);
  }, [forceUnlock, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Store dismissal in localStorage to persist across sessions
    localStorage.setItem('december-bubble-dismissed', 'true');
  };

  useEffect(() => {
    // Check if user previously dismissed
    const dismissed = localStorage.getItem('december-bubble-dismissed') === 'true';
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
      >
        <div className="pointer-events-auto relative">
          <div className="flex flex-col items-center gap-4">
            {/* Love heart icon */}
            <img
              src="/assets/love-heart.svg"
              alt="Love heart"
              className="w-24 h-auto drop-shadow-[0_0_30px_rgba(255,111,177,0.6)] animate-pulse"
            />
            
            {/* Bubble with message */}
            <div className="relative bg-white/95 backdrop-blur-sm rounded-lg px-6 py-4 sm:px-8 sm:py-5 shadow-lg border-4 border-pink-300">
              <p className="text-base sm:text-lg md:text-xl font-semibold text-pink-600 text-center">
                It&apos;s Almost December!
              </p>
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-pink-300 hover:bg-pink-400 text-white font-bold text-sm flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                ×
              </button>
              
              {/* Pulse animation */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                animate={{
                  boxShadow: [
                    '0 0 0 0 rgba(255, 105, 180, 0.4)',
                    '0 0 0 8px rgba(255, 105, 180, 0)',
                    '0 0 0 0 rgba(255, 105, 180, 0)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

