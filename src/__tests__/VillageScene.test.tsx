import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { VillageScene } from '../features/advent/components/VillageScene';
import { createCalendarDay } from './testUtils';
import type { CalendarDay } from '../types/calendar';

const mockLoadSound = vi.fn();

// Mock getAdelaideDate to return December 1st so tiles can be opened
vi.mock('../../lib/date', () => ({
  getAdelaideDate: () => new Date('2024-12-01T00:00:00Z'),
}));

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      init: vi.fn(),
      loadSound: mockLoadSound,
      play: vi.fn(),
    }),
  },
}));

vi.mock('../../features/advent/components/HouseCard', () => ({
  HouseCard: ({ day, onOpen, canOpen }: { day: CalendarDay; onOpen: (dayId: number) => void; canOpen?: boolean }) => {
    const handleClick = () => {
      // For testing purposes, always allow clicking
      onOpen(day.id);
    };
    return (
      <button data-testid={`day-${day.id}`} onClick={handleClick} disabled={canOpen === false}>
        Day {day.id}
      </button>
    );
  },
}));

vi.mock('../features/advent/components/Snowfall', () => ({
  Snowfall: () => <div data-testid="snowfall" />,
}));

vi.mock('../features/advent/components/NorthernLights', () => ({
  NorthernLights: () => <div data-testid="northern-lights" />,
}));

vi.mock('../features/advent/components/FloatingFireflies', () => ({
  FloatingFireflies: () => <div data-testid="fireflies" />,
}));

vi.mock('../features/advent/components/ButterflyCollection', () => ({
  ButterflyCollection: () => <div data-testid="butterflies" />,
}));

vi.mock('../features/advent/components/ButterflyPath', () => ({
  ButterflyPath: () => <div data-testid="butterfly-path" />,
}));

const mockDays = [
  createCalendarDay({ id: 1 }),
  createCalendarDay({ id: 2, is_opened: true, opened_at: '2023-12-02T00:00:00Z' }),
];

describe('VillageScene', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the village heading and house buttons', () => {
    render(<VillageScene days={mockDays} onOpenDay={vi.fn()} />);

    expect(screen.getByText(/Harper's Xmas Village/i)).toBeInTheDocument();
    expect(screen.getAllByTestId(/^day-/)).toHaveLength(2);
    expect(mockLoadSound).toHaveBeenCalledWith('door-creak', expect.any(String));
  });

  it('delegates clicks to onOpenDay', async () => {
    const user = userEvent.setup();
    const onOpenDay = vi.fn();
    render(<VillageScene days={mockDays} onOpenDay={onOpenDay} />);

    const day1Buttons = screen.getAllByTestId('day-1');
    await user.click(day1Buttons[0]);

    expect(onOpenDay).toHaveBeenCalledWith(1);
  });
});
