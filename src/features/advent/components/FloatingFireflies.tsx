import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Firefly {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export function FloatingFireflies() {
  const [fireflies, setFireflies] = useState<Firefly[]>([]);

  useEffect(() => {
    const createFireflies = () => {
      const flies: Firefly[] = [];
      for (let i = 0; i < 20; i++) {
        flies.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          delay: Math.random() * 5,
          duration: Math.random() * 2 + 3
        });
      }
      setFireflies(flies);
    };

    createFireflies();
  }, []);

  return (
    <div className="firefly absolute inset-0 pointer-events-none">
      {fireflies.map((firefly) => (
        <motion.div
          key={firefly.id}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full shadow-lg"
          style={{
            left: firefly.x,
            top: firefly.y,
          }}
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: firefly.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: firefly.delay,
          }}
        />
      ))}
    </div>
  );
}