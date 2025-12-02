import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { MouseEvent, TouchEvent } from 'react';
import type { CalendarDay } from '../../../types/advent';

interface MemoryModalProps {
  isOpen: boolean;
  day: CalendarDay | null;
  onNext?: () => void;
  onClose?: () => void;
  isBeforeDecember?: boolean; // Kept for backward compatibility but no longer used
}

export function MemoryModal({ isOpen, day, onNext, onClose }: MemoryModalProps) {
  const heroName = day?.title ?? (day ? `Day ${day.id}` : '');
  const heroNickname = heroName.split(' ')[0] ?? (day ? `Day ${day.id}` : '');
  const subtitleText = (() => {
    if (day?.subtitle && day.subtitle.trim().length > 0) {
      return day.subtitle;
    }
    return `Butterflies whisper that ${heroNickname} is loved beyond the stars.`;
  })();
  
  // Calculate body text but don't render immediately
  const bodyText = (() => {
    // Always show Body text if available, regardless of date
    if (day?.message && day.message.trim().length > 0) {
      return day.message;
    }
    if (day) {
      return `Daddy is preparing a cozy memory for day ${day.id}.`;
    }
    return '';
  })();
  
  // State to control when text is displayed (after modal animation completes)
  const [displayedBodyText, setDisplayedBodyText] = useState('');
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // Delay text rendering until after modal rotation animation fully completes
  useEffect(() => {
    if (isOpen && bodyText) {
      // Reset states when modal opens
      setIsAnimationComplete(false);
      setDisplayedBodyText('');
      
      // Wait for the spring animation to complete (rotateX animation)
      // Spring animation with stiffness: 220, damping: 26 typically takes ~600-800ms
      const animationTimer = setTimeout(() => {
        setIsAnimationComplete(true);
        // Render text fresh after animation completes to prevent backwards rendering
        setDisplayedBodyText('');
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setDisplayedBodyText(bodyText);
          });
        });
      }, 800); // Wait for spring animation to fully complete
      
      return () => clearTimeout(animationTimer);
    } else {
      // Clear text immediately when modal closes
      setIsAnimationComplete(false);
      setDisplayedBodyText('');
    }
  }, [isOpen, bodyText]);

  const handleDownload = () => {
    if (!day) return;
    const link = document.createElement('a');
    link.href = day.photo_url;
    link.download = `harper-day-${day.id.toString().padStart(2, '0')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOverlayInteraction = () => {
    onClose?.();
  };

  const stopPropagation = (event: MouseEvent | TouchEvent) => {
    event.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && day && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleOverlayInteraction}
          onTouchStart={handleOverlayInteraction}
        >
          <motion.div
            className="relative max-w-3xl w-full bg-white/95 rounded-3xl overflow-hidden shadow-[0_25px_60px_rgba(69,255,255,0.45)]"
            role="dialog"
            aria-modal="true"
            onClick={stopPropagation}
            onTouchStart={stopPropagation}
            initial={{ scale: 0.85, rotateX: -8, opacity: 0 }}
            animate={{ scale: 1, rotateX: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            style={{ 
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'visible',
              WebkitBackfaceVisibility: 'visible'
            }}
          >
            <div className="grid md:grid-cols-2 gap-0">
              <motion.div
                className="relative h-64 md:h-full"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              >
                <img
                  src={day.photo_url}
                  alt={day.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/40 via-transparent to-transparent" />
                <div className="absolute top-4 left-4 bg-white/85 rounded-full px-4 py-2 font-bold text-pink-500 text-sm shadow-md">
                  Day {day.id}
                </div>
                {onClose && (
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur-sm hover:scale-105 transition"
                    aria-label="Close memory"
                  >
                    Esc
                  </button>
                )}
              </motion.div>
              <div 
                className="p-6 md:p-8 space-y-4"
                style={{
                  transform: 'none',
                  transformStyle: 'flat',
                  backfaceVisibility: 'visible',
                  WebkitBackfaceVisibility: 'visible'
                }}
              >
                <p className="text-xs uppercase tracking-[0.5em] text-pink-400">memory unlocked</p>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-fuchsia-500 to-sky-500">
                  {heroName}
                </h2>
                <p className="text-sm text-rose-400 font-semibold min-h-[24px]">
                  {subtitleText}
                </p>
                <motion.p
                  className="text-slate-600 leading-relaxed text-lg min-h-[120px]"
                  dir="ltr"
                  style={{ 
                    direction: 'ltr', 
                    textAlign: 'left', 
                    transform: 'none',
                    backfaceVisibility: 'visible',
                    WebkitBackfaceVisibility: 'visible',
                    perspective: 'none',
                    transformStyle: 'flat'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isAnimationComplete && displayedBodyText ? 1 : 0 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  key={`body-${day.id}-${displayedBodyText.slice(0, 10)}-${isAnimationComplete}`}
                >
                  {displayedBodyText}
                </motion.p>
                <div className="flex flex-wrap gap-3 pt-4">
                  {onNext && (
                    <button
                      onClick={onNext}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-white font-semibold shadow-lg shadow-cyan-300/40 hover:scale-105 transition"
                    >
                      Next Memory
                      <span aria-hidden="true">🦋</span>
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white text-slate-800 font-semibold shadow-md hover:shadow-lg border border-slate-200"
                  >
                    Download Photo
                    <span aria-hidden="true">⬇️</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
