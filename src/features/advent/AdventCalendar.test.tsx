import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdventCalendar from './AdventCalendar';
import * as dateLib from '../../lib/date';
import React from 'react';
import { AdventDay } from '../../types/advent';

// Mock framer-motion to disable animations in tests
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    AnimatePresence: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    motion: {
      div: React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
        (props, ref) => <div {...props} ref={ref} />
      ),
      span: React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
        (props, ref) => <span {...props} ref={ref} />
      ),
      path: React.forwardRef<SVGPathElement, React.SVGProps<SVGPathElement>>(
        (props, ref) => <path {...props} ref={ref} />
      ),
    },
    useAnimation: () => ({
      start: vi.fn().mockResolvedValue(undefined),
    }),
  };
});

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
    vi.spyOn(dateLib, 'getAdelaideDate').mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonsDay5 = screen.getAllByText('5');
    const buttonDay5 = buttonsDay5.find(btn => btn.tagName === 'BUTTON') || buttonsDay5[0];
    expect(buttonDay5).not.toBeDisabled();

    const buttonsDay6 = screen.getAllByText('6');
    const buttonDay6 = buttonsDay6.find(btn => btn.tagName === 'BUTTON') || buttonsDay6[0];
    expect(buttonDay6).toBeDisabled();
  });

  it('disables all buttons if it is not December', () => {
    // November is month 10 (0-indexed), December is month 11
    const mockDate = new Date('2024-11-05T12:00:00Z');
    mockDate.getMonth = vi.fn().mockReturnValue(10); // November
    mockDate.getDate = vi.fn().mockReturnValue(5);
    vi.spyOn(dateLib, 'getAdelaideDate').mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    // Find all buttons and check they're disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('opens the modal when the correct button is clicked', async () => {
    const mockDate = new Date('2024-12-05T12:00:00Z');
    vi.spyOn(dateLib, 'getAdelaideDate').mockReturnValue(mockDate);

    render(<AdventCalendar days={createMockDays()} onOpenDay={vi.fn()} />);

    const buttonsDay5 = screen.getAllByText('5');
    const buttonDay5 = buttonsDay5.find(btn => btn.tagName === 'BUTTON' && !btn.disabled) || buttonsDay5[0];
    fireEvent.click(buttonDay5);

    // Fast-forward time to after the animation timeout
    vi.advanceTimersByTime(2100);

    // The modal should now be open - check for the title
    await waitFor(() => {
      const modalTitle = screen.queryByText('Day 5');
      expect(modalTitle).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
