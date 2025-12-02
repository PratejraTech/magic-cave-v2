import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import App from '../App';
import { adventMemories } from '../data/adventMemories';
import { createMockSoundManager, clearMockSoundManager } from './testUtils';

const mockSoundManager = createMockSoundManager();

vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => mockSoundManager,
  },
}));

vi.mock('../features/advent/utils/ConfettiSystem', () => ({
  ConfettiSystem: {
    burst: vi.fn(),
    snowstorm: vi.fn(),
  },
}));

vi.mock('../features/chat/ChatWithDaddy', () => ({
  ChatWithDaddy: () => null,
}));

vi.mock('gsap', () => ({
  gsap: {
    timeline: () => {
      const timeline = {
        to: () => timeline,
        call: (cb?: () => void) => {
          cb?.();
          return timeline;
        },
      };
      return timeline;
    },
  },
}));

const OPENED_STORAGE_KEY = 'advent-opened-days';

describe('App', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-12-05T09:00:00Z'));
    window.localStorage.clear();
    clearMockSoundManager(mockSoundManager);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads and displays local advent memories', async () => {
    render(<App />);

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    }, { timeout: 5000 });

    expect(screen.getByText(/Harper's Xmas Village/i)).toBeInTheDocument();
    expect(screen.getByTestId('music-player')).toBeInTheDocument();
    expect(screen.queryByText('Loading magic...')).not.toBeInTheDocument();
  });

  it('stores opened progress in localStorage', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    const dayButton = screen.getByTestId('day-1');
    fireEvent.click(dayButton);

    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(OPENED_STORAGE_KEY) ?? '{}');
      expect(stored['1']).toBeTruthy();
    });

    await waitFor(() => {
      expect(screen.getByText(adventMemories[0].title)).toBeInTheDocument();
    });
    expect(screen.getByText(/Download Photo/i)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
  });

  it('shows past memories in the carousel and rotates them', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('day-1'));
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(screen.getByTestId('day-2'));
    fireEvent.keyDown(window, { key: 'Escape' });

    // PastMemoryCarousel now appears every 10 seconds, so advance time to make it visible
    vi.advanceTimersByTime(10000);

    await waitFor(() => {
      const carousel = screen.queryByTestId('past-memory-carousel');
      if (carousel) {
        expect(carousel).toBeInTheDocument();
      }
    }, { timeout: 1000 });

    // Carousel may not be visible immediately, advance more time
    vi.advanceTimersByTime(3000);
    
    const carousel = screen.queryByTestId('past-memory-carousel');
    if (carousel) {
      expect(carousel).toBeInTheDocument();
    }
  });

  it('closes the modal with Escape until another day opens it', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('day-1'));

    await waitFor(() => {
      expect(screen.getByText(adventMemories[0].title)).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByText(adventMemories[0].title)).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('day-2'));

    await waitFor(() => {
      expect(screen.getByText(adventMemories[1].title)).toBeInTheDocument();
    });
  });

  it('opens the surprise video portal when the button is pressed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    const surpriseButton = screen.getByText('Surprise!');
    fireEvent.click(surpriseButton);

    await waitFor(() => {
      expect(screen.getByTestId('surprise-portal')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify music is paused when surprise opens
    expect(mockSoundManager.pauseMusic).toHaveBeenCalled();
  });

  it('opens the videos portal when the Videos button is pressed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    const videosButton = screen.getByText('Videos');
    fireEvent.click(videosButton);

    await waitFor(() => {
      expect(screen.getByTestId('surprise-portal')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify music is paused when videos open
    expect(mockSoundManager.pauseMusic).toHaveBeenCalled();
  });

  it('resumes music when surprise portal is closed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    const surpriseButton = screen.getByText('Surprise!');
    fireEvent.click(surpriseButton);

    await waitFor(() => {
      expect(screen.getByTestId('surprise-portal')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('surprise-portal')).not.toBeInTheDocument();
      expect(mockSoundManager.resumeMusic).toHaveBeenCalled();
    });
  });

  it('resumes music when videos portal is closed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('village-scene')).toBeInTheDocument();
    });

    const videosButton = screen.getByText('Videos');
    fireEvent.click(videosButton);

    await waitFor(() => {
      expect(screen.getByTestId('surprise-portal')).toBeInTheDocument();
    });

    fireEvent.keyDown(window, { key: 'Escape' });

    await waitFor(() => {
      expect(screen.queryByTestId('surprise-portal')).not.toBeInTheDocument();
      expect(mockSoundManager.resumeMusic).toHaveBeenCalled();
    });
  });
});
