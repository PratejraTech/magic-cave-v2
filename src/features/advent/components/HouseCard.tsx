import { useState, useRef, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { gsap } from 'gsap';
import { CalendarDay } from '../../../types/calendar';
import { ConfettiSystem } from '../utils/ConfettiSystem';
import { SoundManager } from '../utils/SoundManager';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

interface HouseCardProps {
  day: CalendarDay;
  onOpen: (dayId: number) => void;
  canOpen: boolean;
  isBeforeDecember?: boolean;
  shouldForceUnlock?: boolean;
  isNextDay?: boolean;
}

export function HouseCard({ day, onOpen, canOpen, isBeforeDecember = false, shouldForceUnlock = false, isNextDay = false }: HouseCardProps) {
  const [isOpened, setIsOpened] = useState(day.is_opened);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');
  const doorRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
  }, [soundManager]);

  // Sync isOpened state when day.is_opened prop changes
  useEffect(() => {
    setIsOpened(day.is_opened);
  }, [day.is_opened]);

  // Countdown timer for the next tile to open
  useEffect(() => {
    if (!isNextDay || shouldForceUnlock) return; // Don't show countdown for guests or force unlock

    const calculateTimeUntilNext = () => {
      const ADELAIDE_TIMEZONE = 'Australia/Adelaide';
      const now = new Date();
      const adelaideTime = toZonedTime(now, ADELAIDE_TIMEZONE);
      
      // Get date components in Adelaide timezone
      const year = adelaideTime.getFullYear();
      const month = adelaideTime.getMonth();
      const day = adelaideTime.getDate();
      
      // Create a date representing tomorrow at midnight in Adelaide timezone
      // We create it as if it's in local time, then use fromZonedTime to interpret it as Adelaide time
      const tomorrowMidnightAdelaide = new Date(year, month, day + 1, 0, 0, 0, 0);
      
      // Convert from Adelaide timezone to UTC for accurate calculation
      const nextMidnightUTC = fromZonedTime(tomorrowMidnightAdelaide, ADELAIDE_TIMEZONE);

      const diff = nextMidnightUTC.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeUntilNext('00:00:00');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeUntilNext(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    calculateTimeUntilNext();
    const interval = setInterval(calculateTimeUntilNext, 1000);
    return () => clearInterval(interval);
  }, [isNextDay, shouldForceUnlock]); // Include shouldForceUnlock in dependencies

  const handleClick = async () => {
    if (!canOpen || isOpened) return;

    try {
      soundManager.duckMusic(2000);
      soundManager.play('door-creak');
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }

    // Ensure onOpen is called even if animations fail
    let animationCompleted = false;
    const openModal = () => {
      if (!animationCompleted) {
        animationCompleted = true;
        setIsOpened(true);
        onOpen(day.id);
      }
    };

    try {
      // GSAP explosive sequence
      const tl = gsap.timeline();
      tl.to(doorRef.current, {
        scale: 1.5,
        rotation: 5,
        duration: 0.3,
        ease: "back.out(1.7)",
        yoyo: true,
        repeat: 3
      })
      .to(doorRef.current, {
        scale: 2,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
      }, "-=0.2")
      .call(() => {
        try {
          soundManager.play('magical-ding');
          const confettiTypeMap: Record<string, 'snow' | 'stars' | 'candy' | 'reindeer'> = {
            snow: 'snow',
            stars: 'stars',
            hearts: 'candy',
            celebration: 'stars'
          };
          ConfettiSystem.burst({
            type: confettiTypeMap[day.confettiType || 'snow'] || 'snow',
            count: 100,
            origin: { x: 0.5, y: 0.3 }
          });
          soundManager.play('confetti-burst');
        } catch (error) {
          console.warn('Effects failed:', error);
        }
        openModal();
      });

      // Framer Motion for smooth reveal
      await controls.start({
        rotateY: 180,
        transition: { duration: 0.8, ease: "easeInOut" }
      });
      
      // Reset rotation after animation completes to prevent text reversal
      // Small delay ensures animation fully completes before reset
      setTimeout(() => {
        controls.start({
          rotateY: 0,
          transition: { duration: 0 }
        });
      }, 100);
    } catch (error) {
      console.warn('Animation failed, opening modal anyway:', error);
      // Fallback: open modal immediately if animations fail
      openModal();
    }
  };

  return (
    <motion.div
      ref={doorRef}
      className="w-full cursor-pointer flex justify-center relative"
      style={{ 
        transformStyle: 'preserve-3d',
        // Reset rotation for opened tiles to prevent text reversal
        ...(isOpened && { rotateY: 0 })
      }}
      animate={isOpened ? { rotateY: 0 } : controls}
      whileHover={{ scale: canOpen && !isOpened ? 1.1 : 1 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      data-testid={`day-${day.id}`}
    >
      {/* Patience bubble for any day before December when force unlock is false */}
      {isBeforeDecember && !shouldForceUnlock && (
        <motion.div
          className="absolute -top-24 sm:-top-28 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 sm:px-6 sm:py-4 shadow-lg border-4 border-pink-300">
            <p className="text-sm sm:text-base md:text-lg font-semibold text-pink-600 whitespace-nowrap">
              be patient, it&apos;s almost december!
            </p>
            {/* Arrow pointing down */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] sm:border-l-[16px] sm:border-r-[16px] sm:border-t-[16px] border-l-transparent border-r-transparent border-t-pink-300"></div>
            </div>
            {/* Pulse animation */}
            <motion.div
              className="absolute inset-0 rounded-lg"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(255, 105, 180, 0.4)',
                  '0 0 0 4px rgba(255, 105, 180, 0)',
                  '0 0 0 0 rgba(255, 105, 180, 0)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </div>
        </motion.div>
      )}
      {!isOpened ? (
        <div
          className={`house-door w-20 h-20 sm:w-24 sm:h-24 rounded-lg shadow-lg border-2 sm:border-4 border-white relative overflow-hidden ${
            !canOpen ? 'opacity-50 grayscale' : ''
          }`}
          style={{
            background: 'linear-gradient(145deg, #FF69B4, #FFD700)',
            boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.3)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-lg"></div>
          <div className="absolute inset-1 sm:inset-2 flex items-center justify-center">
            <span className="text-lg sm:text-2xl font-bold text-white drop-shadow-lg">
              {day.id}
            </span>
          </div>
          {canOpen && !day.is_opened && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-bounce">
              <span className="text-xs">✨</span>
            </div>
          )}
          {isNextDay && timeUntilNext && !shouldForceUnlock && (
            <div className="absolute inset-0 flex items-end justify-center pb-1">
              <span className="text-xs font-mono text-white bg-black/60 px-1 rounded">
                {timeUntilNext}
              </span>
            </div>
          )}
        </div>
      ) : (
        <motion.div
          className="house-opened w-32 h-32 rounded-lg shadow-xl overflow-hidden relative"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          style={{
            background: 'linear-gradient(145deg, #FFD700, #FF69B4)',
            boxShadow: '0 12px 24px rgba(0,0,0,0.4), inset 0 4px 8px rgba(255,255,255,0.4)'
          }}
        >
          <img
            src={day.photo_url}
            alt={`Day ${day.id}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
            <p className="text-xs text-white text-center font-semibold">
              {day.title || `Day ${day.id}`}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/20 to-transparent animate-pulse"></div>
        </motion.div>
      )}
    </motion.div>
  );
}
