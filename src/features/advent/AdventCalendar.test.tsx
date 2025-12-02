import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdventCalendar from './AdventCalendar';
import { getAdelaideDate } from '../../lib/date';
import React from 'react';
import { AdventDay } from '../../types/advent';
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

// Mock getAdelaideDate
vi.mock('../../lib/date', () => ({
  getAdelaideDate: vi.fn(),
}));

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

const createMockDays = (): AdventDay[] =>
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
  });

  it('enables the button for the current day in December', () => {
    const mockDate = new Date('2024-12-05T12:00:00Z');
    (getAdelaideDate as any).mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonsDay5 = screen.getAllByText('5');
    const buttonDay5 = buttonsDay5.find(btn => btn.tagName === 'BUTTON') || buttonsDay5[0];
    expect(buttonDay5).not.toBeDisabled();

    const buttonsDay6 = screen.getAllByText('6');
    const buttonDay6 = buttonsDay6.find(btn => btn.tagName === 'BUTTON') || buttonsDay6[0];
    expect(buttonDay6).toBeDisabled();
  });

  it('disables all buttons if it is not December', () => {
    // Mock getAdelaideDate to return November date
    const mockDate = new Date('2024-11-05T12:00:00Z');
    (getAdelaideDate as any).mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    // Find all buttons and check they're disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('opens the modal when the correct button is clicked', async () => {
    const user = userEvent.setup();
    const mockDate = new Date('2024-12-05T12:00:00Z');
    (getAdelaideDate as any).mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonsDay5 = screen.getAllByText('5');
    const buttonDay5 = buttonsDay5.find(btn => btn.tagName === 'BUTTON' && !(btn as HTMLButtonElement).disabled) || buttonsDay5[0];
    await user.click(buttonDay5);

    // Fast-forward time to after the animation timeout
    vi.advanceTimersByTime(2100);

    // The modal should now be open - check for the title
    await waitFor(() => {
      const modalTitle = screen.queryByText('Day 5');
      expect(modalTitle).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
