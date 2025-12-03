import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MusicPlayer } from '../components/MusicPlayer';

const mockInit = vi.fn();
const mockPlayMusic = vi.fn();
const mockStopMusic = vi.fn().mockImplementation(() => {
  if (subscribeCallback) subscribeCallback(false);
});
const mockPauseMusic = vi.fn();
const mockResumeMusic = vi.fn().mockResolvedValue(undefined);
const mockGetCurrentMusic = vi.fn().mockReturnValue(null);
let subscribeCallback: (isPlaying: boolean) => void;
const mockSubscribe = vi.fn().mockImplementation((callback) => {
  subscribeCallback = callback;
  return () => {};
});
const mockIsPlaying = vi.fn().mockReturnValue(false);


vi.mock('../features/advent/utils/SoundManager', () => ({
  SoundManager: {
    getInstance: () => ({
      init: mockInit,
      playMusic: mockPlayMusic,
      stopMusic: mockStopMusic,
      pauseMusic: mockPauseMusic,
      resumeMusic: mockResumeMusic,
      getCurrentMusic: mockGetCurrentMusic,
      subscribeToMusic: mockSubscribe,
      isMusicPlaying: mockIsPlaying,
    }),
  },
}));

vi.mock('../lib/musicTheme', () => ({
  playThemeAtRandomPoint: vi.fn().mockImplementation(async () => {
    if (subscribeCallback) subscribeCallback(true);
  }),
}));

describe('MusicPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the play button by default', () => {
    render(<MusicPlayer />);

    const button = screen.getByRole('button', { name: /play music/i });
    expect(button).toBeInTheDocument();
    expect(mockInit).toHaveBeenCalled();
  });

  it('toggles playback via the SoundManager', async () => {
    const user = userEvent.setup();
    render(<MusicPlayer />);

    // Wait for initial render to stabilize
    await waitFor(() => {
      const buttons = screen.getAllByRole('button', { name: /play music/i });
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Get the first play button (React StrictMode may cause double rendering)
    const playButtons = screen.getAllByRole('button', { name: /play music/i });
    expect(playButtons.length).toBeGreaterThan(0);
    const playButton = playButtons[0];

    await user.click(playButton);

    // Wait for state change and re-render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /pause music/i })).toBeInTheDocument();
    });

    const pauseButton = screen.getByRole('button', { name: /pause music/i });
    await user.click(pauseButton);
    expect(mockPauseMusic).toHaveBeenCalled();

    // Wait for final state change
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /play music/i })).toBeInTheDocument();
    });
  });
});
