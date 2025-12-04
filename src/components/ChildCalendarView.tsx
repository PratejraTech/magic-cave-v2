import React, { useState, useEffect } from 'react';
import ChildCalendar from './ChildCalendar';
import TemplateErrorBoundary from './TemplateErrorBoundary';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { useEmotionalResponse } from '../lib/EmotionalBackground';
import { Gift, CalendarTile, GiftType, TemplateMetadata } from '../types/calendar';
import { applyTemplateStyling } from '../lib/templateStyling';

interface ChildCalendarViewProps {
  testMode?: boolean;
}

const ChildCalendarView: React.FC<ChildCalendarViewProps> = ({ testMode = false }) => {
  const { userType, isAuthenticated, child } = useAuth();
  const { triggerJoy, triggerCelebration, triggerAnticipation } = useEmotionalResponse();
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [celebrationMessage, setCelebrationMessage] = React.useState('');
  const [unlockedCount, setUnlockedCount] = React.useState(0);

  // Mock data for testing
  const mockTiles: CalendarTile[] = Array.from({ length: 25 }, (_, i) => ({
    tile_id: `tile-${i + 1}`,
    calendar_id: 'test-calendar',
    day: i + 1,
    title: i < 5 ? `Day ${i + 1} Message` : undefined,
    body: i < 5 ? `This is the message for day ${i + 1}` : undefined,
    media_url: i === 0 ? 'test-image.jpg' : undefined,
    gift: i < 3 ? {
      type: 'sticker' as GiftType,
      title: `Gift ${i + 1}`,
      description: `A special gift for day ${i + 1}`,
      sticker: '🎁'
    } : undefined,
    gift_unlocked: i < 2,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  const defaultTemplate: TemplateMetadata = {
    colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
    fonts: { heading: 'Comic Sans MS', body: 'Arial' },
    icons: ['butterfly', 'star', 'heart'],
    layout: 'rounded_tiles'
  };

  const calendarData = useCalendarData();
  const { tiles, loading, error, unlockTile, template } = testMode
    ? {
        tiles: mockTiles,
        loading: false,
        error: null,
        unlockTile: async (): Promise<Gift> => ({ type: 'sticker' as GiftType, title: 'Test Gift', description: 'Test', sticker: '🎁' }),
        template: defaultTemplate
      }
    : calendarData;
  const [lastUnlockedGift, setLastUnlockedGift] = useState<Gift | null>(null);
  const [childData, setChildData] = useState<any>(null);

  // Apply template styling when template changes
  useEffect(() => {
    if (template) {
      applyTemplateStyling(template);
    }
  }, [template]);

  // Load child data from localStorage if not in context (including guest sessions)
  useEffect(() => {
    if (!child) {
      // First check for regular child session
      const storedChildSession = localStorage.getItem('child_session');
      if (storedChildSession) {
        try {
          const parsed = JSON.parse(storedChildSession);
          if (parsed.child) {
            setChildData(parsed.child);
          }
        } catch (error) {
          console.error('Error parsing child session:', error);
        }
      }

      // Then check for guest session
      const storedGuestSession = localStorage.getItem('guest_session');
      if (storedGuestSession && !childData) {
        try {
          const parsed = JSON.parse(storedGuestSession);
          if (parsed.child && parsed.isGuest) {
            setChildData(parsed.child);
          }
        } catch (error) {
          console.error('Error parsing guest session:', error);
        }
      }
    } else {
      setChildData(child);
    }
  }, [child, childData]);

  // Check if user has access (authenticated child, guest, or test mode)
  const hasAccess = testMode ||
    (isAuthenticated && userType === 'child') ||
    childData ||
    localStorage.getItem('guest_session') !== null;

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">This page is only accessible to children.</p>
          <button
            onClick={() => window.location.href = '/auth'}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const handleUnlockTile = async (tileId: string, note?: string): Promise<Gift> => {
    try {
      const gift = await unlockTile(tileId, note);
      setLastUnlockedGift(gift);

      // Trigger emotional responses based on unlock
      const newUnlockedCount = tiles.filter(t => t.gift_unlocked).length + 1;
      setUnlockedCount(newUnlockedCount);

      // Emotional celebration based on progress
      if (newUnlockedCount === 1) {
        // First unlock - pure joy
        triggerJoy(2000);
        setCelebrationMessage("🎉 Your first surprise! The magic begins!");
        setShowCelebration(true);
      } else if (newUnlockedCount === tiles.length) {
        // All unlocked - celebration
        triggerCelebration(5000);
        setCelebrationMessage("🎊 Congratulations! You've unlocked all 25 days of magic!");
        setShowCelebration(true);
      } else if (newUnlockedCount % 5 === 0) {
        // Milestone every 5 unlocks
        triggerJoy(3000);
        setCelebrationMessage(`🌟 Amazing! ${newUnlockedCount} magical surprises unlocked!`);
        setShowCelebration(true);
      } else {
        // Regular unlock - anticipation for next
        triggerAnticipation(1500);
      }

      // Auto-hide celebration after 4 seconds
      if (showCelebration) {
        setTimeout(() => setShowCelebration(false), 4000);
      }

      return gift;
    } catch (err) {
      console.error('Failed to unlock tile:', err);
      throw err;
    }
  };

  return (
    <TemplateErrorBoundary>
      <div className="min-h-screen winter-wonderland-bg p-4 sm:p-6 relative overflow-hidden">
        {/* Winter Wonderland Snow Effects */}
        <div className="winter-snow-overlay fixed inset-0 pointer-events-none">
          <div className="winter-snow-particle large" style={{left: '20%', animationDelay: '0s'}}>❄️</div>
          <div className="winter-snow-particle medium" style={{left: '40%', animationDelay: '4s'}}>❄️</div>
          <div className="winter-snow-particle small" style={{left: '60%', animationDelay: '8s'}}>❄️</div>
          <div className="winter-snow-particle large" style={{left: '80%', animationDelay: '2s'}}>❄️</div>
        </div>

        {/* Holiday Lighting Effects */}
        <div className="winter-holiday-lights fixed inset-0 pointer-events-none"></div>

        {/* Celebration Overlay */}
        {showCelebration && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="winter-wonderland-card frosted celebration p-8 text-center max-w-md mx-4 animate-bounce winter-ornamentation">
              <div className="text-6xl mb-4">🎊</div>
              <h2 className="headline-2 text-brand mb-2">Amazing!</h2>
              <p className="body-large text-secondary">{celebrationMessage}</p>
              <div className="mt-4 flex justify-center space-x-2">
                <div className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-brand-tertiary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-6 sm:mb-8 winter-ornamentation winter-magic-sparkle">
          <h1 className="headline-1 bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent mb-2">
            {childData?.name ? `${childData.name}'s Magical Calendar` : 'Your Magical Calendar'}
          </h1>
          <p className="body text-rose-100/80 px-2 mb-4">Discover daily surprises and messages from your loved ones! ✨</p>

          {/* Emotional Progress Indicator */}
          <div className="winter-wonderland-card frosted p-4 mb-4 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="label text-rose-200/70">Your Progress</span>
              <span className="caption bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">{unlockedCount}/25 Magical Days</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-2 border border-white/20">
              <div
                className="bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 h-3 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-rose-500/30"
                style={{ width: `${(unlockedCount / 25) * 100}%` }}
                role="progressbar"
                aria-valuenow={unlockedCount}
                aria-valuemax={25}
                aria-label={`Progress: ${unlockedCount} of 25 magical surprises unlocked`}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-rose-200/60">
              <span>🎄 Start</span>
              <span>🎊 {unlockedCount > 0 ? `${Math.round((unlockedCount / 25) * 100)}% Complete` : 'Begin Your Journey'}</span>
              <span>🎁 Finish</span>
            </div>
          </div>

          <button
            onClick={() => window.location.href = '/parent/dashboard'}
            className="winter-wonderland-button frosted text-sm hover:scale-105 transition-all duration-300"
          >
            Switch to Parent View 👨‍👩‍👧‍👦
          </button>
        </div>

        <ChildCalendar
          tiles={tiles}
          onUnlockTile={handleUnlockTile}
          layout={template?.layout}
          gradients={template?.gradients}
          animations={template?.animations}
        />



        {/* Recent activity */}
        {lastUnlockedGift && (
          <div className="mt-4 sm:mt-6 winter-wonderland-card frosted p-4 sm:p-6 winter-ornamentation">
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent mb-4">Latest Unlock</h2>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2" role="img" aria-label="celebration">🎉</div>
              <h3 className="text-base sm:text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">{lastUnlockedGift.title}</h3>
              {lastUnlockedGift.description && (
                <p className="text-sm sm:text-base text-emerald-100/80">{lastUnlockedGift.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </TemplateErrorBoundary>
  );
};

export default ChildCalendarView;