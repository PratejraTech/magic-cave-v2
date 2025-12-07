import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Snowflake } from 'lucide-react';

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
    { color: 'bg-fuchsia-500/20', size: 'size-[20rem]' },
    { color: 'bg-sky-400/15', size: 'size-[18rem]' }
  ],
  frost: [
    { color: 'bg-cyan-400/20', size: 'size-[20rem]' },
    { color: 'bg-emerald-300/15', size: 'size-[18rem]' }
  ],
  ember: [
    { color: 'bg-amber-400/20', size: 'size-[20rem]' },
    { color: 'bg-rose-500/15', size: 'size-[18rem]' }
  ]
};

const ButterflyIcon: React.FC<{ size?: number }> = ({ size = 34 }) => (
  <svg
    viewBox="0 0 64 64"
    width={size}
    height={size}
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <ellipse cx="20" cy="20" rx="12" ry="16" opacity="0.85" />
    <ellipse cx="20" cy="46" rx="12" ry="16" opacity="0.55" />
    <ellipse cx="44" cy="20" rx="12" ry="16" opacity="0.85" />
    <ellipse cx="44" cy="46" rx="12" ry="16" opacity="0.55" />
    <rect x="30" y="16" width="4" height="32" rx="1.5" opacity="0.9" />
    <circle cx="32" cy="14" r="2" opacity="0.9" />
  </svg>
);

const SnowLayer: React.FC<{ count?: number }> = ({ count = 20 }) => {
  const flakes = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 4,
        duration: 12 + Math.random() * 8,
        left: Math.random() * 100,
        size: Math.random() * 8 + 4
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {flakes.map((flake) => (
        <motion.span
          key={flake.id}
          className="absolute text-white/40"
          style={{ left: `${flake.left}%`, fontSize: flake.size }}
          initial={{ y: '-5%', opacity: 0 }}
          animate={{ y: '105%', opacity: [0, 0.4, 0.3, 0] }}
          transition={{ duration: flake.duration, delay: flake.delay, repeat: Infinity, ease: 'linear' }}
        >
          <Snowflake size={flake.size} />
        </motion.span>
      ))}
    </div>
  );
};

const ButterflyLayer: React.FC<{ count?: number }> = ({ count = 3 }) => {
  const butterflies = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: idx * 6,
        duration: 18 + Math.random() * 8,
        startX: 10 + Math.random() * 80,
        startY: 20 + Math.random() * 40,
        scale: 0.8 + Math.random() * 0.3,
        // Pastel colors: soft pink and soft blue
        color: idx % 2 === 0 ? 'text-[#FDB4D8]' : 'text-[#B4E4FF]'
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {butterflies.map((butterfly) => (
        <motion.div
          key={butterfly.id}
          className={cn('absolute opacity-60', butterfly.color)}
          style={{ left: `${butterfly.startX}%`, top: `${butterfly.startY}%` }}
          initial={{ opacity: 0, y: 20, scale: butterfly.scale }}
          animate={{
            opacity: [0, 0.6, 0],
            x: [0, 40, -20, 0],
            y: [0, -30, 15, 0],
            rotate: [0, 10, -8, 0],
          }}
          transition={{
            duration: butterfly.duration,
            delay: butterfly.delay,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <ButterflyIcon size={30} />
        </motion.div>
      ))}
    </div>
  );
};

const LoveLayer: React.FC<{ count?: number }> = ({ count = 6 }) => {
  const hearts = React.useMemo(
    () =>
      Array.from({ length: count }, (_, idx) => ({
        id: idx,
        delay: Math.random() * 3,
        duration: 12 + Math.random() * 6,
        left: 10 + Math.random() * 80,
        bottom: Math.random() * 40,
        scale: 0.6 + Math.random() * 0.5
      })),
    [count]
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute text-rose-200/50"
          style={{ left: `${heart.left}%`, bottom: `${heart.bottom}%` }}
          initial={{ opacity: 0, scale: heart.scale, y: 0 }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [-10, -50],
            rotate: [0, 6, -6, 0]
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        >
          <Heart size={18} fill="currentColor" />
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
      {/* Gradient Background */}
      <div className={cn('absolute inset-0 bg-gradient-to-br', gradientMap[mood])} />

      {/* Soft Radial Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />

      {/* Soft Glows - Reduced from 3 to 2 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {glows.map((glow, index) => (
          <motion.div
            key={index}
            className={cn('absolute rounded-full blur-3xl', glow.color, glow.size)}
            style={{ top: `${15 + index * 30}%`, left: index % 2 === 0 ? '15%' : '65%' }}
            animate={{ scale: [0.9, 1.05, 0.95], opacity: [0.3, 0.6, 0.4] }}
            transition={{ duration: 12 + index * 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Refined Animations - No heavy shader */}
      {showSnow && <SnowLayer count={20} />}
      {showButterflies && <ButterflyLayer count={3} />}
      {showHearts && <LoveLayer count={6} />}

      {/* Soft Bottom Gradient */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white/8 via-white/4 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      />

      {/* Content */}
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
