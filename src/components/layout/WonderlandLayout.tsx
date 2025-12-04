import React from 'react';
import { motion } from 'framer-motion';
import { Butterfly, Heart, Snowflake } from 'lucide-react';

import { cn } from '../../lib/utils';
import DarkModeToggle from '../DarkModeToggle';

type WonderlandMood = 'aurora' | 'frost' | 'ember';

interface WonderlandLayoutProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  mood?: WonderlandMood;
  showSnow?: boolean;
  showButterflies?: boolean;
  showHearts?: boolean;
  showDarkToggle?: boolean;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

const gradientMap: Record<WonderlandMood, string> = {
  aurora: 'from-[#0f172a] via-[#312e81] to-[#9333ea]',
  frost: 'from-[#0b1120] via-[#0f766e] to-[#14b8a6]',
  ember: 'from-[#3b0764] via-[#9d174d] to-[#f97316]'
};

const glowMap: Record<WonderlandMood, { color: string; size: string }[]> = {
  aurora: [
    { color: 'bg-fuchsia-500/30', size: 'size-[28rem]' },
    { color: 'bg-sky-400/20', size: 'size-[22rem]' },
    { color: 'bg-emerald-400/30', size: 'size-[30rem]' }
  ],
  frost: [
    { color: 'bg-cyan-400/30', size: 'size-[28rem]' },
    { color: 'bg-indigo-400/20', size: 'size-[22rem]' },
    { color: 'bg-emerald-300/30', size: 'size-[30rem]' }
  ],
  ember: [
    { color: 'bg-amber-400/30', size: 'size-[28rem]' },
    { color: 'bg-rose-500/20', size: 'size-[22rem]' },
    { color: 'bg-purple-500/30', size: 'size-[30rem]' }
  ]
};

const SnowLayer: React.FC<{ count?: number }> = ({ count = 32 }) => {
  const flakes = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 4,
        duration: 8 + Math.random() * 6,
        left: Math.random() * 100,
        size: Math.random() * 12 + 6
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((flake) => (
        <motion.span
          key={flake.id}
          className="absolute text-white/70"
          style={{ left: `${flake.left}%`, fontSize: flake.size }}
          initial={{ y: '-5%', opacity: 0 }}
          animate={{ y: '105%', opacity: [0, 1, 0.6, 0] }}
          transition={{ duration: flake.duration, delay: flake.delay, repeat: Infinity, ease: 'linear' }}
        >
          <Snowflake size={flake.size} />
        </motion.span>
      ))}
    </div>
  );
};

const ButterflyLayer: React.FC<{ count?: number }> = ({ count = 8 }) => {
  const butterflies = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 1.5,
        duration: 14 + Math.random() * 12,
        startX: Math.random() * 80,
        startY: Math.random() * 60,
        scale: 0.9 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? 'text-rose-200' : 'text-amber-200'
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {butterflies.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className={cn('absolute drop-shadow-[0_0_12px_rgba(244,114,182,0.65)]', butterfly.color)}
          style={{ left: `${butterfly.startX}%`, top: `${butterfly.startY}%` }}
          initial={{ opacity: 0, y: 20, scale: butterfly.scale }}
          animate={{
            opacity: [0, 1, 0],
            x: [0, 50, -30, 0],
            y: [0, -40, 20, 0],
            rotate: [0, 14, -12, 0],
            filter: ['blur(0px)', 'blur(0.5px)', 'blur(0px)']
          }}
          transition={{
            duration: butterfly.duration,
            delay: butterfly.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Butterfly size={34} />
        </motion.div>
      ))}
    </div>
  );
};

const LoveLayer: React.FC<{ count?: number }> = ({ count = 10 }) => {
  const hearts = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 3,
        duration: 10 + Math.random() * 6,
        left: 10 + Math.random() * 80,
        bottom: Math.random() * 40,
        scale: 0.6 + Math.random() * 0.8
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-rose-200/80"
          style={{ left: `${heart.left}%`, bottom: `${heart.bottom}%` }}
          initial={{ opacity: 0, scale: heart.scale, y: 0 }}
          animate={{
            opacity: [0, 0.85, 0],
            y: [-10, -60],
            rotate: [0, 8, -8, 0]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        >
          <Heart size={22} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
};

const WonderlandLayout: React.FC<WonderlandLayoutProps> = ({
  title,
  subtitle,
  actions,
  mood = 'aurora',
  showSnow = true,
  showButterflies = true,
  showHearts = true,
  showDarkToggle = true,
  className,
  contentClassName,
  children
}) => {
  const glows = glowMap[mood];

  return (
    <div className={cn('wonderland-layout relative min-h-screen w-full overflow-hidden', className)}>
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradientMap[mood])} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_45%)]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {glows.map((glow, index) => (
          <motion.div
            key={index}
            className={cn('absolute rounded-full blur-3xl', glow.color, glow.size)}
            style={{ top: `${10 + index * 25}%`, left: index % 2 === 0 ? '10%' : '60%' }}
            animate={{ scale: [0.8, 1.05, 0.95], opacity: [0.4, 0.8, 0.5] }}
            transition={{ duration: 10 + index * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {showSnow && <SnowLayer />}
      {showButterflies && <ButterflyLayer />}
      {showHearts && <LoveLayer />}

      <motion.div
        className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/10 via-white/5 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      <div className="relative z-10 flex min-h-screen flex-col gap-6 px-4 py-10 text-white sm:px-6 lg:px-12">
        {(title || subtitle || actions || showDarkToggle) && (
          <div className="flex flex-col gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg lg:flex-row lg:items-center lg:justify-between">
            <div>
              {title && (
                <h1 className="text-3xl font-semibold tracking-tight drop-shadow-md sm:text-4xl">
                  {title}
                  <Heart className="ml-3 inline-block text-rose-200" size={28} />
                </h1>
              )}
              {subtitle && <p className="mt-2 text-base text-white/80 sm:text-lg">{subtitle}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {showDarkToggle && <DarkModeToggle />}
              {actions}
            </div>
          </div>
        )}

        <div className={cn('relative w-full flex-1', contentClassName)}>{children}</div>
      </div>
    </div>
  );
};

export default WonderlandLayout;
