/**
 * VillagePath - Winding path through the village
 * Micro UI component for connecting houses
 */

import { motion } from 'framer-motion';

interface VillagePathProps {
  pathType?: 'straight' | 'winding' | 'curved';
}

export function VillagePath({ pathType = 'winding' }: VillagePathProps) {
  const paths = {
    straight: 'M0 380 L1200 380 L1200 390 L0 390 Z',
    winding: 'M0 385 Q200 375 400 385 T800 385 Q1000 375 1200 385 L1200 395 Q1000 385 800 395 T400 395 Q200 385 0 395 Z',
    curved: 'M0 390 Q300 370 600 390 T1200 390 L1200 400 Q900 380 600 400 T0 400 Z'
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 h-full overflow-hidden pointer-events-none z-10">
      <svg
        viewBox="0 0 1200 400"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <defs>
          {/* Path gradient (cobblestone effect) */}
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9CA3AF" />
            <stop offset="50%" stopColor="#6B7280" />
            <stop offset="100%" stopColor="#4B5563" />
          </linearGradient>

          {/* Cobblestone texture */}
          <pattern
            id="cobblestone"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="8" fill="#52525B" opacity="0.3" />
            <circle cx="30" cy="10" r="8" fill="#52525B" opacity="0.3" />
            <circle cx="10" cy="30" r="8" fill="#52525B" opacity="0.3" />
            <circle cx="30" cy="30" r="8" fill="#52525B" opacity="0.3" />
            <circle cx="20" cy="20" r="8" fill="#3F3F46" opacity="0.2" />
          </pattern>

          {/* Snow overlay pattern */}
          <pattern
            id="pathSnow"
            x="0"
            y="0"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            {[...Array(5)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 60}
                cy={Math.random() * 60}
                r={2 + Math.random() * 3}
                fill="white"
                opacity={0.4 + Math.random() * 0.3}
              />
            ))}
          </pattern>
        </defs>

        {/* Path base */}
        <motion.path
          d={paths[pathType]}
          fill="url(#pathGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1 }}
        />

        {/* Cobblestone texture overlay */}
        <path d={paths[pathType]} fill="url(#cobblestone)" opacity="0.4" />

        {/* Snow patches on path */}
        <path d={paths[pathType]} fill="url(#pathSnow)" />

        {/* Path edges (depth) */}
        <motion.path
          d={paths[pathType]}
          fill="none"
          stroke="#374151"
          strokeWidth="1"
          opacity="0.3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 }}
        />

        {/* Glowing streetlamp light pools along path */}
        {[200, 500, 800, 1100].map((x, i) => (
          <motion.ellipse
            key={i}
            cx={x}
            cy="387"
            rx="60"
            ry="15"
            fill="#FCD34D"
            opacity="0.15"
            animate={{
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: 'easeInOut'
            }}
          />
        ))}
      </svg>

      {/* Footprints on path (animated) */}
      <div className="absolute bottom-8 left-0 w-full flex justify-around opacity-10">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="relative w-4 h-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ delay: i * 0.4 }}
          >
            {/* Footprint shape */}
            <svg viewBox="0 0 20 30" className="w-full h-full fill-blue-300">
              <ellipse cx="10" cy="20" rx="6" ry="10" />
              <circle cx="7" cy="8" r="2" />
              <circle cx="10" cy="6" r="2" />
              <circle cx="13" cy="8" r="2" />
            </svg>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
