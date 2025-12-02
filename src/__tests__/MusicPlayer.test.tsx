import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
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
    const buttons = screen.getAllByRole('button');
    const musicButton = buttons.find((btn) =>
      btn.getAttribute('aria-label')?.includes('music')
    ) || buttons[0];

    await user.click(musicButton);

    await waitFor(() => {
      const updatedButton = screen.getByRole('button', { name: /pause music/i });
      expect(updatedButton).toBeInTheDocument();
    });

    const pauseButton = screen.getByRole('button', { name: /pause music/i });
    await user.click(pauseButton);
    expect(mockPauseMusic).toHaveBeenCalled();

    await waitFor(() => {
      const playButton = screen.getByRole('button', { name: /play music/i });
      expect(playButton).toBeInTheDocument();
    });
  });
});
