import React, { useState, useEffect } from 'react';
import ChildCalendar from './ChildCalendar';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { Gift } from '../types/advent';

const ChildCalendarView: React.FC = () => {
  const { userType, isAuthenticated, child } = useAuth();
  const { tiles, loading, error, unlockTile } = useCalendarData();
  const [lastUnlockedGift, setLastUnlockedGift] = useState<Gift | null>(null);
  const [childData, setChildData] = useState<any>(null);

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

  // Only allow children to access this view
  if (!isAuthenticated || (userType !== 'child' && !childData)) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Advent Calendar</h1>
          <p className="text-gray-600">Click on tiles to unlock gifts and messages from your parents!</p>
        </div>

        <ChildCalendar
          tiles={tiles}
          onUnlockTile={handleUnlockTile}
        />

        {/* Progress indicator */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(tiles.filter(t => t.gift_unlocked).length / tiles.length) * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              {tiles.filter(t => t.gift_unlocked).length} of {tiles.length} gifts unlocked
            </div>
          </div>
        </div>

        {/* Recent activity */}
        {lastUnlockedGift && (
          <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Latest Unlock</h2>
            <div className="text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-lg font-bold text-green-600 mb-2">{lastUnlockedGift.title}</h3>
              {lastUnlockedGift.description && (
                <p className="text-gray-600">{lastUnlockedGift.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildCalendarView;