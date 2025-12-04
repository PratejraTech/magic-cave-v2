import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Snowflake, Gift, Star, TreePine, Sparkles } from 'lucide-react';

import { Button } from './ui/button';
import { Card } from './ui/card';

interface SnowflakeProps {
  delay: number;
  duration: number;
  left: string;
}

const AnimatedSnowflake: React.FC<SnowflakeProps> = ({ delay, duration, left }) => {
  return (
    <motion.div
      className="absolute text-white/60"
      style={{ left }}
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: '100vh',
        opacity: [0, 1, 1, 0],
        rotate: 360
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      <Snowflake size={16} />
    </motion.div>
  );
};

interface OrnamentProps {
  color: string;
  size: number;
  top: string;
  left: string;
  delay: number;
}

const Ornament: React.FC<OrnamentProps> = ({ color, size, top, left, delay }) => {
  return (
    <motion.div
      className={`absolute rounded-full ${color}`}
      style={{
        width: size,
        height: size,
        top,
        left
      }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      transition={{
        duration: 1,
        delay,
        repeat: Infinity,
        repeatType: 'reverse',
        repeatDelay: 2
      }}
    />
  );
};

const ChristmasShowcase: React.FC = () => {
  const [showMessage, setShowMessage] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const controls = useAnimation();

  useEffect(() => {
    const calculateCountdown = () => {
      const christmas = new Date(new Date().getFullYear(), 11, 25);
      const now = new Date();

      if (now > christmas) {
        christmas.setFullYear(christmas.getFullYear() + 1);
      }

      const diff = christmas.getTime() - now.getTime();

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    left: `${Math.random() * 100}%`
  }));

  const handleCelebrate = () => {
    setShowMessage(true);
    controls.start({
      scale: [1, 1.2, 1],
      rotate: [0, 10, -10, 0],
      transition: { duration: 0.5 }
    });
    setTimeout(() => setShowMessage(false), 3000);
  };

  return (
    <div className="christmas-showcase relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="absolute inset-0 pointer-events-none">
        {snowflakes.map((flake) => (
          <AnimatedSnowflake key={flake.id} delay={flake.delay} duration={flake.duration} left={flake.left} />
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-pink-500/30 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -100, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '10%', left: '10%' }}
        />
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-blue-500/30 blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, 100, 0],
            scale: [1, 1.3, 1]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          style={{ top: '60%', right: '10%' }}
        />
        <motion.div
          className="absolute h-96 w-96 rounded-full bg-emerald-500/30 blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -50, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ bottom: '10%', left: '50%' }}
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 80 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-yellow-200"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
              scale: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            <Star size={Math.random() > 0.5 ? 12 : 8} fill="currentColor" />
          </motion.div>
        ))}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-full w-1 bg-gradient-to-b from-transparent via-white/20 to-transparent"
            style={{
              left: `${20 + i * 15}%`,
              transformOrigin: 'top'
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scaleY: [0.8, 1.2, 0.8]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-8">
        <motion.div className="relative mb-12" initial={{ scale: 0, y: 100 }} animate={{ scale: 1, y: 0 }} transition={{ duration: 1, type: 'spring' }}>
          <div className="relative">
            <TreePine className="text-green-600 drop-shadow-2xl" size={200} strokeWidth={1.5} />

            <Ornament color="bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]" size={16} top="20%" left="40%" delay={0.2} />
            <Ornament color="bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]" size={14} top="35%" left="25%" delay={0.4} />
            <Ornament color="bg-blue-400 shadow-[0_0_15px_rgba(96,165,250,0.8)]" size={18} top="35%" left="60%" delay={0.6} />
            <Ornament color="bg-pink-400 shadow-[0_0_15px_rgba(244,114,182,0.8)]" size={12} top="50%" left="35%" delay={0.8} />
            <Ornament color="bg-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.8)]" size={16} top="50%" left="55%" delay={1} />
            <Ornament color="bg-orange-400 shadow-[0_0_15px_rgba(251,146,60,0.8)]" size={14} top="65%" left="45%" delay={1.2} />
            <Ornament color="bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]" size={15} top="25%" left="55%" delay={0.3} />
            <Ornament color="bg-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.8)]" size={13} top="45%" left="20%" delay={0.7} />
            <Ornament color="bg-rose-400 shadow-[0_0_15px_rgba(251,113,133,0.8)]" size={17} top="60%" left="65%" delay={0.9} />

            <motion.div
              className="absolute -top-8 left-1/2 -translate-x-1/2"
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{
                rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                scale: { duration: 1, repeat: Infinity, repeatType: 'reverse' }
              }}
            >
              <Star className="text-yellow-300" size={40} fill="currentColor" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div className="mb-8 text-center" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}>
          <h1 className="mb-4 text-6xl font-bold text-white drop-shadow-lg md:text-8xl">
            <motion.span
              className="inline-block bg-gradient-to-r from-yellow-200 via-pink-300 to-purple-300 bg-clip-text text-transparent"
              animate={{
                textShadow: ['0 0 20px rgba(255,255,255,0.5)', '0 0 40px rgba(255,215,0,0.8)', '0 0 20px rgba(255,255,255,0.5)']
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Merry Christmas
            </motion.span>
          </h1>
          <p className="flex items-center justify-center gap-2 text-xl text-blue-100 md:text-2xl">
            <Sparkles size={20} />
            Season&apos;s Greetings
            <Sparkles size={20} />
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1, duration: 0.5 }} className="mb-8 w-full max-w-3xl">
          <Card className="bg-white/10 p-8 backdrop-blur-md">
            <h2 className="mb-4 text-center text-2xl font-semibold text-white">Countdown to Christmas</h2>
            <div className="grid grid-cols-2 gap-4 text-center md:grid-cols-4">
              {[
                { label: 'Days', value: countdown.days },
                { label: 'Hours', value: countdown.hours },
                { label: 'Minutes', value: countdown.minutes },
                { label: 'Seconds', value: countdown.seconds }
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center">
                  <motion.div
                    className="min-w-[80px] rounded-lg bg-red-600/80 p-4 text-4xl font-bold text-white md:text-5xl"
                    key={item.label}
                    initial={{ scale: 1.2 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {item.value.toString().padStart(2, '0')}
                  </motion.div>
                  <span className="mt-2 text-sm text-blue-100">{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        <motion.div animate={controls} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleCelebrate} size="lg" className="rounded-full bg-red-600 px-8 py-6 text-lg font-semibold text-white shadow-2xl hover:bg-red-700">
            <Gift className="mr-2" size={24} />
            Celebrate Christmas!
          </Button>
        </motion.div>

        {showMessage && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="absolute bottom-20 left-1/2 -translate-x-1/2">
            <Card className="bg-green-600 p-6 shadow-2xl">
              <p className="flex items-center gap-2 text-xl font-semibold text-white">
                <Sparkles className="animate-spin" />
                Ho Ho Ho! Merry Christmas! 🎅
                <Sparkles className="animate-spin" />
              </p>
            </Card>
          </motion.div>
        )}

        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-red-400"
            style={{
              left: `${20 + i * 15}%`,
              bottom: '10%'
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [-10, 10, -10]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3
            }}
          >
            <Gift size={32} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChristmasShowcase;
