import { useEffect, useState } from 'react';
import { Play, Pause } from 'lucide-react';
import { SoundManager } from '../features/advent/utils/SoundManager';
import { playThemeAtRandomPoint } from '../lib/musicTheme';

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUnlocked, setHasUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wasPaused, setWasPaused] = useState(false);
  const soundManager = SoundManager.getInstance();

  useEffect(() => {
    soundManager.init();
    const unsubscribe = soundManager.subscribeToMusic(setIsPlaying);

    const handlePointerUnlock = async () => {
      if (hasUnlocked) return;
      try {
        await playThemeAtRandomPoint(soundManager);
        setHasUnlocked(true);
        window.removeEventListener('pointerdown', handlePointerUnlock);
      } catch {
        setHasUnlocked(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerUnlock);
    return () => {
      window.removeEventListener('pointerdown', handlePointerUnlock);
      unsubscribe();
    };
  }, [soundManager, hasUnlocked]);

  const handleToggle = async () => {
    if (isPlaying) {
      // Pause the music and mark that we paused (so next play will change song)
      soundManager.pauseMusic();
      setWasPaused(true);
      return;
    }

    // When playing after a pause, select a new random song
    // Otherwise, if music was paused by SoundManager (e.g., from other components),
    // resume the current song without changing it
    try {
      setIsLoading(true);
      if (wasPaused) {
        // We explicitly paused, so select a new random song when resuming
        await playThemeAtRandomPoint(soundManager);
        setWasPaused(false);
      } else {
        // Check if SoundManager has a paused song to resume
        const currentMusic = soundManager.getCurrentMusic();
        if (currentMusic) {
          // Resume the existing song without changing it
          await soundManager.resumeMusic();
        } else {
          // No current song, select a random one (first play)
          await playThemeAtRandomPoint(soundManager);
        }
      }
      setHasUnlocked(true);
    } catch (error) {
      console.error('Failed to start music', error);
      setIsPlaying(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div data-testid="music-player" className="flex justify-center">
      <button
        onClick={handleToggle}
        className="p-4 rounded-full transition-all duration-300 transform hover:scale-125 bg-gradient-to-br from-golden to-peppermint shadow-lg hover:shadow-xl disabled:opacity-60"
        disabled={isLoading}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
      >
        {isPlaying ? (
          <Pause className="w-6 h-6 text-white" />
        ) : (
          <Play className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
