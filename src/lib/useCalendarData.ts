import { useState, useEffect, useCallback } from 'react';
import { CalendarTile, Gift } from '../types/advent';
import { useAuth } from './AuthContext';

export interface UseCalendarDataReturn {
  tiles: CalendarTile[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTile: (tileId: string, updates: Partial<CalendarTile>) => Promise<void>;
  uploadMedia: (tileId: string, file: File) => Promise<string>;
  unlockTile: (tileId: string, note?: string) => Promise<Gift>;
}

export const useCalendarData = (): UseCalendarDataReturn => {
  const { sessionToken, isAuthenticated } = useAuth();
  const [tiles, setTiles] = useState<CalendarTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = import.meta.env.VITE_CHAT_API_URL || import.meta.env.CHAT_API_URL || (import.meta.env.PROD ? '' : 'https://toharper.dad');

  const fetchTiles = useCallback(async () => {
    if (!isAuthenticated || !sessionToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/api/calendar/tiles`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tiles: ${response.statusText}`);
      }

      const data = await response.json();
      setTiles(data.tiles || []);
    } catch (err) {
      console.error('Error fetching tiles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tiles');
    } finally {
      setLoading(false);
    }
  }, [sessionToken, isAuthenticated, API_BASE]);

  const updateTile = useCallback(async (tileId: string, updates: Partial<CalendarTile>) => {
    if (!sessionToken) throw new Error('Not authenticated');

    try {
      const response = await fetch(`${API_BASE}/api/calendar/tiles/${tileId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tile');
      }

      // Update local state
      setTiles(prevTiles =>
        prevTiles.map(tile =>
          tile.tile_id === tileId ? { ...tile, ...updates, updated_at: new Date().toISOString() } : tile
        )
      );
    } catch (err) {
      console.error('Error updating tile:', err);
      throw err;
    }
  }, [sessionToken, API_BASE]);

  const uploadMedia = useCallback(async (tileId: string, file: File): Promise<string> => {
    if (!sessionToken) throw new Error('Not authenticated');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tileId', tileId);

    try {
      const response = await fetch(`${API_BASE}/api/calendar/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload media');
      }

      const data = await response.json();
      return data.media_url;
    } catch (err) {
      console.error('Error uploading media:', err);
      throw err;
    }
  }, [sessionToken, API_BASE]);

  const unlockTile = useCallback(async (tileId: string, note?: string): Promise<Gift> => {
    if (!sessionToken) throw new Error('Not authenticated');

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

      return tile.gift;
    } catch (err) {
      console.error('Error unlocking tile:', err);
      throw err;
    }
  }, [sessionToken, tiles, updateTile]);

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
  };
};