import type { CalendarTile } from '../types/calendar';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChildCalendar from '../components/ChildCalendar';
import { analytics } from '../lib/analytics';

vi.mock('../contexts/WinterEffectsContext', () => ({
  useWinterEffects: () => ({
    triggerCelebration: vi.fn()
  })
}));

vi.mock('../lib/analytics', () => ({
  analytics: {
    logTileOpened: vi.fn()
  }
}));

const tiles: CalendarTile[] = [
  {
    tile_id: 'tile-1',
    calendar_id: 'calendar-1',
    day: 1,
    title: 'Snowy Greeting',
    body: 'Welcome to day one!',
    gift_unlocked: false,
    gift: {
      type: 'sticker',
      title: 'Snowflake Sticker',
      description: 'Stick this on your journal',
      sticker: '❄️'
    },
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    tile_id: 'tile-2',
    calendar_id: 'calendar-1',
    day: 2,
    title: 'Future Surprise',
    body: 'Coming soon',
    gift_unlocked: false,
    version: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

describe('ChildCalendar tile interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the note prompt and unlocks a gift for a tile', async () => {
    const onUnlockTile = vi.fn(async () => ({
      type: 'sticker',
      title: 'Snowflake Sticker',
      description: 'Stick this on your journal',
      sticker: '❄️'
    }));

    render(<ChildCalendar tiles={tiles} onUnlockTile={onUnlockTile} />);

    fireEvent.click(screen.getByRole('button', { name: /Day 1/i }));

    const noteArea = screen.getByLabelText('Note to parent');
    fireEvent.change(noteArea, { target: { value: 'Thank you for the surprise!' } });

    fireEvent.click(screen.getByRole('button', { name: /Unlock gift/i }));

    await waitFor(() => expect(onUnlockTile).toHaveBeenCalledWith('tile-1', 'Thank you for the surprise!'));
    expect(analytics.logTileOpened).toHaveBeenCalledWith('tile-1', 1, 'calendar-1');

    await screen.findByText('Gift Unlocked!');
    expect(screen.getByText('Snowflake Sticker')).toBeInTheDocument();
  });
});
