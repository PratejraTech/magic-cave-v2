import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import ChildCalendar from '../components/ChildCalendar';
import { CalendarTile, GiftType } from '../types/advent';

const mockTiles: CalendarTile[] = [
  {
    tile_id: 'tile-1',
    calendar_id: 'cal-1',
    day: 1,
    title: 'Day 1',
    body: 'First day message',
    gift: {
      type: 'sticker' as GiftType,
      title: 'Star Sticker',
      description: 'A shiny star',
      sticker: '⭐'
    },
    gift_unlocked: false,
    version: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    tile_id: 'tile-2',
    calendar_id: 'cal-1',
    day: 2,
    title: 'Day 2',
    gift: undefined,
    gift_unlocked: false,
    version: 1,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

const mockUnlockTile = vi.fn().mockResolvedValue({
  type: 'sticker' as GiftType,
  title: 'Star Sticker',
  sticker: '⭐'
});

describe('ChildCalendar Layout Variants', () => {
  it('renders with rounded tiles layout by default', () => {
    const { container } = render(<ChildCalendar tiles={mockTiles} onUnlockTile={mockUnlockTile} />);

    const tiles = container.querySelectorAll('[role="button"]');
    expect(tiles).toHaveLength(2);

    // Check that tiles have rounded corners (default)
    tiles.forEach(tile => {
      expect(tile).toHaveClass('rounded-lg');
    });
  });

  it('renders with square tiles layout', () => {
    const { container } = render(<ChildCalendar tiles={mockTiles} onUnlockTile={mockUnlockTile} layout="square_tiles" />);

    const tiles = container.querySelectorAll('[role="button"]');
    expect(tiles).toHaveLength(2);

    // Check that tiles have no rounded corners
    tiles.forEach(tile => {
      expect(tile).toHaveClass('rounded-none');
      expect(tile).not.toHaveClass('rounded-lg');
    });
  });

  it('renders with hexagon tiles layout', () => {
    const { container } = render(<ChildCalendar tiles={mockTiles} onUnlockTile={mockUnlockTile} layout="hexagon_tiles" />);

    const tiles = container.querySelectorAll('[role="button"]');
    expect(tiles).toHaveLength(2);

    // Check that tiles have hexagon clip-path applied
    tiles.forEach(tile => {
      expect(tile).toHaveAttribute('style');
      expect(tile.getAttribute('style')).toContain('clip-path: polygon');
    });
  });

  it('displays tile content correctly', () => {
    const { container } = render(<ChildCalendar tiles={mockTiles} onUnlockTile={mockUnlockTile} />);

    expect(container).toHaveTextContent('Day 1');
    expect(container).toHaveTextContent('Day 2');
    expect(container).toHaveTextContent('🎁 Gift!');
    expect(container).toHaveTextContent('No gift yet');
  });
});