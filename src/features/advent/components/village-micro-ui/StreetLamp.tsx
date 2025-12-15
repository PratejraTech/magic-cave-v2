/**
 * StreetLamp - Glowing street lamp with warm light
 * Micro UI component for village scene
 */

import { motion } from 'framer-motion';

interface StreetLampProps {
  lightOn?: boolean;
  delay?: number;
}

export function StreetLamp({ lightOn = true, delay = 0 }: StreetLampProps) {
  return (
    <motion.div
      className="relative w-8 h-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay }}
    >
      {/* Lamp post */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-20 bg-gradient-to-b from-gray-700 to-gray-900 rounded-full shadow-lg" />

      {/* Lamp head */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2">
        {/* Lamp bracket */}
        <div className="w-6 h-2 bg-gray-800 rounded-full mb-1" />

        {/* Lamp body */}
        <div className="relative w-6 h-8 bg-gradient-to-b from-gray-700 to-gray-800 rounded-lg shadow-xl">
          {/* Glass panel */}
          <div className="absolute inset-1 bg-gradient-to-b from-yellow-100/40 to-yellow-200/60 rounded-md overflow-hidden">
            {lightOn && (
              <motion.div
                className="absolute inset-0 bg-yellow-300"
                animate={{
                  opacity: [0.6, 0.8, 0.6]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}
          </div>

          {/* Window bars */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-px bg-gray-600/30" />
            <div className="absolute w-px h-full bg-gray-600/30" />
          </div>
        </div>
      </div>

      {/* Light glow */}
      {lightOn && (
        <>
          <motion.div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(255,223,0,0.3) 0%, rgba(255,223,0,0) 70%)',
              filter: 'blur(8px)'
            }}
            animate={{
              opacity: [0.4, 0.7, 0.4],
              scale: [0.9, 1.1, 0.9]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />

          {/* Ground light pool */}
          <motion.div
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-4 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,223,0,0.2) 0%, rgba(255,223,0,0) 70%)',
              filter: 'blur(6px)'
            }}
            animate={{
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </>
      )}

      {/* Snow cap */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-2 bg-white/90 rounded-full blur-[1px]" />
    </motion.div>
  );
}
