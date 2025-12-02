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
      for (let i = 0; i < 50; i++) {
        flakes.push({
          id: i,
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 4 + 2,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 5 + 5,
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
          x: flake.x + Math.sin(flake.y * 0.01) * 0.5,
          ...(flake.y > height && {
            y: -10,
            x: Math.random() * width,
          }),
        }));
      });
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  const viewport = getViewport();

  return (
    <div className="absolute inset-0 pointer-events-none">
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
            boxShadow: `0 0 ${flake.size}px rgba(255,255,255,0.8)`,
          }}
          animate={{
            y: viewport.height + 20,
            rotate: 360,
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
