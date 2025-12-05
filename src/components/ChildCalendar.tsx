import React, { useState } from 'react';
import { CalendarTile, Gift } from '../types/calendar';
import { analytics } from '../lib/analytics';
import { useWinterEffects } from '../contexts/WinterEffectsContext';
import { Button } from './ui/WonderButton';

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
  highlightedTile?: CalendarTile | null;
}

const ChildCalendar: React.FC<ChildCalendarProps> = ({
  tiles,
  onUnlockTile,
  layout = 'rounded_tiles',
  gradients,
  animations,
  highlightedTile
}) => {
  const { triggerCelebration } = useWinterEffects();
  const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedGift, setUnlockedGift] = useState<Gift | null>(null);
  const [note, setNote] = useState('');
  const [showNotePrompt, setShowNotePrompt] = useState(false);
  const tileCssOverrides = React.useMemo<React.CSSProperties>(() => {
    const vars: React.CSSProperties = {};
    if (animations?.tileHover) {
      (vars as any)['--tile-hover-transform'] = animations.tileHover;
    }
    if (animations?.tileClick) {
      (vars as any)['--tile-active-transform'] = animations.tileClick;
    }
    return vars;
  }, [animations]);

  // TODO: Phase 2 - Gesture navigation state (will be used when gesture handlers are connected)
  // const [currentTileIndex, setCurrentTileIndex] = useState<number>(-1);
  // const [zoomLevel, setZoomLevel] = useState<number>(1);
  // const [previewTile, setPreviewTile] = useState<CalendarTile | null>(null);
  // const calendarRef = useRef<HTMLDivElement>(null);

  const getTileClassName = () => {
    const classes = ['winter-calendar-tile', 'cursor-pointer', 'winter-magic-sparkle'];

    switch (layout) {
      case 'square_tiles':
        classes.push('winter-calendar-tile--square');
        break;
      case 'hexagon_tiles':
        classes.push('winter-calendar-tile--hexagon');
        break;
      default:
        break;
    }

    return classes.join(' ');
  };

  const handleTileClick = (tile: CalendarTile) => {
    // Use gesture-enabled tap handler
    handleTapUnlock(tile);
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

  // TODO: Phase 2 - Connect these gesture handlers to WinterEffects context
  // Gesture handlers (will be connected to actual gesture events in Phase 2 completion)
  /*
  const handleSwipeNavigation = (direction: 'left' | 'right' | 'up' | 'down') => {
    const unlockedTiles = tiles.filter(tile => tile.gift_unlocked);
    if (unlockedTiles.length === 0) return;

    let newIndex = currentTileIndex;
    switch (direction) {
      case 'left':
        newIndex = Math.max(0, currentTileIndex - 1);
        break;
      case 'right':
        newIndex = Math.min(unlockedTiles.length - 1, currentTileIndex + 1);
        break;
      case 'up':
        // Navigate to previous row (assuming 5 columns)
        newIndex = Math.max(0, currentTileIndex - 5);
        break;
      case 'down':
        // Navigate to next row (assuming 5 columns)
        newIndex = Math.min(unlockedTiles.length - 1, currentTileIndex + 5);
        break;
    }

    if (newIndex !== currentTileIndex) {
      setCurrentTileIndex(newIndex);
      const targetTile = unlockedTiles[newIndex];
      if (targetTile) {
        // Trigger celebration for navigation
        triggerCelebration('navigation_magic', {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight
        });
      }
    }
  };

  const handlePinchZoom = (scale: number) => {
    const newZoom = Math.max(0.5, Math.min(2, zoomLevel * scale));
    setZoomLevel(newZoom);

    // Trigger zoom celebration
    if (newZoom > zoomLevel) {
      triggerCelebration('zoom_in_magic');
    } else if (newZoom < zoomLevel) {
      triggerCelebration('zoom_out_magic');
    }
  };

  const handleLongPressPreview = (tile: CalendarTile) => {
    if (tile.gift_unlocked) {
      setPreviewTile(tile);
      // Auto-hide preview after 3 seconds
      setTimeout(() => setPreviewTile(null), 3000);
      triggerCelebration('preview_magic');
    }
  };
  */

  const handleTapUnlock = (tile: CalendarTile) => {
    if (!tile.gift || tile.gift_unlocked) return;

    // Log tile opened event
    analytics.logTileOpened(tile.tile_id, tile.day, tile.calendar_id);

    // Trigger magical tap celebration
    triggerCelebration('tap_magic', {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    });

    // Proceed with normal unlock flow
    setSelectedTile(tile);
    setShowNotePrompt(true);
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
      <div className="winter-calendar-grid">
        {tiles.map((tile) => {
          const tileState = tile.gift_unlocked ? 'unlocked' : tile.gift ? 'locked' : 'empty';
          const isHighlighted = highlightedTile?.tile_id === tile.tile_id;
          const statusCopy = tileState === 'unlocked'
            ? 'Gift opened'
            : tileState === 'locked'
              ? 'Tap to unlock'
              : 'Awaiting surprise';

          return (
            <div
              key={tile.tile_id}
              onClick={() => handleTileClick(tile)}
              className={getTileClassName()}
              style={{
                ...tileCssOverrides,
                background: tileState === 'locked' && gradients?.tileBackground
                  ? gradients.tileBackground
                  : undefined
              }}
              data-state={tileState}
              data-highlighted={isHighlighted ? 'true' : 'false'}
              data-has-gift={tile.gift ? 'true' : 'false'}
              data-has-media={tile.media_url ? 'true' : 'false'}
              role="button"
              tabIndex={tile.gift && !tile.gift_unlocked ? 0 : -1}
              aria-label={`Day ${tile.day}${tile.title ? `: ${tile.title}` : ''} — ${statusCopy}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTileClick(tile);
                }
              }}
            >
              <div className="winter-calendar-day-label">Day {tile.day}</div>

              {tile.title && (
                <div className="winter-calendar-title" title={tile.title}>
                  {tile.title}
                </div>
              )}

              {tile.media_url && (
                <div
                  className="winter-calendar-badge winter-calendar-badge--media"
                  aria-label="Media surprise attached"
                >
                  📷
                </div>
              )}

              {tile.gift ? (
                tile.gift_unlocked ? (
                  <div className="winter-calendar-meta winter-calendar-meta--success" aria-label="Gift unlocked">
                    ✅ Gift opened
                  </div>
                ) : (
                  <div className="winter-calendar-meta winter-calendar-meta--gift" aria-label="Tap to unlock gift">
                    🎁 Tap to unlock
                  </div>
                )
              ) : (
                <div className="winter-calendar-meta" aria-label="No gift set yet">
                  No gift yet
                </div>
              )}
            </div>
          );
        })}
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
              <Button
                variant="outline"
                onClick={handleCloseModal}
                className="order-2 sm:order-1"
                aria-label="Cancel unlocking gift"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="order-1 sm:order-2 bg-gradient-to-r from-purple-500 to-pink-500"
                onClick={handleUnlock}
                loading={unlocking}
                aria-label={unlocking ? 'Unlocking gift' : 'Unlock gift'}
              >
                {unlocking ? 'Unlocking...' : 'Unlock Gift! 🎁'}
              </Button>
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
              <Button
                variant="primary"
                onClick={handleCloseModal}
                aria-label="Close gift reveal"
              >
                Yay! 🎉
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Phase 2 - Tile Preview Overlay (for long press) */}
      {/* {previewTile && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-40 p-4">
          <div className="winter-wonderland-card frosted p-6 max-w-sm w-full mx-4 text-center">
            <div className="text-4xl mb-4">👁️</div>
            <h3 className="text-lg font-bold mb-2">Day {previewTile.day} Preview</h3>
            {previewTile.title && (
              <p className="text-sm text-gray-600 mb-2">{previewTile.title}</p>
            )}
            {previewTile.body && (
              <p className="text-xs text-gray-500">{previewTile.body}</p>
            )}
            <div className="mt-4 text-xs text-gray-400">
              Long press to preview unlocked gifts!
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ChildCalendar;
