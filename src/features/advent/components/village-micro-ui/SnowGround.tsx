/**
 * SnowGround - Snow-covered ground with depth layers
 * Micro UI component for village scene base
 */

import { motion } from 'framer-motion';

interface SnowGroundProps {
  variant?: 'flat' | 'rolling' | 'hills';
}

export function SnowGround({ variant = 'rolling' }: SnowGroundProps) {
  const variants = {
    flat: {
      path: 'M0 300 L1200 300 L1200 400 L0 400 Z',
      color: 'from-blue-50 via-white to-blue-100'
    },
    rolling: {
      path: 'M0 320 Q300 280 600 320 T1200 320 L1200 400 L0 400 Z',
      color: 'from-blue-50 via-white to-blue-100'
    },
    hills: {
      path: 'M0 350 Q200 250 400 300 T800 320 Q1000 280 1200 320 L1200 400 L0 400 Z',
      color: 'from-blue-50 via-white to-blue-100'
    }
  };

  const selected = variants[variant];

  return (
    <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
      <svg
        viewBox="0 0 1200 400"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {/* Background snow layer (darker) */}
        <defs>
          <linearGradient id="snowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E0F2FE" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>

          {/* Sparkle pattern */}
          <pattern
            id="snowSparkles"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {[...Array(8)].map((_, i) => (
              <circle
                key={i}
                cx={Math.random() * 100}
                cy={Math.random() * 100}
                r="1"
                fill="white"
                opacity={0.3 + Math.random() * 0.4}
              />
            ))}
          </pattern>
        </defs>

        {/* Main snow layer */}
        <motion.path
          d={selected.path}
          fill="url(#snowGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Sparkle overlay */}
        <path d={selected.path} fill="url(#snowSparkles)" opacity="0.6" />

        {/* Shadow layer (depth) */}
        <path
          d={selected.path}
          fill="black"
          opacity="0.03"
          style={{ transform: 'translateY(2px)' }}
        />

        {/* Snow drifts (highlights) */}
        <motion.ellipse
          cx="200"
          cy="320"
          rx="80"
          ry="20"
          fill="white"
          opacity="0.5"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.ellipse
          cx="600"
          cy="310"
          rx="100"
          ry="25"
          fill="white"
          opacity="0.5"
          animate={{
            opacity: [0.4, 0.7, 0.4]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 1
          }}
        />
        <motion.ellipse
          cx="1000"
          cy="325"
          rx="90"
          ry="22"
          fill="white"
          opacity="0.5"
          animate={{
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
          }}
        />
      </svg>

      {/* Footprint trail (optional decorative element) */}
      <div className="absolute bottom-20 left-[10%] flex gap-8 opacity-20">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            transition={{ delay: i * 0.3 }}
          >
            {/* Left foot */}
            <div
              className="w-3 h-4 bg-blue-200 rounded-full"
              style={{ transform: `rotate(${-15 + i * 3}deg)` }}
            />
            {/* Right foot */}
            <div
              className="absolute -top-2 left-4 w-3 h-4 bg-blue-200 rounded-full"
              style={{ transform: `rotate(${15 - i * 3}deg)` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
