import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { HouseCard } from '../features/advent/components/HouseCard';
import { createAdventDay } from './testUtils';

const mockInit = vi.fn();
const mockDuckMusic = vi.fn();
const mockPlay = vi.fn();
const mockConfettiBurst = vi.fn();

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      init: mockInit,
      duckMusic: mockDuckMusic,
      play: mockPlay,
    }),
  },
}));

vi.mock('../features/advent/utils/ConfettiSystem', () => ({
  ConfettiSystem: {
    burst: mockConfettiBurst,
  },
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

    fireEvent.click(screen.getByTestId('day-1'));

    expect(props.onOpen).not.toHaveBeenCalled();
  });

  it('opens the door and triggers effects', async () => {
    const props = defaultProps();
    render(<HouseCard {...props} />);

    fireEvent.click(screen.getByTestId('day-1'));

    await waitFor(() => {
      expect(props.onOpen).toHaveBeenCalledWith(1);
    }, { timeout: 3000 });
  });
});
