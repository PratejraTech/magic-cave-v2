import { useState, useRef } from 'react';
import { CalendarDay } from '../types/calendar';
import { getAdelaideDate } from '../lib/date';
import { motion } from 'framer-motion';

interface DayCardProps {
  day: CalendarDay;
  onOpen: (dayId: number) => void;
  isDecember: boolean;
}

export function DayCard({ day, onOpen, isDecember }: DayCardProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showContent, setShowContent] = useState(day.is_opened);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const adelaideDate = getAdelaideDate();
  const canOpen = isDecember && adelaideDate.getDate() >= day.id;

  const createParticles = () => {
    const newParticles = [];

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 150;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;

      newParticles.push({
        id: i,
        x: tx,
        y: ty,
      });
    }

    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  const handleClick = () => {
    if (!canOpen || showContent) return;

    createParticles();
    setIsOpening(true);

    setTimeout(() => {
      setShowContent(true);
      onOpen(day.id);
    }, 600);
  };

  return (
    <div className="perspective-1000" ref={containerRef}>
      <motion.div
        className={`relative cursor-pointer ${
          !canOpen ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        onClick={handleClick}
        whileHover={canOpen ? { scale: 1.05 } : {}}
        whileTap={canOpen ? { scale: 0.95 } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {!showContent ? (
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: isOpening ? 180 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`clay-card w-full aspect-square rounded-2xl flex items-center justify-center text-6xl font-black relative overflow-hidden ${
              isOpening ? 'portal-opening' : ''
            }`}
            style={{
              background: 'linear-gradient(145deg, #4a90e2, #1e3a8a)',
              boxShadow: '12px 12px 24px #1a1a2e, -12px -12px 24px #0f4c75, inset 4px 4px 8px rgba(255,255,255,0.2)',
            }}
          >
            <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 drop-shadow-lg">
              {day.id}
            </span>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/30 via-transparent to-orange-400/20 rounded-[20px]"></div>
            {canOpen && !day.is_opened && (
              <div
                className="absolute top-3 right-3 w-4 h-4 rounded-full animate-pulse"
                style={{
                  background: 'radial-gradient(circle, #ffff00, #ff6b00)',
                  boxShadow: '0 0 12px rgba(255, 200, 0, 0.8)',
                }}
              ></div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`clay-card-open w-full aspect-square rounded-2xl overflow-hidden relative ${
              isOpening ? 'portal-active' : ''
            }`}
            style={{
              background: 'linear-gradient(145deg, #0f4c75, #1a1a2e)',
              boxShadow: '12px 12px 24px #0a2540, -12px -12px 24px #1e3a8a, inset 0 0 20px rgba(100, 200, 255, 0.2)',
            }}
          >
            <img
              src={day.photo_url}
              alt={`Day ${day.id}`}
              className="w-full h-full object-cover brightness-105 contrast-110"
            />
            <div
              className="absolute bottom-0 left-0 right-0 p-4 backdrop-blur-md rounded-b-[20px]"
              style={{
                background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.85))',
              }}
            >
              <p className="text-sm font-bold text-center text-white leading-relaxed drop-shadow-lg">
                {day.message}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle w-3 h-3 rounded-full pointer-events-none"
          style={{
            left: `calc(50% - 6px)`,
            top: `calc(50% - 6px)`,
            '--tx': `${particle.x}px`,
            '--ty': `${particle.y}px`,
            background: `hsl(${Math.random() * 360}, 100%, 60%)`,
            boxShadow: `0 0 8px currentColor`,
          } as React.CSSProperties & { '--tx': string; '--ty': string }}
        ></div>
      ))}
    </div>
  );
}
