import { useCallback, useEffect, useMemo, useState } from 'react';
import { VillageScene } from './features/advent/components/VillageScene';
import { MusicPlayer } from './components/MusicPlayer';
import { playThemeAtRandomPoint } from './lib/musicTheme';
import { adventMemories } from './data/adventMemories';
import type { AdventDay } from './types/advent';
import { seedImageStore, getImageForDay } from './lib/localImageStore';
import { loadOpenedDayMap, persistOpenedDay } from './lib/openedDaysStorage';
import { MemoryModal } from './features/advent/components/MemoryModal';
import { DecemberBubble } from './features/advent/components/DecemberBubble';
import { PastMemoryCarousel } from './features/advent/components/PastMemoryCarousel';
import { SurprisePortal } from './features/advent/components/SurprisePortal';
import { ChatWithDaddy } from './features/chat/ChatWithDaddy';
import { SoundManager } from './features/advent/utils/SoundManager';
import { getAdelaideDate } from './lib/date';
import { LoveNote } from './features/advent/components/LoveNote';
import { SubstackLetterModal } from './features/advent/components/SubstackLetterModal';
import { VideoSelectionModal, type VideoOption } from './components/VideoSelectionModal';
import {
  getOrCreateSession,
  getOpenedTilesCount,
  incrementOpenedTilesCount,
  setOpenedTilesCount,
  getMaxOpenableTiles,
  updateLastActive,
  initializeCookieVersioning,
  isHarperSession,
  setHarperSession,
  isGuestSession,
  setGuestSession,
  setSessionToken,
  setStoredSessionId,
  getStoredSessionId,
} from './lib/cookieStorage';
import { hashString, normalizeBirthdateInput } from './lib/hashUtils';
import { logSessionEvent, EventTypes } from './lib/sessionEventLogger';
import { WelcomeModal } from './components/WelcomeModal';

const ACCESS_PHRASE = 'grace janin';
const GUEST_PHRASE = 'guestmoir';
const MOIR_GUEST_PHRASE = 'moirguest'; // Alternative guest code that bypasses standard operations
const requiresAccessCode = String(
  import.meta.env.VITE_REQUIRE_CODE ?? (import.meta.env.MODE === 'production' ? 'true' : 'false')
).toLowerCase() === 'true';

function App() {
  const [days, setDays] = useState<AdventDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<AdventDay | null>(null);
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [isBeforeDecember, setIsBeforeDecember] = useState(false);
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(!requiresAccessCode);
  const [codeAttempt, setCodeAttempt] = useState('');
  const [birthdateAttempt, setBirthdateAttempt] = useState('');
  const [authError, setAuthError] = useState('');
  const soundManager = SoundManager.getInstance();
  const forceUnlock =
    String(import.meta.env.VITE_FORCE_UNLOCK ?? import.meta.env.FORCE_UNLOCK ?? '').toLowerCase() === 'true';
  const [currentSurpriseUrl, setCurrentSurpriseUrl] = useState<string | null>(null);
  const [lastSurpriseUrl, setLastSurpriseUrl] = useState<string | null>(null);
  const [isVideosOpen, setIsVideosOpen] = useState(false);
  const [isVideosModalOpen, setIsVideosModalOpen] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [, setLastVideoUrl] = useState<string | null>(null);
  const [isSubstackLetterOpen, setIsSubstackLetterOpen] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const sortOpenedDays = useCallback((opened: AdventDay[]) => {
    return [...opened].sort((a, b) => {
      if (a.opened_at && b.opened_at) {
        return a.opened_at.localeCompare(b.opened_at);
      }
      if (a.opened_at) return -1;
      if (b.opened_at) return 1;
      return a.id - b.id;
    });
  }, []);

  useEffect(() => {
    const init = () => {
      // Initialize cookie versioning system first to ensure version tracking
      initializeCookieVersioning();
      
      // Check if this is a guest session
      const guestMode = isGuestSession();
      
      seedImageStore(adventMemories);
      const openedMap = loadOpenedDayMap();

      // Check if it's after December 25th - if so, all tiles should be open
      const adelaideDate = getAdelaideDate();
      const isAdelaideDecember = adelaideDate.getMonth() === 11;
      const isAfterDecember25 = isAdelaideDecember && adelaideDate.getDate() > 25;

      // Initialize session and cookie-based state if not in force unlock mode
      if (!forceUnlock) {
        getOrCreateSession(); // Create session if needed
        // Show welcome modal only for Harper (not guests) when not in force unlock mode
        if (isAuthorized && isHarperSession() && !isGuestSession()) {
          setShowWelcomeModal(true);
        }
        // Update last_active timestamp
        updateLastActive();
        
        if (isAfterDecember25) {
          // After December 25th, session is complete - set opened tiles count to 25
          const currentCount = getOpenedTilesCount();
          if (currentCount < 25) {
            setOpenedTilesCount(25);
          }
        } else {
          // Sync tiles_open count from localStorage if cookie count is 0 but tiles exist
          const cookieCount = getOpenedTilesCount();
          const localStorageCount = Object.keys(openedMap).length;
          if (cookieCount === 0 && localStorageCount > 0) {
            // Restore cookie count from localStorage
            setOpenedTilesCount(localStorageCount);
          }
        }
      }
      
      const preparedDays: AdventDay[] = adventMemories.map((memory) => {
        const assignedPhoto = memory.photoPath ?? getImageForDay(memory.id, memory.palette);
        // Guest mode: all tiles are openable (like force unlock)
        // Force unlock: tiles not marked as opened (for testing)
        // Normal mode: use openedMap
        let openedAt = (forceUnlock || guestMode) ? null : openedMap[memory.id] ?? null;
        
        // After December 25th, mark all tiles as opened if not already opened (but not for guests or force unlock)
        if (!forceUnlock && !guestMode && isAfterDecember25 && !openedAt) {
          openedAt = new Date().toISOString();
          // Persist the opened day
          persistOpenedDay(memory.id, openedAt);
        }
        
        // Guest mode: all tiles appear openable (but not pre-opened)
        // Force unlock: tiles not pre-opened (for testing)
        // Normal mode: check openedAt or after Dec 25
        const isOpened = forceUnlock 
          ? false 
          : guestMode 
          ? false // Guest can open any tile, but they start closed
          : (isAfterDecember25 ? true : Boolean(openedAt));
        
        return {
          id: memory.id,
          title: memory.title,
          subtitle: memory.subtitle ?? 'Daddy Loves You!',
          message: memory.message,
          photo_url: assignedPhoto,
          is_opened: isOpened,
          opened_at: openedAt,
          created_at: new Date(Date.UTC(2023, 11, memory.id)).toISOString(),
          confettiType: memory.confettiType,
          unlockEffect: memory.unlockEffect,
          musicUrl: memory.musicUrl,
          voiceUrl: memory.voiceUrl,
          photoMarkdownPath: memory.photoMarkdownPath ?? null,
          photoMarkdownTitle: memory.photoMarkdownTitle ?? null,
        };
      });

      setDays(preparedDays);
      setLoading(false);
    };

    init();
  }, [sortOpenedDays, forceUnlock, isAuthorized]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMemoryOpen(false);
        setSelectedDay(null);
        setIsSurpriseOpen(false);
        setIsChatOpen(false);
        setIsVideosOpen(false);
        setIsVideosModalOpen(false);
        setIsSubstackLetterOpen(false);
        setShowWelcomeModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (!requiresAccessCode || typeof window === 'undefined') return;
    
    // Check if we have a valid session token (already authenticated)
    const sessionId = getStoredSessionId();
    if (sessionId) {
      setIsAuthorized(true);
      // Check session type
      if (isHarperSession()) {
        console.log('Harper\'s validated session detected - restoring state');
      } else if (isGuestSession()) {
        console.log('Guest session detected - full access enabled');
      }
      // Clean URL if it has old query parameters
      if (window.location.search) {
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);


  const handleCodeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAuthError('');
    
    const codeLower = codeAttempt.trim().toLowerCase();
    const showBirthdateField = codeLower === ACCESS_PHRASE;
    const isGuestCode = codeLower === GUEST_PHRASE || codeLower === MOIR_GUEST_PHRASE;
    const hasBirthdate = birthdateAttempt.trim() !== '';
    
    // If showing birthdate field but no birthdate entered, wait
    if (showBirthdateField && !hasBirthdate) {
      return; // Don't submit yet, wait for birthdate
    }
    
    try {
      // Hash the code (always use lowercase for consistent hashing)
      // This ensures "guestMoir", "GUESTMOIR", "guestmoir" all produce the same hash
      const codeHash = await hashString(codeLower);
      
      let birthdateHash = null;
      if (hasBirthdate) {
        const normalizedDate = normalizeBirthdateInput(birthdateAttempt);
        birthdateHash = await hashString(normalizedDate);
        // Debug logging (can be removed in production)
        console.log('Birthdate validation:', {
          input: birthdateAttempt,
          normalized: normalizedDate,
          hash: birthdateHash.substring(0, 8) + '...'
        });
      }
      
      // Debug logging for guest codes
      if (isGuestCode) {
        console.log('Guest code validation:', {
          input: codeAttempt,
          normalized: codeLower,
          hash: codeHash.substring(0, 8) + '...'
        });
      }
      
      // Call session-auth API
      const API_BASE = import.meta.env.VITE_CHAT_API_URL || import.meta.env.CHAT_API_URL || (import.meta.env.PROD ? '' : 'https://toharper.dad');
      const SESSION_AUTH_ENDPOINT = API_BASE 
        ? `${API_BASE.replace(/\/$/, '')}/api/session-auth`
        : '/api/session-auth';
      
      const response = await fetch(SESSION_AUTH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          codeHash,
          birthdateHash,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        if (data.requiresBirthdate) {
          // Need birthdate - show birthdate field
          return;
        }
        setAuthError(data.error || 'Hmm, that does not sound right. Try again!');
        return;
      }
      
      // Authentication successful
      const { sessionToken, sessionId, userType } = data;
      
      // Store session token and ID
      setSessionToken(sessionToken);
      setStoredSessionId(sessionId);
      
      // Set session type flags
      if (userType === 'harper') {
        setHarperSession(true);
        setGuestSession(false);
        console.log('Harper validated - session will persist opened tiles');
      } else if (userType === 'guest') {
        setGuestSession(true);
        setHarperSession(false);
        console.log('Guest session activated - full access enabled');
      } else {
        setHarperSession(false);
        setGuestSession(false);
        console.log('Normal session authenticated');
      }
      
      // Log authentication event
      await logSessionEvent(EventTypes.AUTH, { userType });
      
      // Clean URL - remove any query parameters
      window.history.replaceState(null, '', window.location.pathname);
      
      // Authorize and close modal
      setIsAuthorized(true);
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('Something went wrong. Please try again.');
    }
  };

  const handleOpenDay = async (dayId: number) => {
    // Only apply date restrictions to Harper (not guests or normal users)
    // Guests get full access, Harper gets date-based restrictions when VITE_FORCE_UNLOCK is false
    const isHarper = isHarperSession();
    const guestMode = isGuestSession();
    
    // Apply restrictions only to Harper when not in force unlock mode
    if (!forceUnlock && isHarper && !guestMode) {
      const adelaideDate = getAdelaideDate();
      const isAdelaideDecember = adelaideDate.getMonth() === 11;
      const isAfterDecember25 = isAdelaideDecember && adelaideDate.getDate() > 25;
      
      // After December 25th, all tiles can be opened (session complete)
      if (!isAfterDecember25) {
        const openedCount = getOpenedTilesCount();
        const maxOpenable = getMaxOpenableTiles(getAdelaideDate);
        
        // Check if user has exceeded the limit
        if (openedCount >= maxOpenable) {
          console.warn(`Cannot open tile ${dayId}: Already opened ${openedCount} tiles, maximum is ${maxOpenable}`);
          return;
        }
        
        // Check if this specific tile can be opened (must be <= current day in December)
        if (isAdelaideDecember && dayId > adelaideDate.getDate()) {
          console.warn(`Cannot open tile ${dayId}: Current day is ${adelaideDate.getDate()}, can only open up to day ${adelaideDate.getDate()}`);
          return;
        }
      }
    }

    const openedAt = new Date().toISOString();
    if (!forceUnlock) {
      persistOpenedDay(dayId, openedAt);
      incrementOpenedTilesCount();
      
      // Log tile open event
      await logSessionEvent(EventTypes.TILE_OPEN, { dayId, openedAt });
    }

    // Check if it's before December
    const adelaideDate = getAdelaideDate();
    const isAdelaideDecember = adelaideDate.getMonth() === 11;
    const isBeforeDecember = !isAdelaideDecember;

    let openedDay: AdventDay | null = null;
    setDays((prevDays) =>
      prevDays.map((day) => {
        if (day.id === dayId) {
          openedDay = { ...day, is_opened: true, opened_at: openedAt };
          return openedDay;
        }
        return day;
      })
    );

    // Open modal for any opened day
    if (openedDay) {
      setSelectedDay(openedDay);
      setIsBeforeDecember(isBeforeDecember);
      setIsMemoryOpen(true);
    }
  };

  const handleCloseMemory = () => {
    setIsMemoryOpen(false);
    setSelectedDay(null);
  };

  const openedMemories = useMemo(
    () => sortOpenedDays(days.filter((day) => day.is_opened)),
    [days, sortOpenedDays]
  );

  const surpriseOptions = useMemo(
    () =>
      adventMemories
        .map((memory) => memory.surpriseVideoUrl)
        .filter((url): url is string => Boolean(url)),
    []
  );

  const videoOptions = useMemo(
    () => [
      'https://www.youtube.com/embed/-Qt9OdhbVBQ',
      'https://www.youtube.com/embed/yRSVkNK3zaM',
      'https://www.youtube.com/embed/gE-dmCYBYqk',
      'https://www.youtube.com/embed/vyqMf_CJjPU',
      'https://www.youtube.com/shorts/_XTMO_xS-cI',
      'https://www.youtube.com/shorts/lG66BRozNFc',
      'https://www.youtube.com/shorts/KYVP8pNMR7M',
      'https://youtube.com/shorts/8qLZITVAF1E?feature=share',
      'https://youtube.com/shorts/dfwXugwfBbs?feature=share',
      'https://youtube.com/shorts/1tgxn89aMbE?feature=share',
    ],
    []
  );

  // Convert videoOptions to VideoOption structure with titles
  const videoOptionsWithMetadata = useMemo(
    () =>
      videoOptions.map((url, index) => {
        // Extract video ID for thumbnail
        const videoIdMatch = url.match(/(?:embed|shorts)\/([^?&\/\s]{11})/);
        const videoId = videoIdMatch ? videoIdMatch[1] : '';
        
        return {
          id: `video-${index + 1}`,
          url,
          title: `Video ${index + 1}`,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined,
        };
      }),
    [videoOptions]
  );

  const openRandomSurprise = async () => {
    if (surpriseOptions.length === 0) return;
    soundManager.pauseMusic();
    
    // Filter out the last played surprise to ensure a different one is selected
    const availableOptions = lastSurpriseUrl
      ? surpriseOptions.filter((url) => url !== lastSurpriseUrl)
      : surpriseOptions;
    
    // If all options were filtered out (edge case), use all options
    const optionsToChooseFrom = availableOptions.length > 0 ? availableOptions : surpriseOptions;
    
    const nextUrl = optionsToChooseFrom[Math.floor(Math.random() * optionsToChooseFrom.length)];
    setCurrentSurpriseUrl(nextUrl);
    setIsSurpriseOpen(true);
    
    // Log surprise event
    await logSessionEvent(EventTypes.SURPRISE, { videoUrl: nextUrl });
  };

  const closeSurprise = () => {
    // Store current surprise URL as last played before clearing
    if (currentSurpriseUrl) {
      setLastSurpriseUrl(currentSurpriseUrl);
    }
    setIsSurpriseOpen(false);
    setCurrentSurpriseUrl(null);
    soundManager.resumeMusic();
  };

  const handleSelectVideo = async (video: VideoOption) => {
    soundManager.pauseMusic();
    setCurrentVideoUrl(video.url);
    setIsVideosModalOpen(false);
    setIsVideosOpen(true);
    
    // Log video event
    await logSessionEvent(EventTypes.VIDEO, { videoUrl: video.url, videoTitle: video.title });
  };

  const closeVideos = () => {
    // Store current video URL as last played before clearing
    if (currentVideoUrl) {
      setLastVideoUrl(currentVideoUrl);
    }
    setIsVideosOpen(false);
    setCurrentVideoUrl(null);
    soundManager.resumeMusic();
  };

  const ensureMusicPlaying = () => {
    soundManager.init().then(() => {
      const startMusic = async () => {
        try {
          if (!soundManager.isMusicPlaying()) {
            await playThemeAtRandomPoint(soundManager);
          } else {
            await playThemeAtRandomPoint(soundManager);
          }
        } catch {
          // Autoplay prevented; will retry on next interaction
        }
      };
      startMusic();
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lavender-100 via-sky-100 to-orange-100">
        <div
          className="clay-card rounded-[20px] px-8 py-6 text-2xl font-bold"
          style={{
            background: 'linear-gradient(145deg, #e8d5f2, #d4e8f7)',
            boxShadow: '8px 8px 16px #b8a8c4, -8px -8px 16px #ffffff',
          }}
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
            Loading magic...
          </span>
        </div>
      </div>
    );
  }

  if (requiresAccessCode && !isAuthorized) {
    const codeLower = codeAttempt.trim().toLowerCase();
    const showBirthdateField = codeLower === ACCESS_PHRASE;
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 via-sky-100 to-amber-100 p-4 sm:p-6 text-center">
        <form
          onSubmit={handleCodeSubmit}
          className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg space-y-4 mx-4"
        >
          <h1 className="text-xl sm:text-2xl font-extrabold text-pink-500">
            {showBirthdateField ? 'What is your birthdate?' : 'What is your Middle and Last Name?'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 px-2">
            {showBirthdateField 
              ? 'Please enter your birthdate so we can remember your progress.'
              : 'Please share the secret codeword so Daddy can open the village.'}
          </p>
          
          {!showBirthdateField && (
            <input
              type="text"
              value={codeAttempt}
              onChange={(event) => {
                setCodeAttempt(event.target.value);
                setAuthError(''); // Clear error when typing
              }}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              placeholder="Type it here"
              autoFocus
              autoComplete="off"
            />
          )}
          
          {showBirthdateField && (
            <>
              <input
                type="text"
                value={birthdateAttempt}
                onChange={(event) => {
                  setBirthdateAttempt(event.target.value);
                  setAuthError(''); // Clear error when typing
                }}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="DD/MM/YYYY"
                autoFocus
                autoComplete="off"
                inputMode="numeric"
              />
              <p className="text-xs text-slate-400 text-left px-1">
                Format: DD/MM/YYYY
              </p>
            </>
          )}
          
          {authError && <p className="text-pink-600 text-sm px-2">{authError}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 text-white font-semibold py-3 sm:py-4 text-base sm:text-lg shadow-lg hover:scale-105 active:scale-95 transition-transform touch-manipulation"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <VillageScene days={days} onOpenDay={handleOpenDay} isGuest={isGuestSession()} />
      <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 max-w-[calc(100vw-1rem)] sm:max-w-xs max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] overflow-auto p-1 sm:p-2">
        <div className="grid grid-cols-1 gap-2 sm:gap-4 items-start">
          <LoveNote />
        </div>
      </div>
      <PastMemoryCarousel memories={openedMemories} currentOpenDayId={selectedDay?.id ?? null} />
      <DecemberBubble forceUnlock={forceUnlock} />
      <MemoryModal isOpen={isMemoryOpen} day={selectedDay} onClose={handleCloseMemory} isBeforeDecember={isBeforeDecember} />
      <div className="fixed bottom-2 left-2 sm:bottom-4 sm:left-4 z-40">
        <MusicPlayer />
      </div>
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 z-40 w-[calc(100vw-1rem)] sm:w-full sm:max-w-3xl px-2 sm:px-4">
        {/* Sparkle text centered over Surprise button */}
        <div className="grid grid-cols-3 gap-3 mb-1">
          <div />
          <p
            className="text-center text-sm font-bold text-yellow-300 drop-shadow-lg"
            style={{ animation: 'sparkle 1.5s ease-in-out infinite' }}
          >
            Click Me Lots
          </p>
          <div />
        </div>
        <div className="grid grid-cols-3 gap-3 items-center">
          <button
            onClick={() => {
              ensureMusicPlaying();
              setIsSubstackLetterOpen(true);
            }}
            className="px-2 py-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition text-xs"
          >
            To Harper {'<3'}
          </button>
          <button
            onClick={() => {
              ensureMusicPlaying();
              openRandomSurprise();
            }}
            className="px-2 py-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition text-xs"
          >
            Surprise!
          </button>
          <button
            onClick={() => {
              ensureMusicPlaying();
              setIsVideosModalOpen(true);
            }}
            className="px-2 py-2 rounded-full bg-gradient-to-r from-amber-400 to-pink-500 text-white font-semibold shadow-lg hover:scale-105 transition text-xs"
          >
            Videos
          </button>
        </div>
      </div>
      <SurprisePortal isOpen={isSurpriseOpen} videoUrl={currentSurpriseUrl} onClose={closeSurprise} />
      <SurprisePortal isOpen={isVideosOpen} videoUrl={currentVideoUrl} onClose={closeVideos} />
      <VideoSelectionModal
        isOpen={isVideosModalOpen}
        videos={videoOptionsWithMetadata}
        onSelectVideo={handleSelectVideo}
        onClose={() => setIsVideosModalOpen(false)}
      />
      <ChatWithDaddy isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <SubstackLetterModal
        isOpen={isSubstackLetterOpen}
        onClose={() => setIsSubstackLetterOpen(false)}
        onStartChat={() => {
          setIsSubstackLetterOpen(false);
          ensureMusicPlaying();
          setIsChatOpen(true);
        }}
      />
      <WelcomeModal isOpen={showWelcomeModal} onClose={() => setShowWelcomeModal(false)} />
    </div>
  );
}

export default App;
