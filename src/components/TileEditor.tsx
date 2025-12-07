import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarTile, Gift, GiftType } from '../types/calendar';
import ContentLibraryBrowser from './ContentLibraryBrowser';
import { Button } from './ui/WonderButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import { Sparkles, Image as ImageIcon, Gift as GiftIcon, Upload, X, Library } from 'lucide-react';
import { cn } from '../lib/utils';

interface TileEditorProps {
  tiles: CalendarTile[];
  onUpdateTile: (tileId: string, updates: Partial<CalendarTile>) => void;
  onUploadMedia: (tileId: string, file: File) => Promise<string>;
  onClose?: () => void;
  childName?: string;
  childAge?: number;
  parentType?: string;
  childInterests?: Record<string, any>;
}

const giftTypeOptions = [
  { value: '', label: 'No gift' },
  { value: 'sticker', label: 'Sticker' },
  { value: 'video', label: 'Video' },
  { value: 'downloadable', label: 'Downloadable File' },
  { value: 'external_link', label: 'External Link' },
  { value: 'experience', label: 'Experience/Activity' }
];

const themeOptions = [
  { value: 'christmas', label: 'Christmas Magic' },
  { value: 'encouragement', label: 'Encouragement' },
  { value: 'love', label: 'Love & Affection' }
];

const TileEditor: React.FC<TileEditorProps> = ({
  tiles,
  onUpdateTile,
  onUploadMedia,
  childName = 'child',
  childAge = 3,
  parentType = 'parent',
  childInterests = {}
}) => {
  const [selectedTile, setSelectedTile] = useState<CalendarTile | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    body: '',
    media_url: '',
    gift: null as Gift | null
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('christmas');
  const [showContentLibrary, setShowContentLibrary] = useState(false);

  const handleTileSelect = (tile: CalendarTile) => {
    setSelectedTile(tile);
    setEditForm({
      title: tile.title || '',
      body: tile.body || '',
      media_url: tile.media_url || '',
      gift: tile.gift || null
    });
  };

  const handleSave = () => {
    if (!selectedTile) return;

    onUpdateTile(selectedTile.tile_id, {
      title: editForm.title,
      body: editForm.body,
      media_url: editForm.media_url,
      gift: editForm.gift || undefined
    });

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

  const handleGenerateAI = async () => {
    if (!selectedTile) return;

    setGeneratingAI(true);
    setAiError(null);

    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tileId: selectedTile.tile_id,
          day: selectedTile.day,
          childName,
          childAge,
          parentType,
          theme: selectedTheme,
          existingContent: editForm.body,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate content: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setEditForm(prev => ({
          ...prev,
          body: data.content,
          title: prev.title || `Day ${selectedTile.day} Surprise`
        }));
      } else {
        throw new Error(data.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('AI generation error:', error);
      setAiError(error instanceof Error ? error.message : 'Failed to generate AI content');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSelectFromLibrary = (content: string) => {
    setEditForm(prev => ({
      ...prev,
      body: content,
      title: prev.title || `Day ${selectedTile?.day} Surprise`
    }));
    setShowContentLibrary(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Tile List */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Calendar Tiles</CardTitle>
          <CardDescription>Select a day to customize</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {tiles.map((tile) => {
              const isSelected = selectedTile?.tile_id === tile.tile_id;
              const hasContent = tile.title || tile.body || tile.media_url || tile.gift;

              return (
                <motion.div
                  key={tile.tile_id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTileSelect(tile)}
                  className={cn(
                    'aspect-square rounded-xl border-2 p-2 cursor-pointer transition-all flex flex-col items-center justify-center',
                    isSelected
                      ? 'border-primary-rose bg-gradient-to-br from-primary-peach/10 to-primary-rose/10'
                      : hasContent
                        ? 'border-bg-muted bg-white hover:border-primary-rose/50'
                        : 'border-bg-muted bg-bg-soft hover:border-bg-muted hover:bg-white'
                  )}
                >
                  <div className="text-sm font-bold text-text-primary">
                    {tile.day}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {tile.media_url && <ImageIcon className="h-3 w-3 text-primary-rose" />}
                    {tile.gift && <GiftIcon className="h-3 w-3 text-primary-purple" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Editor Panel */}
      {selectedTile ? (
        <Card variant="elevated" className="lg:sticky lg:top-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Edit Day {selectedTile.day}</CardTitle>
                <CardDescription>Customize this tile's content</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <Input
              label="Title (optional)"
              type="text"
              value={editForm.title}
              onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., A Special Message"
            />

            {/* Message with AI Tools */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Message
                </label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowContentLibrary(true)}
                    leftIcon={<Library className="h-4 w-4" />}
                  >
                    Library
                  </Button>
                  <Select
                    value={selectedTheme}
                    onChange={setSelectedTheme}
                    options={themeOptions}
                    className="text-xs"
                  />
                  <Button
                    variant="soft"
                    size="sm"
                    onClick={handleGenerateAI}
                    disabled={generatingAI}
                    leftIcon={<Sparkles className="h-4 w-4" />}
                    loading={generatingAI}
                  >
                    AI Generate
                  </Button>
                </div>
              </div>
              <Textarea
                value={editForm.body}
                onChange={(e) => setEditForm(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Write a personal message for your child..."
                rows={6}
                maxLength={500}
                showCharCount
              />
              {aiError && <p className="text-sm text-error mt-2">{aiError}</p>}
            </div>

            {/* Media Upload */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Photo or Video
              </label>
              {editForm.media_url ? (
                <div className="flex items-center gap-4 p-4 bg-bg-soft rounded-lg border border-bg-muted">
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white border border-bg-muted">
                    <ImageIcon className="h-8 w-8 text-text-tertiary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-text-primary font-medium">Media uploaded</p>
                    <p className="text-xs text-text-tertiary mt-0.5">Ready to display</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveMedia}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="media-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-bg-muted rounded-lg cursor-pointer bg-bg-soft hover:bg-white transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="h-8 w-8 text-text-tertiary mb-2" />
                      <p className="text-sm text-text-secondary">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-text-tertiary mt-1">
                        Images or videos up to 10MB
                      </p>
                    </div>
                    <input
                      id="media-upload"
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  {uploading && <p className="text-sm text-primary-rose mt-2">Uploading...</p>}
                  {uploadError && <p className="text-sm text-error mt-2">{uploadError}</p>}
                </div>
              )}
            </div>

            {/* Gift Selector */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Gift (optional)
              </label>
              <Select
                value={editForm.gift?.type || ''}
                onChange={(value) => {
                  const type = value as GiftType;
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
                options={giftTypeOptions}
              />

              {editForm.gift && (
                <div className="mt-4 p-4 bg-gradient-to-br from-accent-peach/10 to-accent-lavender/10 rounded-lg border border-bg-muted space-y-4">
                  <Input
                    type="text"
                    placeholder="Gift title"
                    value={editForm.gift.title}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      gift: prev.gift ? { ...prev.gift, title: e.target.value } : null
                    }))}
                  />

                  <Textarea
                    placeholder="Description or instructions"
                    value={editForm.gift.description || ''}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      gift: prev.gift ? { ...prev.gift, description: e.target.value } : null
                    }))}
                    rows={3}
                  />

                  {editForm.gift.type === 'sticker' && (
                    <Input
                      type="text"
                      placeholder="Sticker emoji or image URL"
                      value={editForm.gift.sticker || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        gift: prev.gift ? { ...prev.gift, sticker: e.target.value } : null
                      }))}
                    />
                  )}

                  {(editForm.gift.type === 'video' || editForm.gift.type === 'downloadable' || editForm.gift.type === 'external_link') && (
                    <Input
                      type="url"
                      placeholder="URL"
                      value={editForm.gift.url || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        gift: prev.gift ? { ...prev.gift, url: e.target.value } : null
                      }))}
                    />
                  )}

                  {editForm.gift.type === 'experience' && (
                    <Textarea
                      placeholder="Activity instructions"
                      value={editForm.gift.instructions || ''}
                      onChange={(e) => setEditForm(prev => ({
                        ...prev,
                        gift: prev.gift ? { ...prev.gift, instructions: e.target.value } : null
                      }))}
                      rows={3}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedTile(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleSave}
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card variant="elevated" className="flex items-center justify-center min-h-[400px]">
          <CardContent className="text-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-peach/20 to-primary-purple/20 mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary-rose" />
            </div>
            <p className="text-text-secondary">Select a tile to start editing</p>
            <p className="text-sm text-text-tertiary mt-2">Click any day on the left to customize it</p>
          </CardContent>
        </Card>
      )}

      {/* Content Library Modal */}
      {showContentLibrary && (
        <ContentLibraryBrowser
          childAge={childAge}
          childInterests={childInterests}
          onSelectContent={handleSelectFromLibrary}
          onClose={() => setShowContentLibrary(false)}
        />
      )}
    </div>
  );
};

export default TileEditor;
