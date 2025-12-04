import React, { useState } from 'react';
import { CalendarTile, Gift } from '../types/calendar';
import { analytics } from '../lib/analytics';

interface ChildCalendarProps {
  tiles: CalendarTile[];
  onUnlockTile: (tileId: string, note?: string) => Promise<Gift>;
  layout?: 'rounded_tiles' | 'square_tiles' | 'hexagon_tiles';
  gradients?: {
    tileBackground?: string;
    tileHover?: string;
  };
  animations?: {
    tileHover?: string;
    tileClick?: string;
  };
}

const ChildCalendar: React.FC<ChildCalendarProps> = ({
  tiles,
  onUnlockTile,
  layout = 'rounded_tiles',
  gradients,
  animations
}) => {
  const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedGift, setUnlockedGift] = useState<Gift | null>(null);
  const [note, setNote] = useState('');
  const [showNotePrompt, setShowNotePrompt] = useState(false);

  const getTileClasses = () => {
    const baseClasses = 'aspect-square border-2 p-2 sm:p-4 cursor-pointer transition-all flex flex-col items-center justify-center touch-manipulation';

    switch (layout) {
      case 'square_tiles':
        return `${baseClasses} rounded-none`;
      case 'hexagon_tiles':
        return `${baseClasses} rounded-none`; // Hexagon will be handled with CSS clip-path
      case 'rounded_tiles':
      default:
        return `${baseClasses} rounded-xl hover-lift focus-ring-modern`;
    }
  };

  const getTileStyle = () => {
    if (layout === 'hexagon_tiles') {
      return {
        clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
      };
    }
    return {};
  };

  const handleTileClick = (tile: CalendarTile) => {
    if (!tile.gift || tile.gift_unlocked) return;

    // Log tile opened event
    analytics.logTileOpened(tile.tile_id, tile.day, tile.calendar_id);

    setSelectedTile(tile);
    setShowNotePrompt(true);
  };

  const handleUnlock = async () => {
    if (!selectedTile) return;

    setUnlocking(true);
    try {
      const gift = await onUnlockTile(selectedTile.tile_id, note.trim() || undefined);
      setUnlockedGift(gift);
      setShowNotePrompt(false);
    } catch (error) {
      console.error('Unlock failed:', error);
      // TODO: Show error message
    } finally {
      setUnlocking(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedTile(null);
    setUnlockedGift(null);
    setNote('');
    setShowNotePrompt(false);
  };

  const renderGift = (gift: Gift) => {
    switch (gift.type) {
      case 'sticker':
        return (
          <div className="text-center">
            <div className="text-6xl mb-4">{gift.sticker}</div>
            <h3 className="text-xl font-bold mb-2">{gift.title}</h3>
            {gift.description && <p className="text-gray-600">{gift.description}</p>}
          </div>
        );

      case 'video':
        return (
          <div className="text-center">
            <div className="mb-4">
              <video controls className="max-w-full max-h-64">
                <source src={gift.url} />
                Your browser does not support the video tag.
              </video>
            </div>
            <h3 className="text-xl font-bold mb-2">{gift.title}</h3>
            {gift.description && <p className="text-gray-600">{gift.description}</p>}
          </div>
        );

      case 'downloadable':
        return (
          <div className="text-center">
            <div className="mb-4">
              <a
                href={gift.url}
                download
                className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
              >
                📁 Download {gift.title}
              </a>
            </div>
            {gift.description && <p className="text-gray-600">{gift.description}</p>}
          </div>
        );

      case 'external_link':
        return (
          <div className="text-center">
            <div className="mb-4">
              <a
                href={gift.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
              >
                🔗 Open {gift.title}
              </a>
            </div>
            {gift.description && <p className="text-gray-600">{gift.description}</p>}
          </div>
        );

      case 'experience':
        return (
          <div className="text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-bold mb-2">{gift.title}</h3>
            {gift.description && <p className="text-gray-600 mb-4">{gift.description}</p>}
            {gift.instructions && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What to do:</h4>
                <p className="text-sm">{gift.instructions}</p>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unknown gift type</div>;
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 max-w-4xl mx-auto">
        {tiles.map((tile) => (
          <div
            key={tile.tile_id}
            onClick={() => handleTileClick(tile)}
            className={`${getTileClasses()} ${
              tile.gift && !tile.gift_unlocked
                ? `border-purple-300 bg-purple-50 hover:border-purple-400 active:bg-purple-100 ${animations?.tileHover || ''}`
                : tile.gift_unlocked
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
            style={{
              ...getTileStyle(),
              background: tile.gift && !tile.gift_unlocked && gradients?.tileBackground
                ? gradients.tileBackground
                : undefined
            }}
            role="button"
            tabIndex={tile.gift && !tile.gift_unlocked ? 0 : -1}
            aria-label={`Day ${tile.day}${tile.title ? `: ${tile.title}` : ''}${tile.gift ? (tile.gift_unlocked ? ' - Gift unlocked' : ' - Click to unlock gift') : ' - No gift available'}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTileClick(tile);
              }
            }}
          >
            <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">Day {tile.day}</div>

            {tile.title && (
              <div className="text-xs sm:text-sm text-gray-600 text-center mb-1 sm:mb-2 leading-tight">{tile.title}</div>
            )}

            {tile.media_url && (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded mb-1 sm:mb-2 flex items-center justify-center text-sm sm:text-base">
                📷
              </div>
            )}

            {tile.gift ? (
              tile.gift_unlocked ? (
                <div className="text-green-600 font-semibold text-xs sm:text-sm" aria-label="Gift unlocked">✅ Unlocked!</div>
              ) : (
                <div className="text-purple-600 font-semibold text-xs sm:text-sm" aria-label="Click to unlock gift">🎁 Gift!</div>
              )
            ) : (
              <div className="text-gray-400 text-xs sm:text-sm">No gift yet</div>
            )}
          </div>
        ))}
      </div>

      {/* Note Prompt Modal */}
      {showNotePrompt && selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 sm:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Day {selectedTile.day}</h3>

            {selectedTile.title && (
              <p className="text-gray-600 mb-4 text-sm sm:text-base">{selectedTile.title}</p>
            )}

            {selectedTile.body && (
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4">
                <p className="text-sm">{selectedTile.body}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Write a note to your parent (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 sm:h-24 text-sm sm:text-base"
                placeholder="Thank you for the gift! I love..."
                aria-label="Note to parent"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 order-2 sm:order-1"
                aria-label="Cancel unlocking gift"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50 order-1 sm:order-2"
                aria-label={unlocking ? 'Unlocking gift' : 'Unlock gift'}
              >
                {unlocking ? 'Unlocking...' : 'Unlock Gift! 🎁'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Reveal Modal */}
      {unlockedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 sm:p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="text-3xl sm:text-4xl mb-4" role="img" aria-label="celebration">🎉</div>
              <h3 className="text-xl sm:text-2xl font-bold text-green-600">Gift Unlocked!</h3>
            </div>

            {renderGift(unlockedGift)}

            <div className="flex justify-center mt-4 sm:mt-6">
              <button
                onClick={handleCloseModal}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm sm:text-base"
                aria-label="Close gift reveal"
              >
                Yay! 🎉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChildCalendar;