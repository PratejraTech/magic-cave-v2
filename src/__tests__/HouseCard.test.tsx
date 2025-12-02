import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HouseCard } from '../features/advent/components/HouseCard';
import { createAdventDay } from './testUtils';

const mockInit = vi.fn();
const mockDuckMusic = vi.fn();
const mockPlay = vi.fn();
const mockConfettiBurst = vi.fn();

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => <div onClick={onClick} {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('gsap', () => ({
  gsap: {
    timeline: () => ({
      to: vi.fn().mockReturnThis(),
      call: vi.fn().mockImplementation((callback: () => void) => {
        callback?.();
        return {
          to: vi.fn().mockReturnThis(),
          call: vi.fn().mockReturnThis(),
        };
      }),
    }),
  },
}));



vi.mock('../features/advent/utils/ConfettiSystem', () => ({
  ConfettiSystem: {
    burst: mockConfettiBurst,
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, onClick, ...props }: any) => <div onClick={onClick} {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: vi.fn().mockResolvedValue(undefined),
  }),
}));

vi.mock('gsap', () => ({
  gsap: {
    timeline: () => ({
      to: vi.fn().mockReturnThis(),
      call: vi.fn().mockImplementation((callback: () => void) => {
        callback?.();
        return {
          to: vi.fn().mockReturnThis(),
          call: vi.fn().mockReturnThis(),
        };
      }),
    }),
  },
}));

const defaultProps = () => ({
  day: createAdventDay(),
  onOpen: vi.fn(),
  canOpen: true,
});

describe('HouseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockInit.mockClear();
    mockDuckMusic.mockClear();
    mockPlay.mockClear();
    mockConfettiBurst.mockClear();
  });

  it('renders the closed day state', () => {
    render(<HouseCard {...defaultProps()} />);

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(mockInit).toHaveBeenCalled();
  });

  it('prevents opening when locked', () => {
    const props = { ...defaultProps(), canOpen: false };
    render(<HouseCard {...props} />);

    const dayElements = screen.getAllByTestId('day-1');
    fireEvent.click(dayElements[0]);

    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it('opens the door and triggers effects', async () => {
    const props = defaultProps();
    render(<HouseCard {...props} />);

    const dayElements = screen.getAllByTestId('day-1');
    fireEvent.click(dayElements[0]);

    await waitFor(() => {
      expect(props.onOpen).toHaveBeenCalledWith(1);
    }, { timeout: 3000 });
  });
});
