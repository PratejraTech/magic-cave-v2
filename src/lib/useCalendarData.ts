import { useState, useEffect, useCallback } from 'react';
import { CalendarTile, Gift, TemplateMetadata } from '../types/calendar';
import { useAuth } from './AuthContext';
import { applyTemplateStyling } from './templateStyling';
import { analytics } from './analytics';

// Cache data structure
interface CalendarCache {
  tiles: CalendarTile[];
  template?: TemplateMetadata | null;
  templateId?: string | null;
  timestamp: number;
}

export interface UseCalendarDataReturn {
  tiles: CalendarTile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTile: (tileId: string, updates: Partial<CalendarTile>) => Promise<void>;
  uploadMedia: (tileId: string, file: File) => Promise<string>;
  unlockTile: (tileId: string, note?: string) => Promise<Gift>;
  template: TemplateMetadata | null;
}

export const useCalendarData = (): UseCalendarDataReturn => {
  const { session, isAuthenticated } = useAuth();
  const [tiles, setTiles] = useState<CalendarTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [template, setTemplate] = useState<TemplateMetadata | null>(null);

  // Cache key for offline support
  const CACHE_KEY = 'calendar_tiles_cache';
  const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const API_BASE = (import.meta as { env?: { VITE_CHAT_API_URL?: string; CHAT_API_URL?: string; PROD?: boolean } }).env?.VITE_CHAT_API_URL || (import.meta as { env?: { VITE_CHAT_API_URL?: string; CHAT_API_URL?: string; PROD?: boolean } }).env?.CHAT_API_URL || ((import.meta as { env?: { VITE_CHAT_API_URL?: string; CHAT_API_URL?: string; PROD?: boolean } }).env?.PROD ? '' : 'https://toharper.dad');

  const fetchTiles = useCallback(async () => {
    // Check if this is a guest session
    const guestSession = localStorage.getItem('guest_session');
    if (guestSession) {
      try {
        const parsed = JSON.parse(guestSession);
        if (parsed.isGuest && parsed.calendar) {
          // Provide demo tiles for guest users
          const demoTiles: CalendarTile[] = Array.from({ length: 25 }, (_, i) => ({
            tile_id: `guest-tile-${i + 1}`,
            calendar_id: parsed.calendar.calendar_id,
            day: i + 1,
            title: i < 3 ? `Demo Day ${i + 1}` : undefined,
            body: i < 3 ? `This is a demo message for day ${i + 1}. Try the guest experience!` : undefined,
            media_url: undefined,
            gift: i < 2 ? {
              type: 'sticker' as const,
              title: `Demo Gift ${i + 1}`,
              description: `A special demo gift for day ${i + 1}`,
              sticker: ['🎄', '🎁', '⭐'][i]
            } : undefined,
            gift_unlocked: false,
            version: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));

          setTiles(demoTiles);

          // Set demo template
          const demoTemplate: TemplateMetadata = {
            colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
            fonts: { heading: 'Inter', body: 'Inter' },
            icons: ['butterfly', 'star', 'heart'],
            layout: 'rounded_tiles'
          };
          setTemplate(demoTemplate);
          applyTemplateStyling(demoTemplate);

          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error parsing guest session:', error);
      }
    }

    if (!isAuthenticated || !session?.access_token) {
      // Try to load from cache for offline support
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed: CalendarCache = JSON.parse(cached);

          // Check cache expiry
          if (parsed.timestamp && (Date.now() - parsed.timestamp) > CACHE_EXPIRY) {
            console.log('Cache expired, clearing');
            localStorage.removeItem(CACHE_KEY);
            return;
          }

          // Validate cached data structure
          if (parsed && typeof parsed === 'object' && 'tiles' in parsed) {
            const tiles = Array.isArray(parsed.tiles) ? parsed.tiles : [];
            setTiles(tiles);

            // Validate and apply cached template
            if (parsed.template && typeof parsed.template === 'object') {
              // Basic validation of template structure
              if (parsed.template.colors && parsed.template.fonts && Array.isArray(parsed.template.icons)) {
                setTemplate(parsed.template);
                applyTemplateStyling(parsed.template, parsed.templateId || undefined);
              } else {
                console.warn('Cached template data is malformed, skipping template application');
              }
            }
          } else {
            console.warn('Cached data structure is invalid, clearing cache');
            localStorage.removeItem(CACHE_KEY);
          }
        } catch (e) {
          console.error('Error parsing cached tiles:', e);
          // Clear corrupted cache
          localStorage.removeItem(CACHE_KEY);
        }
      }
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/calendar/tiles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Try to load from cache if network fails
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setTiles(parsed.tiles || []);
            setError('Using cached data - network unavailable');
          } catch {
            throw new Error(`Failed to fetch tiles: ${response.statusText}`);
          }
        } else {
          throw new Error(`Failed to fetch tiles: ${response.statusText}`);
        }
        return;
      }

      const data = await response.json();
      setTiles(data.tiles || []);

      // Fetch and apply template if calendar info is available
      if (data.calendar?.template_id) {
        try {
          const templateResponse = await fetch(`${API_BASE}/api/templates/${data.calendar.template_id}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (templateResponse.ok) {
            const templateData = await templateResponse.json();
            if (templateData.template?.metadata) {
              setTemplate(templateData.template.metadata);
              applyTemplateStyling(templateData.template.metadata, data.calendar.template_id);
            }
          }
        } catch (templateErr) {
          console.warn('Failed to fetch template:', templateErr);
          // Continue without template - use defaults
        }
      }

      // Cache the data for offline support
      const cacheData: CalendarCache = {
        tiles: data.tiles || [],
        template: data.calendar?.template_id ? template : undefined,
        templateId: data.calendar?.template_id || undefined,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Error fetching tiles:', err);

      // Try to load from cache as fallback
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setTiles(parsed.tiles || []);
          setError('Using cached data - network error');
        } catch {
          setError(err instanceof Error ? err.message : 'Failed to fetch tiles');
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch tiles');
      }
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, isAuthenticated, API_BASE, CACHE_KEY]);

  const updateTile = useCallback(async (tileId: string, updates: Partial<CalendarTile>) => {
    if (!session?.access_token) throw new Error('Not authenticated');

    // Optimistic update
    const previousTiles = tiles;
    setTiles(prevTiles =>
      prevTiles.map(tile =>
        tile.tile_id === tileId ? { ...tile, ...updates, updated_at: new Date().toISOString() } : tile
      )
    );

    try {
      const response = await fetch(`${API_BASE}/api/calendar/tiles/${tileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setTiles(previousTiles);
        let errorMessage = `Failed to update tile (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response JSON:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      // Update cache
      const updatedTiles = tiles.map(tile =>
        tile.tile_id === tileId ? { ...tile, ...updates, updated_at: new Date().toISOString() } : tile
      );
      localStorage.setItem(CACHE_KEY, JSON.stringify({ tiles: updatedTiles, timestamp: Date.now() }));
    } catch (err) {
      console.error('Error updating tile:', err);
      // Revert optimistic update
      setTiles(previousTiles);
      throw err;
    }
  }, [session?.access_token, API_BASE, tiles, CACHE_KEY]);

  const uploadMedia = useCallback(async (tileId: string, file: File): Promise<string> => {
    if (!session?.access_token) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tileId', tileId);

    try {
      const response = await fetch(`${API_BASE}/api/calendar/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `Failed to upload media (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response JSON:', parseError);
          errorMessage = `Server error (${response.status}): ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      // Log media upload event
      analytics.logMediaUpload(file.type, file.size, tileId);

      return data.media_url;
    } catch (err) {
      console.error('Error uploading media:', err);
      throw err;
    }
  }, [session?.access_token, API_BASE]);

  const unlockTile = useCallback(async (tileId: string, note?: string): Promise<Gift> => {
    // Check if this is a guest session
    const guestSession = localStorage.getItem('guest_session');
    if (guestSession) {
      try {
        const parsed = JSON.parse(guestSession);
        if (parsed.isGuest) {
          // Handle guest tile unlocking locally
          const tile = tiles.find(t => t.tile_id === tileId);
          if (!tile) throw new Error('Tile not found');
          if (!tile.gift) throw new Error('No gift available for this tile');

          // Update tile locally for guest session
          setTiles(prevTiles =>
            prevTiles.map(t =>
              t.tile_id === tileId
                ? {
                    ...t,
                    gift_unlocked: true,
                    note_from_child: note || undefined,
                    opened_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  }
                : t
            )
          );

          // Log analytics events (will be tracked but not persisted for guests)
          analytics.logGiftUnlocked(tileId, tile.day, tile.gift.type);
          if (note) {
            analytics.logNoteSubmitted(tileId, tile.day, note.length);
          }

          return tile.gift;
        }
      } catch (error) {
        console.error('Error handling guest tile unlock:', error);
        throw new Error('Failed to unlock tile for guest session');
      }
    }

    if (!session?.access_token) throw new Error('Not authenticated');

    // For now, simulate unlocking - in a real implementation, this would call an API endpoint
    // Since the API doesn't have an unlock endpoint yet, we'll update the tile locally
    // and assume the gift is unlocked

    try {
      // Find the tile
      const tile = tiles.find(t => t.tile_id === tileId);
      if (!tile) throw new Error('Tile not found');
      if (!tile.gift) throw new Error('No gift available for this tile');

      // Update the tile as unlocked
      await updateTile(tileId, {
        gift_unlocked: true,
        note_from_child: note || undefined,
        opened_at: new Date().toISOString(),
      });

      // Log analytics events
      analytics.logGiftUnlocked(tileId, tile.day, tile.gift.type);
      if (note) {
        analytics.logNoteSubmitted(tileId, tile.day, note.length);
      }

      return tile.gift;
    } catch (err) {
      console.error('Error unlocking tile:', err);
      throw err;
    }
  }, [session?.access_token, tiles, updateTile]);

  useEffect(() => {
    fetchTiles();
  }, [fetchTiles]);

  return {
    tiles,
    loading,
    error,
    refetch: fetchTiles,
    updateTile,
    uploadMedia,
    unlockTile,
    template,
  };
};