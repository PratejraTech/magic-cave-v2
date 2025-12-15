/**
 * ChristmasTree - Animated Christmas tree with twinkling lights
 * Micro UI component for village scene
 */

import { motion } from 'framer-motion';

interface ChristmasTreeProps {
  size?: 'small' | 'medium' | 'large';
  hasstar?: boolean;
  delay?: number;
}

export function ChristmasTree({ size = 'medium', hasstar = true, delay = 0 }: ChristmasTreeProps) {
  const sizes = {
    small: { width: 'w-12', height: 'h-16' },
    medium: { width: 'w-16', height: 'h-24' },
    large: { width: 'w-20', height: 'h-32' }
  };

  const selectedSize = sizes[size];

  const lights = [
    { color: '#FFD700', x: '50%', y: '20%' },
    { color: '#FF6B6B', x: '30%', y: '35%' },
    { color: '#4FC3F7', x: '70%', y: '35%' },
    { color: '#81C784', x: '40%', y: '50%' },
    { color: '#BA68C8', x: '60%', y: '50%' },
    { color: '#FFA500', x: '25%', y: '65%' },
    { color: '#F06292', x: '75%', y: '65%' },
    { color: '#FFD700', x: '50%', y: '80%' }
  ];

  return (
    <motion.div
      className={`relative ${selectedSize.width} ${selectedSize.height}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Tree layers (triangle shapes) */}
      <div className="relative w-full h-full flex flex-col items-center justify-end">
        {/* Top layer */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '30px solid #2d5016'
          }}
        />

        {/* Middle layer */}
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '28px solid transparent',
            borderRight: '28px solid transparent',
            borderBottom: '35px solid #2d5016'
          }}
        />

        {/* Bottom layer */}
        <div
          className="absolute top-12 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '36px solid transparent',
            borderRight: '36px solid transparent',
            borderBottom: '40px solid #2d5016'
          }}
        />

        {/* Trunk */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-amber-900 to-amber-950 rounded-sm" />

        {/* Snow on branches */}
        <div className="absolute inset-0 pointer-events-none">
          {[0, 6, 12].map((top, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 h-1 bg-white/90 rounded-full blur-[1px]"
              style={{
                top: `${top + 2}px`,
                width: `${40 - i * 8}px`
              }}
            />
          ))}
        </div>

        {/* Twinkling lights */}
        {lights.map((light, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: light.color,
              left: light.x,
              top: light.y,
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.3, 0.8],
              boxShadow: [
                `0 0 4px ${light.color}`,
                `0 0 12px ${light.color}`,
                `0 0 4px ${light.color}`
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.25
            }}
          />
        ))}

        {/* Star on top */}
        {hasstar && (
          <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
              scale: { duration: 2, repeat: Infinity }
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFD700">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <motion.div
              className="absolute inset-0 blur-md bg-yellow-400 rounded-full opacity-60"
              animate={{
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
            />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
