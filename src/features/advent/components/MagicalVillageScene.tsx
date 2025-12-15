/**
 * MagicalVillageScene - Enhanced Christmas village with depth, magic, and whitespace
 * Composes micro UI components into an immersive advent calendar experience
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDay } from '../../../types/calendar';
import { HouseCard } from './HouseCard';
import { Snowfall } from './Snowfall';
import { NorthernLights } from './NorthernLights';
import { ButterflyCollection } from './ButterflyCollection';
import { SoundManager } from '../utils/SoundManager';
import { getAdelaideDate } from '../../../lib/date';
import {
  ChristmasTree,
  StreetLamp,
  WalkingElf,
  SleighInSky,
  SnowGround,
  VillagePath
} from './village-micro-ui';

interface MagicalVillageSceneProps {
  days: CalendarDay[];
  onOpenDay: (dayId: number) => void;
  isGuest?: boolean;
}

const shouldForceUnlock =
  import.meta.env.DEV ||
  String(import.meta.env.VITE_FORCE_UNLOCK ?? import.meta.env.FORCE_UNLOCK ?? '').toLowerCase() === 'true';

export function MagicalVillageScene({ days, onOpenDay, isGuest = false }: MagicalVillageSceneProps) {
  const [collectedButterflies, setCollectedButterflies] = useState<string[]>([]);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
    soundManager.loadSound('door-creak', '/assets/christmas/audio/sfx/door-creak.mp3');
    soundManager.loadSound('magical-ding', '/assets/christmas/audio/sfx/magical-ding.mp3');
    soundManager.loadSound('confetti-burst', '/assets/christmas/audio/sfx/confetti-burst.mp3');
    soundManager.loadSound('elf-giggle', '/assets/christmas/audio/sfx/elf-giggle.mp3');
    soundManager.loadSound('butterfly-caught', '/assets/christmas/audio/sfx/butterfly-caught.mp3');
  }, [soundManager]);

  const handleButterflyCaught = (type: string) => {
    setCollectedButterflies(prev => [...prev, type]);
  };

  const adelaideDate = getAdelaideDate();
  const isAdelaideDecember = adelaideDate.getMonth() === 11;
  const currentAdelaideDay = adelaideDate.getDate();
  const isAfterDecember25 = isAdelaideDecember && currentAdelaideDay > 25;
  const allowDevUnlocks = shouldForceUnlock || isGuest;
  const isBeforeDecember = !isAdelaideDecember;
  const nextDay = isAfterDecember25 ? null : (isAdelaideDecember ? currentAdelaideDay + 1 : 1);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#1a2847] to-[#0f1b2e] relative overflow-hidden"
      data-testid="magical-village-scene"
    >
      {/* ===== BACKGROUND LAYER (Far Distance) ===== */}
      <div className="absolute inset-0 z-0">
        <NorthernLights />
        <Snowfall />

        {/* Moon */}
        <motion.div
          className="absolute top-[10%] right-[15%] w-20 h-20 bg-gradient-radial from-yellow-50 to-yellow-100 rounded-full shadow-[0_0_60px_rgba(255,255,200,0.4)]"
          animate={{
            boxShadow: [
              '0 0 60px rgba(255,255,200,0.4)',
              '0 0 80px rgba(255,255,200,0.6)',
              '0 0 60px rgba(255,255,200,0.4)'
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {/* Moon craters */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-200/30 rounded-full" />
          <div className="absolute top-10 right-6 w-4 h-4 bg-yellow-200/20 rounded-full" />
        </motion.div>

        {/* Stars */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Santa's sleigh */}
        <SleighInSky duration={40} delay={5} />
      </div>

      {/* ===== MIDGROUND LAYER (Village Elements) ===== */}
      <div className="absolute inset-0 z-10">
        {/* Mountains silhouette (far background) */}
        <svg
          viewBox="0 0 1200 400"
          className="absolute bottom-0 left-0 w-full h-2/3 opacity-20"
          preserveAspectRatio="none"
        >
          <path
            d="M0 350 L200 200 L400 280 L600 150 L800 250 L1000 180 L1200 300 L1200 400 L0 400 Z"
            fill="url(#mountainGradient)"
          />
          <defs>
            <linearGradient id="mountainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="100%" stopColor="#0f1b2e" />
            </linearGradient>
          </defs>
        </svg>

        {/* Village path */}
        <VillagePath pathType="winding" />

        {/* Decorative elements scattered throughout */}
        <div className="absolute bottom-32 left-[8%]">
          <ChristmasTree size="small" delay={0.2} />
        </div>
        <div className="absolute bottom-28 right-[12%]">
          <ChristmasTree size="medium" delay={0.4} />
        </div>
        <div className="absolute bottom-36 left-[25%]">
          <StreetLamp delay={0.6} />
        </div>
        <div className="absolute bottom-36 left-[50%]">
          <StreetLamp delay={0.8} />
        </div>
        <div className="absolute bottom-36 right-[25%]">
          <StreetLamp delay={1.0} />
        </div>
        <div className="absolute bottom-32 right-[35%]">
          <ChristmasTree size="large" hasstar delay={0.5} />
        </div>

        {/* Walking elves */}
        <WalkingElf startX={-10} endX={110} duration={25} delay={0} direction="right" />
        <WalkingElf startX={110} endX={-10} duration={30} delay={8} direction="left" />
      </div>

      {/* ===== FOREGROUND LAYER (Main Content) ===== */}
      <div className="relative z-20 p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-[1400px] mx-auto">
          {/* Header with generous whitespace */}
          <motion.div
            className="text-center mb-16 sm:mb-20 md:mb-24 space-y-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Subtitle */}
            <motion.p
              className="uppercase text-xs sm:text-sm tracking-[0.3em] text-cyan-300/70 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Welcome to
            </motion.p>

            {/* Main title with gradient */}
            <motion.div
              className="inline-block"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 drop-shadow-[0_0_30px_rgba(147,197,253,0.5)]">
                  Christmas Village
                </span>
              </h1>

              {/* Decorative underline */}
              <motion.div
                className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-4 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ delay: 0.8, duration: 0.8 }}
              />
            </motion.div>

            {/* Description */}
            <motion.p
              className="text-cyan-100/80 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
            >
              Discover 25 magical surprises, one for each day of December.
              <br className="hidden sm:block" />
              Create lasting memories with your family this holiday season.
            </motion.p>

            {/* Butterfly counter (if any collected) */}
            {collectedButterflies.length > 0 && (
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <span className="text-2xl">🦋</span>
                <span className="text-pink-200 font-semibold">
                  {collectedButterflies.length} discovered
                </span>
              </motion.div>
            )}
          </motion.div>

          {/* Calendar grid with generous spacing */}
          <motion.div
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 sm:gap-6 md:gap-8 lg:gap-10 mb-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            {days.map((day, index) => {
              const canOpen =
                allowDevUnlocks || isAfterDecember25 || (isAdelaideDecember && currentAdelaideDay >= day.id);

              const isNextDay = nextDay !== null && day.id === nextDay && !canOpen && !allowDevUnlocks;

              return (
                <motion.div
                  key={day.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.05, duration: 0.5 }}
                >
                  <HouseCard
                    day={day}
                    onOpen={onOpenDay}
                    canOpen={canOpen}
                    isBeforeDecember={isBeforeDecember}
                    shouldForceUnlock={allowDevUnlocks}
                    isNextDay={isNextDay}
                  />
                </motion.div>
              );
            })}
          </motion.div>

          {/* Decorative quote */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.0 }}
          >
            <p className="text-cyan-200/60 italic text-sm sm:text-base leading-relaxed">
              "The magic of Christmas isn't in the presents, but in the presence of those we love."
            </p>
          </motion.div>
        </div>
      </div>

      {/* ===== OVERLAY EFFECTS ===== */}
      <div className="absolute inset-0 z-30 pointer-events-none">
        <ButterflyCollection onButterflyCaught={handleButterflyCaught} />
      </div>

      {/* Snow ground (foreground overlay) */}
      <div className="absolute inset-0 z-5">
        <SnowGround variant="rolling" />
      </div>

      {/* Vignette effect for depth */}
      <div
        className="absolute inset-0 z-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%)'
        }}
      />
    </div>
  );
}
