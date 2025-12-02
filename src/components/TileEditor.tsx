import React, { useState } from 'react';
import { CalendarTile, Gift, GiftType } from '../types/advent';

interface TileEditorProps {
  tiles: CalendarTile[];
  onUpdateTile: (tileId: string, updates: Partial<CalendarTile>) => void;
  onUploadMedia: (tileId: string, file: File) => Promise<string>;
  onClose: () => void;
}

const TileEditor: React.FC<TileEditorProps> = ({ tiles, onUpdateTile, onUploadMedia, onClose }) => {
  const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    body: '',
    media_url: '',
    gift: null as Gift | null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleTileSelect = (tile: CalendarTile) => {
    setSelectedTile(tile);
    setEditForm({
      title: tile.title || '',
      body: tile.body || '',
      media_url: tile.media_url || '',
      gift: tile.gift || null
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!selectedTile) return;

    onUpdateTile(selectedTile.tile_id, {
      title: editForm.title,
      body: editForm.body,
      media_url: editForm.media_url,
      gift: editForm.gift || undefined
    });

    setIsEditing(false);
    setSelectedTile(null);
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedTile) return;

    setUploading(true);
    setUploadError(null);
    try {
      const mediaUrl = await onUploadMedia(selectedTile.tile_id, file);
      setEditForm(prev => ({ ...prev, media_url: mediaUrl }));
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = () => {
    setEditForm(prev => ({ ...prev, media_url: '' }));
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tile-editor-title"
    >
      <div className="bg-white rounded-lg p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 id="tile-editor-title" className="text-xl sm:text-2xl font-bold text-gray-800">Edit Calendar Tiles</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl p-1"
            aria-label="Close tile editor"
          >
            ×
          </button>
        </div>

        {!isEditing ? (
          <div>
            <p className="text-gray-600 mb-4">Click on a tile to customize it with a message, photo, or gift.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4" role="grid" aria-label="Calendar tiles">
              {tiles.map((tile) => (
                <div
                  key={tile.tile_id}
                  onClick={() => handleTileSelect(tile)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleTileSelect(tile);
                    }
                  }}
                  className="aspect-square border-2 border-gray-200 rounded-lg p-2 cursor-pointer hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-colors flex flex-col items-center justify-center touch-manipulation"
                  role="button"
                  tabIndex={0}
                  aria-label={`Edit Day ${tile.day}${tile.title ? `: ${tile.title}` : ''}${tile.media_url ? ' - Has media' : ''}${tile.gift ? ' - Has gift' : ''}`}
                >
                  <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">Day {tile.day}</div>
                  {tile.title && <div className="text-xs sm:text-sm text-gray-600 text-center">{tile.title}</div>}
                  {tile.media_url && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded mt-1 flex items-center justify-center text-sm sm:text-base" aria-label="Has media">
                      📷
                    </div>
                  )}
                  {tile.gift && <div className="text-xs text-purple-600 mt-1" aria-label="Has gift">🎁</div>}
                </div>
              ))}
            </div>
          </div>
        ) : selectedTile ? (
          <div>
            <h3 className="text-lg sm:text-xl font-semibold mb-4">Edit Day {selectedTile.day}</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor={`title-${selectedTile.tile_id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Title (optional)
                </label>
                <input
                  id={`title-${selectedTile.tile_id}`}
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A Special Message"
                  aria-describedby="title-help"
                />
                <div id="title-help" className="sr-only">Optional title for the calendar tile</div>
              </div>

              <div>
                <label htmlFor={`message-${selectedTile.tile_id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id={`message-${selectedTile.tile_id}`}
                  value={editForm.body}
                  onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 sm:h-32"
                  placeholder="Write a personal message for your child..."
                  aria-describedby="message-help"
                />
                <div id="message-help" className="sr-only">Personal message that will be shown when the tile is opened</div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photo or Video
                </label>
                {editForm.media_url ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                      📷
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Media uploaded</p>
                      <button
                        onClick={handleRemoveMedia}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={uploading}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {uploading && <p className="text-sm text-blue-500 mt-1">Uploading...</p>}
                    {uploadError && <p className="text-sm text-red-500 mt-1">{uploadError}</p>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gift (optional)
                </label>
                <div className="space-y-3">
                  <select
                    value={editForm.gift?.type || ''}
                    onChange={(e) => {
                      const type = e.target.value as GiftType;
                      if (type) {
                        setEditForm(prev => ({
                          ...prev,
                          gift: {
                            type,
                            title: prev.gift?.title || '',
                            description: prev.gift?.description || ''
                          }
                        }));
                      } else {
                        setEditForm(prev => ({ ...prev, gift: null }));
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No gift</option>
                    <option value="sticker">Sticker</option>
                    <option value="video">Video</option>
                    <option value="downloadable">Downloadable File</option>
                    <option value="external_link">External Link</option>
                    <option value="experience">Experience/Activity</option>
                  </select>

                  {editForm.gift && (
                    <div className="space-y-3 p-3 bg-gray-50 rounded-md">
                      <input
                        type="text"
                        placeholder="Gift title"
                        value={editForm.gift.title}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          gift: prev.gift ? { ...prev.gift, title: e.target.value } : null
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      <textarea
                        placeholder="Description or instructions"
                        value={editForm.gift.description || ''}
                        onChange={(e) => setEditForm(prev => ({
                          ...prev,
                          gift: prev.gift ? { ...prev.gift, description: e.target.value } : null
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      />

                      {editForm.gift.type === 'sticker' && (
                        <input
                          type="text"
                          placeholder="Sticker emoji or image URL"
                          value={editForm.gift.sticker || ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            gift: prev.gift ? { ...prev.gift, sticker: e.target.value } : null
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {(editForm.gift.type === 'video' || editForm.gift.type === 'downloadable' || editForm.gift.type === 'external_link') && (
                        <input
                          type="url"
                          placeholder="URL"
                          value={editForm.gift.url || ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            gift: prev.gift ? { ...prev.gift, url: e.target.value } : null
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}

                      {editForm.gift.type === 'experience' && (
                        <textarea
                          placeholder="Activity instructions"
                          value={editForm.gift.instructions || ''}
                          onChange={(e) => setEditForm(prev => ({
                            ...prev,
                            gift: prev.gift ? { ...prev.gift, instructions: e.target.value } : null
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TileEditor;