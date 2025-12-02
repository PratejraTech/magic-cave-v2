import React, { useState, useEffect } from 'react';
import ChildCalendar from './ChildCalendar';
import TemplateErrorBoundary from './TemplateErrorBoundary';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { Gift, CalendarTile, GiftType, TemplateMetadata } from '../types/advent';
import { applyTemplateStyling } from '../lib/templateStyling';

interface ChildCalendarViewProps {
  testMode?: boolean;
}

const ChildCalendarView: React.FC<ChildCalendarViewProps> = ({ testMode = false }) => {
  const { userType, isAuthenticated, child } = useAuth();

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

  // Load child data from localStorage if not in context
  useEffect(() => {
    if (!child) {
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
    } else {
      setChildData(child);
    }
  }, [child]);

  // Only allow children to access this view (unless in test mode)
  if (!testMode && (!isAuthenticated || (userType !== 'child' && !childData))) {
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
      return gift;
    } catch (err) {
      console.error('Failed to unlock tile:', err);
      throw err;
    }
  };

  return (
    <TemplateErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            {childData?.name ? `${childData.name}'s Advent Calendar` : 'Your Advent Calendar'}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-2 mb-4">Click on tiles to unlock gifts and messages from your parents!</p>
          <button
            onClick={() => window.location.href = '/parent/dashboard'}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Switch to Parent View
          </button>
        </div>

        <ChildCalendar
          tiles={tiles}
          onUnlockTile={handleUnlockTile}
          layout={template?.layout}
          gradients={template?.gradients}
          animations={template?.animations}
        />

        {/* Progress indicator */}
        <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 bg-gray-200 rounded-full h-3 sm:h-4">
              <div
                className="bg-green-500 h-3 sm:h-4 rounded-full transition-all duration-300"
                style={{ width: `${(tiles.filter(t => t.gift_unlocked).length / tiles.length) * 100}%` }}
                role="progressbar"
                aria-valuenow={tiles.filter(t => t.gift_unlocked).length}
                aria-valuemax={tiles.length}
                aria-label={`Progress: ${tiles.filter(t => t.gift_unlocked).length} of ${tiles.length} gifts unlocked`}
              ></div>
            </div>
            <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              {tiles.filter(t => t.gift_unlocked).length} of {tiles.length} gifts unlocked
            </div>
          </div>
        </div>

        {/* Recent activity */}
        {lastUnlockedGift && (
          <div className="mt-4 sm:mt-6 bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Latest Unlock</h2>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl mb-2" role="img" aria-label="celebration">🎉</div>
              <h3 className="text-base sm:text-lg font-bold text-green-600 mb-2">{lastUnlockedGift.title}</h3>
              {lastUnlockedGift.description && (
                <p className="text-sm sm:text-base text-gray-600">{lastUnlockedGift.description}</p>
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