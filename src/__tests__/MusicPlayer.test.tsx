import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { MusicPlayer } from '../components/MusicPlayer';

const mockInit = vi.fn();
const mockPlayMusic = vi.fn().mockResolvedValue(undefined);
const mockStopMusic = vi.fn();
const mockPauseMusic = vi.fn();
const mockResumeMusic = vi.fn().mockResolvedValue(undefined);
const mockGetCurrentMusic = vi.fn().mockReturnValue(null);
const mockSubscribe = vi.fn().mockReturnValue(() => {});
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
    expect(mockPlayMusic).toHaveBeenCalled();
    expect(musicButton).toHaveAttribute('aria-label', 'Pause music');

    await user.click(musicButton);
    expect(mockStopMusic).toHaveBeenCalled();
    expect(musicButton).toHaveAttribute('aria-label', 'Play music');
  });
});
