import { useEffect, useState } from 'react';
import { CalendarDay } from '../../../types/calendar';
import { HouseCard } from './HouseCard';
import { Snowfall } from './Snowfall';
import { NorthernLights } from './NorthernLights';
import { FloatingFireflies } from './FloatingFireflies';
import { ButterflyCollection } from './ButterflyCollection';
import { SoundManager } from '../utils/SoundManager';
import { getAdelaideDate } from '../../../lib/date';
import { EnchantedBackground } from './EnchantedBackground';

interface VillageSceneProps {
  days: CalendarDay[];
  onOpenDay: (dayId: number) => void;
  isGuest?: boolean;
}

const shouldForceUnlock =
  import.meta.env.DEV ||
  String(import.meta.env.VITE_FORCE_UNLOCK ?? import.meta.env.FORCE_UNLOCK ?? '').toLowerCase() === 'true';

export function VillageScene({ days, onOpenDay, isGuest = false }: VillageSceneProps) {
  const [collectedButterflies, setCollectedButterflies] = useState<string[]>([]);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
    // Load some basic sounds
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
  const allowDevUnlocks = shouldForceUnlock || isGuest; // Guest mode unlocks all tiles
  const isBeforeDecember = !isAdelaideDecember;
  // Next day to open: tomorrow in December (if before Dec 25), or day 1 before December
  // After December 25th, no next day (all tiles are open)
  const nextDay = isAfterDecember25 ? null : (isAdelaideDecember ? currentAdelaideDay + 1 : 1);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-[#02030a] via-[#080f1f] to-[#0d0420] relative overflow-hidden border border-white/15 rounded-[16px] sm:rounded-[24px] md:rounded-[32px] m-1 sm:m-2 md:m-6 shadow-[0_25px_60px_rgba(0,0,0,0.55)]"
      data-testid="village-scene"
    >
      {/* Background effects */}
      <EnchantedBackground />
      <Snowfall />
      <NorthernLights />
      <FloatingFireflies />
      <ButterflyCollection onButterflyCaught={handleButterflyCaught} />

      {/* Main content */}
      <div className="relative z-10 p-2 sm:p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4 sm:mb-8 space-y-2 sm:space-y-4">
            <p className="uppercase text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.4em] text-[#ff7be0] font-semibold px-2">
              welcome to
            </p>
            <div className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-[20px] sm:rounded-[30px] border border-white/20 bg-white/5 backdrop-blur-sm shadow-[0_20px_45px_rgba(0,255,255,0.15)]">
              <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-amber-200 drop-shadow-[0_0_25px_rgba(255,0,200,0.45)] px-2">
                Family Calendar
              </h1>
            </div>
            <p className="text-cyan-200 font-medium mt-2 text-xs sm:text-sm md:text-base px-4">
              Discover daily surprises and create lasting memories together.
            </p>
          </div>
          {collectedButterflies.length > 0 && (
            <p className="text-center text-pink-300 font-semibold mb-6">
              Butterflies collected: {collectedButterflies.length}
            </p>
          )}

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4 md:gap-6">
            {days.map((day) => {
              // Guests and force unlock: all tiles can be opened
              // After December 25th: all tiles can be opened (session complete)
              // In December: only tiles <= current day can be opened
              const canOpen =
                allowDevUnlocks || isAfterDecember25 || (isAdelaideDecember && currentAdelaideDay >= day.id);

              // isNextDay: true when this is the next day to open AND user can't open it yet
              // Only show countdown for authenticated users (not guests or force unlock)
              const isNextDay = nextDay !== null && day.id === nextDay && !canOpen && !allowDevUnlocks;
              
              return (
                <HouseCard
                  key={day.id}
                  day={day}
                  onOpen={onOpenDay}
                  canOpen={canOpen}
                  isBeforeDecember={isBeforeDecember}
                  shouldForceUnlock={allowDevUnlocks}
                  isNextDay={isNextDay}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
