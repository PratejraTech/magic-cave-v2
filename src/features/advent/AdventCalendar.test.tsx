import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdventCalendar from './AdventCalendar';
import { getAdelaideDate } from '../../lib/date';
import React from 'react';
import { CalendarDay } from '../../types/calendar';
import userEvent from '@testing-library/user-event';

// Mock framer-motion to disable animations in tests
vi.mock('framer-motion', () => {
  return {
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    motion: {
      div: (props: any) => <div {...props} />,
      span: (props: any) => <span {...props} />,
      path: (props: any) => <path {...props} />,
    },
    useAnimation: () => ({
      start: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

// Mock getAdelaideDate module
vi.mock('../../lib/date', () => ({
  getAdelaideDate: vi.fn(),
}));

vi.mock('../../components/Butterfly', () => ({
  Butterfly: ({ onAnimationComplete }: { onAnimationComplete: () => void }) => {
    React.useEffect(() => {
      // Immediately call onAnimationComplete in tests
      setTimeout(() => onAnimationComplete(), 0);
    }, [onAnimationComplete]);
    return <div data-testid="butterfly" />;
  },
}));

const createMockDays = (): CalendarDay[] =>
  Array.from({ length: 25 }, (_, index) => ({
    id: index + 1,
    message: `Message ${index + 1}`,
    title: `Day ${index + 1}`,
    photo_url: 'https://via.placeholder.com/400x300',
    is_opened: false,
    opened_at: null,
    created_at: new Date().toISOString(),
  }));

describe('AdventCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  // Run the November test first to see if it passes when it's first
  it('disables all buttons if it is not December', () => {
    // Mock getAdelaideDate to return November date
    const mockDate = new Date('2024-11-05T12:00:00Z');
    vi.mocked(getAdelaideDate).mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    // Find all buttons and check they're disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('enables the button for the current day in December', () => {
    const mockDate = new Date('2024-12-05T12:00:00Z');
    vi.mocked(getAdelaideDate).mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonsDay5 = screen.getAllByRole('button', { name: '5' });
    expect(buttonsDay5.length).toBeGreaterThan(0);
    buttonsDay5.forEach(button => {
      expect(button).not.toBeDisabled();
    });

    const buttonsDay6 = screen.getAllByRole('button', { name: '6' });
    expect(buttonsDay6.length).toBeGreaterThan(0);
    buttonsDay6.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('opens the modal when the correct button is clicked', async () => {
    const user = userEvent.setup();
    const mockDate = new Date('2024-12-05T12:00:00Z');
    vi.mocked(getAdelaideDate).mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    // Find the enabled button for day 5 (not disabled)
    const buttons = screen.getAllByRole('button', { name: '5' });
    const enabledButton = buttons.find(button => !button.hasAttribute('disabled'));
    expect(enabledButton).toBeInTheDocument();

    await user.click(enabledButton!);

    // The modal should open after the butterfly animation completes
    // The Butterfly component calls onAnimationComplete immediately in tests (setTimeout 0)
    await waitFor(() => {
      const modalTitle = screen.getByText('Day 5');
      expect(modalTitle).toBeInTheDocument();
    });
  });
});
