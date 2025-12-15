/**
 * WalkingElf - Animated elf character walking across the scene
 * Micro UI component with idle and walking animations
 */

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface WalkingElfProps {
  startX?: number;
  endX?: number;
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right';
}

export function WalkingElf({
  startX = -10,
  endX = 110,
  duration = 20,
  delay = 0,
  direction = 'right'
}: WalkingElfProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!isVisible) return null;

  return (
    <motion.div
      className="absolute bottom-8 pointer-events-none z-20"
      initial={{ x: `${startX}%` }}
      animate={{ x: `${endX}%` }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        ease: 'linear'
      }}
      style={{
        transform: direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)'
      }}
    >
      {/* Elf body */}
      <div className="relative w-12 h-16">
        {/* Head */}
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 bg-gradient-to-br from-pink-200 to-pink-300 rounded-full"
          animate={{
            y: [0, -1, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Hat */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-600" />
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-2 bg-white rounded-full" />
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />

          {/* Eyes */}
          <div className="absolute top-2 left-1 w-1 h-1 bg-gray-800 rounded-full" />
          <div className="absolute top-2 right-1 w-1 h-1 bg-gray-800 rounded-full" />

          {/* Nose */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-0.5 h-1 bg-pink-400 rounded-full" />

          {/* Smile */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3 h-1 border-b-2 border-gray-800 rounded-b-full" />
        </motion.div>

        {/* Body */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-5 h-6 bg-gradient-to-br from-green-600 to-green-700 rounded-lg">
          {/* Belt */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-yellow-600">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-yellow-400 rounded-sm border border-yellow-700" />
          </div>
        </div>

        {/* Arms */}
        <motion.div
          className="absolute top-7 -left-1 w-1 h-4 bg-green-700 rounded-full origin-top"
          animate={{
            rotate: [0, 15, 0, -15, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-7 -right-1 w-1 h-4 bg-green-700 rounded-full origin-top"
          animate={{
            rotate: [0, -15, 0, 15, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Legs */}
        <motion.div
          className="absolute top-12 left-1 w-1.5 h-4 bg-green-800 rounded-full origin-top"
          animate={{
            rotate: [0, -20, 0, 20, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-12 right-1 w-1.5 h-4 bg-green-800 rounded-full origin-top"
          animate={{
            rotate: [0, 20, 0, -20, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Gift bag (optional) */}
        <motion.div
          className="absolute top-8 -right-2 w-3 h-3 bg-red-500 rounded-sm"
          animate={{
            y: [0, -1, 0]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-yellow-400" />
        </motion.div>
      </div>
    </motion.div>
  );
}
