import { render, screen } from '@testing-library/react';
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
      duckMusic: vi.fn(),
    }),
  },
}));

vi.mock('../features/advent/components/HouseCard', () => ({
  HouseCard: ({ day, canOpen }: { day: CalendarDay; onOpen: (dayId: number) => void; canOpen?: boolean }) => {
    const isOpened = day.is_opened;
    return (
      <button
        data-testid={`day-${day.id}`}
        disabled={canOpen === false || isOpened}
      >
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

    expect(screen.getByText(/Family Calendar/i)).toBeInTheDocument();
    expect(screen.getAllByTestId(/^day-/)).toHaveLength(2);
    expect(mockLoadSound).toHaveBeenCalledWith('door-creak', expect.any(String));
  });

  it('renders interactive day buttons', () => {
    render(<VillageScene days={mockDays} onOpenDay={vi.fn()} />);

    // Find day buttons (React StrictMode may cause multiple renders)
    const day1Buttons = screen.getAllByTestId('day-1');
    expect(day1Buttons.length).toBeGreaterThan(0);
    expect(day1Buttons[0]).not.toBeDisabled();

    const day2Buttons = screen.getAllByTestId('day-2');
    expect(day2Buttons.length).toBeGreaterThan(0);
    // Day 2 should be disabled since it's already opened
    expect(day2Buttons[0]).toBeDisabled();
  });
});
