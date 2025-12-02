import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAdelaideDate } from '../lib/date';

/**
 * Countdown timer component showing time until next tile opens
 * Displays an animated elf with speech bubble showing countdown
 * Fades in/out every 10 seconds while time continues ticking
 */
export function CountdownElf() {
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const calculateTimeUntilNext = () => {
      const adelaideTime = getAdelaideDate();
      
      // Get next midnight in Adelaide time (00:00 UTC+1030)
      const nextMidnight = new Date(adelaideTime);
      nextMidnight.setHours(0, 0, 0, 0);
      nextMidnight.setDate(nextMidnight.getDate() + 1); // Set to tomorrow's midnight
      
      // Calculate difference in milliseconds
      const diff = nextMidnight.getTime() - adelaideTime.getTime();
      
      if (diff <= 0) {
        setTimeUntilNext('00:00:00');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeUntilNext(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    // Calculate immediately
    calculateTimeUntilNext();
    
    // Update every second
    const interval = setInterval(calculateTimeUntilNext, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Fade in/out every 10 seconds
  useEffect(() => {
    const fadeInterval = setInterval(() => {
      setIsVisible((prev) => !prev);
    }, 10000); // 10 seconds

    return () => clearInterval(fadeInterval);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-4 left-4 z-[60] flex items-start gap-2 pointer-events-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Elf */}
          <motion.div
            className="relative"
            animate={{
              y: [0, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {/* Simple elf SVG */}
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              className="drop-shadow-lg"
            >
              {/* Elf body (green) */}
              <ellipse cx="24" cy="32" rx="12" ry="14" fill="#22c55e" />
              {/* Elf head */}
              <circle cx="24" cy="16" r="10" fill="#fbbf24" />
              {/* Hat (red) */}
              <path
                d="M 14 12 L 24 6 L 34 12 L 32 8 L 24 4 L 16 8 Z"
                fill="#ef4444"
              />
              {/* Hat tip (white) */}
              <circle cx="24" cy="6" r="2" fill="#ffffff" />
              {/* Eyes */}
              <circle cx="20" cy="14" r="1.5" fill="#000" />
              <circle cx="28" cy="14" r="1.5" fill="#000" />
              {/* Smile */}
              <path
                d="M 18 18 Q 24 22 30 18"
                stroke="#000"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* Speech Bubble */}
          <motion.div
            className="relative bg-white rounded-lg px-3 py-2 shadow-lg border-2 border-red-300"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Speech bubble tail */}
            <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-red-300 border-b-8 border-b-transparent" />
            <div className="absolute -left-1 top-4 w-0 h-0 border-t-7 border-t-transparent border-r-7 border-r-white border-b-7 border-b-transparent" />
            
            {/* Countdown text */}
            <div className="text-xs font-bold text-gray-800">
              <div className="text-[10px] text-gray-600 mb-0.5">Next tile in:</div>
              <div className="text-sm font-mono text-red-600">{timeUntilNext}</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

