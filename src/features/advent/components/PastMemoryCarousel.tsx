import { useEffect, useState, useMemo, useRef } from 'react';
import type { AdventDay } from '../../../types/advent';

interface PastMemoryCarouselProps {
  memories: AdventDay[];
  rotationMs?: number;
  currentOpenDayId?: number | null;
}

const VISIBILITY_INTERVAL_MS = 10000; // Show every 10 seconds
const DISPLAY_DURATION_MS = 3000; // Show for 3 seconds
const CACHE_KEY = 'past-memory-carousel-cache';

interface CachedMemory {
  memory: AdventDay;
  displayedAt: number;
  position: { top: string; left: string };
}

// Get cached messages from localStorage
const getCachedMemories = (): CachedMemory[] => {
  if (typeof window === 'undefined') return [];
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as CachedMemory[];
      // Filter out entries older than 1 hour
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      return parsed.filter((item) => item.displayedAt > oneHourAgo);
    }
  } catch {
    // Ignore cache errors
  }
  return [];
};

// Save memory to cache
const cacheMemory = (memory: AdventDay, position: { top: string; left: string }) => {
  if (typeof window === 'undefined') return;
  try {
    const cached = getCachedMemories();
    cached.push({
      memory,
      displayedAt: Date.now(),
      position,
    });
    // Keep only last 20 entries
    const trimmed = cached.slice(-20);
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore cache errors
  }
};

// Generate random position that avoids collision with open day
const generateRandomPosition = (_currentOpenDayId: number | null | undefined): { top: string; left: string } => {
  // Safe zones: avoid center area where calendar tiles are
  // Grid is roughly: 2-3 cols on mobile, 3-4 on tablet, 4-6 on desktop
  // Avoid center 40% of screen where tiles are most likely
  
  const minTop = 10; // 10% from top
  const maxTop = 60; // 60% from top (avoid bottom buttons)
  const minLeft = 5; // 5% from left
  const maxLeft = 85; // 85% from left (avoid right side buttons)
  
  const topPercent = Math.random() * (maxTop - minTop) + minTop;
  const leftPercent = Math.random() * (maxLeft - minLeft) + minLeft;
  
  return {
    top: `${topPercent}%`,
    left: `${leftPercent}%`,
  };
};

export function PastMemoryCarousel({ 
  memories, 
  rotationMs = 8000,
  currentOpenDayId = null 
}: PastMemoryCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<{ top: string; left: string }>({ top: '10%', left: '5%' });
  const visibilityTimeoutRef = useRef<number | null>(null);
  const hideTimeoutRef = useRef<number | null>(null);

  // Get cached memories
  const cachedMemories = useMemo(() => getCachedMemories(), []);

  // Select memory (prefer uncached ones, then rotate through all)
  const currentMemory = useMemo(() => {
    if (memories.length === 0) return null;
    
    // Get uncached memory IDs
    const cachedIds = new Set(cachedMemories.map((c) => c.memory.id));
    const uncached = memories.filter((m) => !cachedIds.has(m.id));
    
    // Prefer uncached memories, fallback to all memories
    const availableMemories = uncached.length > 0 ? uncached : memories;
    return availableMemories[index % availableMemories.length] ?? memories[0];
  }, [memories, index, cachedMemories]);

  useEffect(() => {
    if (memories.length === 0) {
      setIsVisible(false);
      return;
    }

    // Clear any existing timeouts
    if (visibilityTimeoutRef.current) {
      window.clearTimeout(visibilityTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    // Show carousel every 10 seconds
    const showCarousel = () => {
      // Generate new random position
      const newPosition = generateRandomPosition(currentOpenDayId);
      setPosition(newPosition);
      setIsVisible(true);
      
      // Cache the current memory
      if (currentMemory) {
        cacheMemory(currentMemory, newPosition);
      }

      // Hide after display duration
      hideTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, DISPLAY_DURATION_MS);

      // Schedule next appearance
      visibilityTimeoutRef.current = window.setTimeout(showCarousel, VISIBILITY_INTERVAL_MS);
    };

    // Start the cycle
    visibilityTimeoutRef.current = window.setTimeout(showCarousel, VISIBILITY_INTERVAL_MS);

    return () => {
      if (visibilityTimeoutRef.current) {
        window.clearTimeout(visibilityTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [memories, currentMemory, currentOpenDayId]);

  // Rotate through memories when visible
  useEffect(() => {
    if (!isVisible || memories.length <= 1) return;

    const interval = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % memories.length);
    }, rotationMs);

    return () => window.clearInterval(interval);
  }, [isVisible, memories.length, rotationMs]);

  if (memories.length === 0 || !currentMemory || !isVisible) {
    return null;
  }

  return (
    <div
      data-testid="past-memory-carousel"
      className="fixed z-50 pointer-events-none"
      style={{
        top: position.top,
        left: position.left,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="flex items-center gap-3 animate-in fade-in duration-300">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.45)] bg-black/40 backdrop-blur">
          <img
            src={currentMemory.photo_url}
            alt={currentMemory.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="max-w-[140px] rounded-2xl bg-white/85 text-slate-800 text-xs font-semibold shadow-lg p-2">
          {currentMemory.message}
        </div>
      </div>
    </div>
  );
}
