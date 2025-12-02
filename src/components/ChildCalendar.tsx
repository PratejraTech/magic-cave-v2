import React, { useState } from 'react';
import { CalendarTile, Gift } from '../types/advent';

interface ChildCalendarProps {
  tiles: CalendarTile[];
  onUnlockTile: (tileId: string, note?: string) => Promise<Gift>;
}

const ChildCalendar: React.FC<ChildCalendarProps> = ({ tiles, onUnlockTile }) => {
  const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedGift, setUnlockedGift] = useState<Gift | null>(null);
  const [note, setNote] = useState('');
  const [showNotePrompt, setShowNotePrompt] = useState(false);

  const handleTileClick = (tile: CalendarTile) => {
    if (!tile.gift || tile.gift_unlocked) return;

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
      <h2 className="text-2xl font-bold text-center mb-6">Your Advent Calendar</h2>
      <div className="grid grid-cols-5 gap-4 max-w-4xl mx-auto">
        {tiles.map((tile) => (
          <div
            key={tile.tile_id}
            onClick={() => handleTileClick(tile)}
            className={`aspect-square border-2 rounded-lg p-4 cursor-pointer transition-all flex flex-col items-center justify-center ${
              tile.gift && !tile.gift_unlocked
                ? 'border-purple-300 bg-purple-50 hover:border-purple-400'
                : tile.gift_unlocked
                ? 'border-green-300 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="text-lg font-bold text-gray-800 mb-2">Day {tile.day}</div>

            {tile.title && (
              <div className="text-sm text-gray-600 text-center mb-2">{tile.title}</div>
            )}

            {tile.media_url && (
              <div className="w-8 h-8 bg-gray-200 rounded mb-2 flex items-center justify-center">
                📷
              </div>
            )}

            {tile.gift ? (
              tile.gift_unlocked ? (
                <div className="text-green-600 font-semibold">✅ Unlocked!</div>
              ) : (
                <div className="text-purple-600 font-semibold">🎁 Gift!</div>
              )
            ) : (
              <div className="text-gray-400">No gift yet</div>
            )}
          </div>
        ))}
      </div>

      {/* Note Prompt Modal */}
      {showNotePrompt && selectedTile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Day {selectedTile.day}</h3>

            {selectedTile.title && (
              <p className="text-gray-600 mb-4">{selectedTile.title}</p>
            )}

            {selectedTile.body && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                placeholder="Thank you for the gift! I love..."
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUnlock}
                disabled={unlocking}
                className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
              >
                {unlocking ? 'Unlocking...' : 'Unlock Gift! 🎁'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gift Reveal Modal */}
      {unlockedGift && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-600">Gift Unlocked!</h3>
            </div>

            {renderGift(unlockedGift)}

            <div className="flex justify-center mt-6">
              <button
                onClick={handleCloseModal}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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