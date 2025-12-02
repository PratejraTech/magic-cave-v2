import React, { useState } from 'react';
import TileEditor from './TileEditor';
import { useCalendarData } from '../lib/useCalendarData';
import { useAuth } from '../lib/AuthContext';
import { CalendarTile } from '../types/advent';

const ParentDashboard: React.FC = () => {
  const { userType, isAuthenticated } = useAuth();
  const { tiles, loading, error, updateTile, uploadMedia } = useCalendarData();
  const [showTileEditor, setShowTileEditor] = useState(false);

  // Only allow parents to access this dashboard
  if (!isAuthenticated || userType !== 'parent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">This page is only accessible to parents.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
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

  const handleUpdateTile = async (tileId: string, updates: Partial<CalendarTile>) => {
    try {
      await updateTile(tileId, updates);
    } catch (err) {
      console.error('Failed to update tile:', err);
      // TODO: Show error message to user
    }
  };

  const handleUploadMedia = async (tileId: string, file: File): Promise<string> => {
    try {
      return await uploadMedia(tileId, file);
    } catch (err) {
      console.error('Failed to upload media:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Parent Dashboard</h1>
          <p className="text-gray-600">Customize your child's advent calendar with messages, photos, and gifts.</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Calendar Overview</h2>
            <button
              onClick={() => setShowTileEditor(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Edit Tiles
            </button>
          </div>

          <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 25 }, (_, i) => i + 1).map(day => {
              const tile = tiles.find(t => t.day === day);
              return (
                <div
                  key={day}
                  className="aspect-square border-2 border-gray-200 rounded-lg p-2 flex flex-col items-center justify-center bg-gray-50"
                >
                  <div className="text-sm font-bold text-gray-800 mb-1">Day {day}</div>
                  {tile?.title && (
                    <div className="text-xs text-gray-600 text-center mb-1 truncate w-full">
                      {tile.title}
                    </div>
                  )}
                  {tile?.media_url && (
                    <div className="w-6 h-6 bg-blue-200 rounded flex items-center justify-center mb-1">
                      📷
                    </div>
                  )}
                  {tile?.gift && (
                    <div className="text-xs text-purple-600">🎁</div>
                  )}
                  {tile?.gift_unlocked && (
                    <div className="text-xs text-green-600 mt-1">✅</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{tiles.length}</div>
              <div className="text-sm text-gray-600">Total Tiles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {tiles.filter(t => t.gift).length}
              </div>
              <div className="text-sm text-gray-600">Tiles with Gifts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {tiles.filter(t => t.gift_unlocked).length}
              </div>
              <div className="text-sm text-gray-600">Unlocked Gifts</div>
            </div>
          </div>
        </div>
      </div>

      {showTileEditor && (
        <TileEditor
          tiles={tiles}
          onUpdateTile={handleUpdateTile}
          onUploadMedia={handleUploadMedia}
          onClose={() => setShowTileEditor(false)}
        />
      )}
    </div>
  );
};

export default ParentDashboard;