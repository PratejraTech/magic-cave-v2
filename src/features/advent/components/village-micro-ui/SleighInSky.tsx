/**
 * SleighInSky - Santa's sleigh flying across the sky
 * Micro UI component with reindeer and trail
 */

import { motion } from 'framer-motion';

interface SleighInSkyProps {
  duration?: number;
  delay?: number;
}

export function SleighInSky({ duration = 30, delay = 0 }: SleighInSkyProps) {
  return (
    <motion.div
      className="absolute top-[15%] left-0 pointer-events-none z-30"
      initial={{ x: '-200px' }}
      animate={{ x: 'calc(100vw + 200px)' }}
      transition={{
        duration,
        repeat: Infinity,
        repeatDelay: 20,
        delay,
        ease: 'linear'
      }}
    >
      <div className="relative w-64 h-32">
        {/* Reindeer (3 visible) */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${i * 40}px`,
              top: '20px'
            }}
            animate={{
              y: [0, -8, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1
            }}
          >
            {/* Reindeer body */}
            <div className="w-6 h-4 bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg relative">
              {/* Head */}
              <div className="absolute -left-2 top-0 w-3 h-3 bg-amber-800 rounded-full">
                {/* Antlers */}
                <div className="absolute -top-2 left-0 w-0.5 h-2 bg-amber-900 origin-bottom rotate-[-30deg]" />
                <div className="absolute -top-2 right-0 w-0.5 h-2 bg-amber-900 origin-bottom rotate-[30deg]" />

                {/* Red nose (Rudolph - first reindeer) */}
                {i === 0 && (
                  <motion.div
                    className="absolute top-1 -left-1 w-1.5 h-1.5 bg-red-500 rounded-full"
                    animate={{
                      boxShadow: [
                        '0 0 5px rgba(239,68,68,0.8)',
                        '0 0 15px rgba(239,68,68,1)',
                        '0 0 5px rgba(239,68,68,0.8)'
                      ]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity
                    }}
                  />
                )}
              </div>

              {/* Legs */}
              <div className="absolute -bottom-1.5 left-0 w-0.5 h-2 bg-amber-900" />
              <div className="absolute -bottom-1.5 left-1.5 w-0.5 h-2 bg-amber-900" />
              <div className="absolute -bottom-1.5 right-1.5 w-0.5 h-2 bg-amber-900" />
              <div className="absolute -bottom-1.5 right-0 w-0.5 h-2 bg-amber-900" />

              {/* Tail */}
              <div className="absolute -right-1 top-0 w-1 h-2 bg-amber-700 rounded-full" />
            </div>

            {/* Harness */}
            <div className="absolute top-1 left-0 w-full h-0.5 bg-yellow-600" />
          </motion.div>
        ))}

        {/* Sleigh */}
        <div className="absolute right-0 top-[25px]">
          {/* Sleigh body */}
          <div className="relative w-16 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg">
            {/* Gold trim */}
            <div className="absolute inset-0.5 border-2 border-yellow-400 rounded-lg" />

            {/* Runners */}
            <div className="absolute -bottom-1 left-0 w-full h-1 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full" />
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gray-200 rounded-full blur-[1px]" />

            {/* Presents in sleigh */}
            <div className="absolute top-1 left-2 flex gap-0.5">
              <div className="w-2 h-2 bg-green-500 rounded-sm border border-yellow-400" />
              <div className="w-2 h-2 bg-blue-500 rounded-sm border border-yellow-400" />
              <div className="w-2 h-2 bg-purple-500 rounded-sm border border-yellow-400" />
            </div>
          </div>

          {/* Santa */}
          <div className="absolute -right-1 -top-2 w-4 h-6">
            {/* Body */}
            <div className="w-4 h-3 bg-red-600 rounded-t-lg" />

            {/* Head */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-pink-200 rounded-full">
              {/* Hat */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-2 bg-red-600 rounded-t-full" />
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />

              {/* Beard */}
              <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-white rounded-b-full" />
            </div>

            {/* Arms */}
            <div className="absolute top-1 -left-0.5 w-0.5 h-2 bg-red-700 rounded-full" />
            <div className="absolute top-1 -right-0.5 w-0.5 h-2 bg-red-700 rounded-full" />
          </div>
        </div>

        {/* Sparkle trail */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-yellow-200 rounded-full"
            style={{
              right: `${170 + i * 15}px`,
              top: `${30 + Math.sin(i) * 10}px`
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
