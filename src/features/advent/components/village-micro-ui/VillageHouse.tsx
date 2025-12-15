/**
 * VillageHouse - Individual house component for Christmas village
 * Micro UI component with lights, door, windows, and chimney
 */

import { motion } from 'framer-motion';
import { useState } from 'react';

interface VillageHouseProps {
  day: number;
  style?: 'cozy' | 'tall' | 'cottage' | 'church' | 'shop';
  lightColor?: 'warm' | 'cool' | 'rainbow';
  hasChimney?: boolean;
  hasDoor?: boolean;
  onClick?: () => void;
  isUnlocked?: boolean;
  delay?: number;
}

export function VillageHouse({
  day,
  style = 'cozy',
  lightColor = 'warm',
  hasChimney = true,
  hasDoor = true,
  onClick,
  isUnlocked = false,
  delay = 0
}: VillageHouseProps) {
  const [isHovered, setIsHovered] = useState(false);

  const houseStyles = {
    cozy: {
      width: 'w-full',
      height: 'h-32',
      roof: 'polygon(50% 0%, 100% 30%, 100% 100%, 0% 100%, 0% 30%)',
      color: 'from-red-400 to-red-600'
    },
    tall: {
      width: 'w-full',
      height: 'h-40',
      roof: 'polygon(50% 0%, 100% 25%, 100% 100%, 0% 100%, 0% 25%)',
      color: 'from-blue-400 to-blue-600'
    },
    cottage: {
      width: 'w-full',
      height: 'h-28',
      roof: 'polygon(50% 0%, 100% 35%, 100% 100%, 0% 100%, 0% 35%)',
      color: 'from-amber-400 to-amber-600'
    },
    church: {
      width: 'w-full',
      height: 'h-48',
      roof: 'polygon(50% 0%, 60% 20%, 100% 30%, 100% 100%, 0% 100%, 0% 30%, 40% 20%)',
      color: 'from-gray-300 to-gray-500'
    },
    shop: {
      width: 'w-full',
      height: 'h-36',
      roof: 'polygon(20% 25%, 80% 25%, 100% 100%, 0% 100%)',
      color: 'from-green-400 to-green-600'
    }
  };

  const selectedStyle = houseStyles[style];

  const lightColors = {
    warm: ['#FFD700', '#FFA500', '#FF6B6B'],
    cool: ['#4FC3F7', '#81C784', '#BA68C8'],
    rainbow: ['#FF6B6B', '#FFD700', '#4FC3F7', '#81C784', '#BA68C8', '#F06292']
  };

  const lights = lightColors[lightColor];

  return (
    <motion.div
      className="relative cursor-pointer group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* House structure */}
      <div className={`${selectedStyle.width} ${selectedStyle.height} relative`}>
        {/* Main house body */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${selectedStyle.color} rounded-b-lg shadow-2xl`}
          style={{
            clipPath: selectedStyle.roof
          }}
        >
          {/* Snow on roof */}
          <div
            className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/90 to-transparent"
            style={{
              clipPath: selectedStyle.roof,
              filter: 'blur(1px)'
            }}
          />

          {/* Windows */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
            {[1, 2].map((win) => (
              <motion.div
                key={win}
                className="w-4 h-5 bg-yellow-200 rounded-sm relative overflow-hidden"
                animate={{
                  boxShadow: isHovered
                    ? ['0 0 10px rgba(255,215,0,0.6)', '0 0 20px rgba(255,215,0,0.9)', '0 0 10px rgba(255,215,0,0.6)']
                    : '0 0 5px rgba(255,215,0,0.3)'
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {/* Window cross */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-px bg-gray-700 absolute top-1/2" />
                  <div className="h-full w-px bg-gray-700 absolute left-1/2" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Door */}
          {hasDoor && (
            <motion.div
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-10 rounded-t-md ${
                isUnlocked ? 'bg-yellow-400' : 'bg-amber-900'
              } shadow-lg`}
              animate={
                isUnlocked
                  ? {
                      backgroundColor: ['#FBBF24', '#FCD34D', '#FBBF24'],
                      boxShadow: [
                        '0 0 10px rgba(251,191,36,0.5)',
                        '0 0 20px rgba(252,211,77,0.8)',
                        '0 0 10px rgba(251,191,36,0.5)'
                      ]
                    }
                  : {}
              }
              transition={{ duration: 2, repeat: Infinity }}
            >
              {/* Door knob */}
              <div className="absolute right-1 top-1/2 w-1 h-1 bg-yellow-600 rounded-full" />

              {/* Day number on door */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-xs font-bold drop-shadow-md">{day}</span>
              </div>
            </motion.div>
          )}

          {/* Christmas lights */}
          <div className="absolute top-0 left-0 right-0 flex justify-around px-1 pt-1">
            {lights.slice(0, 4).map((color, i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: color }}
                animate={{
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </div>

        {/* Chimney */}
        {hasChimney && (
          <div className="absolute -top-4 right-4 w-3 h-8 bg-gradient-to-b from-red-700 to-red-900 rounded-t-sm shadow-lg">
            <div className="absolute -top-1 -left-0.5 -right-0.5 h-2 bg-red-800 rounded-sm" />

            {/* Smoke */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 space-y-1">
              {[0, 1, 2].map((puff) => (
                <motion.div
                  key={puff}
                  className="w-2 h-2 bg-gray-400/40 rounded-full blur-sm"
                  animate={{
                    y: [-5, -15],
                    x: [0, puff % 2 === 0 ? 3 : -3],
                    opacity: [0.6, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: puff * 0.6
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Hover glow effect */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              boxShadow: '0 0 30px rgba(255, 255, 255, 0.4)',
              pointerEvents: 'none'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}

        {/* Unlocked indicator */}
        {isUnlocked && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <span className="text-white text-xs">✓</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
