import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Snowflake {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  duration: number;
}

const getViewport = () => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  return { width: window.innerWidth, height: window.innerHeight };
};

export function Snowfall() {
  const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const createSnowflakes = () => {
      const { width, height } = getViewport();
      const flakes: Snowflake[] = [];
      // Reduced from 50 to 30 particles
      for (let i = 0; i < 30; i++) {
        flakes.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          // Smaller size: 1-3px instead of 2-6px
          size: Math.random() * 2 + 1,
          // Slower speed
          speed: Math.random() * 1 + 0.5,
          // Much lower opacity: 0.08-0.15 instead of 0.2-1.0
          opacity: Math.random() * 0.07 + 0.08,
          // Longer duration for slower movement
          duration: Math.random() * 8 + 16,
        });
      }
      setSnowflakes(flakes);
    };

    createSnowflakes();

    const animate = () => {
      setSnowflakes((prev) => {
        const { width, height } = getViewport();
        return prev.map((flake) => ({
          ...flake,
          y: flake.y + flake.speed,
          // Gentler horizontal drift
          x: flake.x + Math.sin(flake.y * 0.005) * 0.3,
          ...(flake.y > height && {
            y: -10,
            x: Math.random() * width,
          }),
        }));
      });
    };

    // Slower animation updates: 50ms -> 100ms
    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, []);

  const viewport = getViewport();

  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
      {snowflakes.map((flake) => (
        <motion.div
          key={flake.id}
          className="snowflake absolute rounded-full bg-white"
          style={{
            left: flake.x,
            top: flake.y,
            width: flake.size,
            height: flake.size,
            opacity: flake.opacity,
            // Softer glow: reduced blur
            boxShadow: `0 0 ${flake.size * 0.5}px rgba(255,255,255,0.3)`,
          }}
          animate={{
            y: viewport.height + 20,
            // Slower rotation
            rotate: 180,
          }}
          transition={{
            duration: flake.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
