/**
 * Christmas Sound System
 * Manages all audio effects for magical interactions
 */

export type SoundEffect =
  | 'snow_click'      // Soft chime when clicking snow
  | 'tile_unlock'     // Magical unlock sound
  | 'tile_hover'      // Gentle sparkle on hover
  | 'gift_reveal'     // Triumphant reveal sound
  | 'celebration'     // Party celebration
  | 'butterfly_tap'   // Delicate flutter sound
  | 'voice_activate'  // Voice command activated
  | 'progress_milestone' // Achievement sound
  | 'jingle_bells'    // Christmas jingle
  | 'magic_sparkle'   // General magical sparkle
  | 'whoosh'          // Swipe/gesture sound
  | 'success_chime';  // Success notification

interface SoundConfig {
  volume: number;
  playbackRate: number;
  loop: boolean;
}

interface SoundAsset {
  url: string;
  audio?: HTMLAudioElement;
  config: Partial<SoundConfig>;
}

class ChristmasSoundSystem {
  private sounds: Map<SoundEffect, SoundAsset> = new Map();
  private enabled: boolean = true;
  private masterVolume: number = 0.7;
  private isInitialized: boolean = false;

  constructor() {
    this.loadSoundAssets();
  }

  /**
   * Load sound assets
   * Note: In production, replace these with actual sound files
   * For now, we'll use Web Audio API to generate simple tones
   */
  private loadSoundAssets(): void {
    // Sound definitions with fallback to generated tones
    const soundAssets: Record<SoundEffect, Partial<SoundConfig> & { frequency?: number; duration?: number }> = {
      snow_click: { volume: 0.3, playbackRate: 1, frequency: 2000, duration: 100 },
      tile_hover: { volume: 0.2, playbackRate: 1.2, frequency: 1500, duration: 50 },
      tile_unlock: { volume: 0.5, playbackRate: 1, frequency: 800, duration: 300 },
      gift_reveal: { volume: 0.6, playbackRate: 1, frequency: 1200, duration: 500 },
      celebration: { volume: 0.7, playbackRate: 1, frequency: 600, duration: 800 },
      butterfly_tap: { volume: 0.3, playbackRate: 1.5, frequency: 2500, duration: 150 },
      voice_activate: { volume: 0.4, playbackRate: 1, frequency: 1000, duration: 200 },
      progress_milestone: { volume: 0.6, playbackRate: 1, frequency: 900, duration: 400 },
      jingle_bells: { volume: 0.5, playbackRate: 1, frequency: 1500, duration: 600 },
      magic_sparkle: { volume: 0.4, playbackRate: 1.3, frequency: 1800, duration: 250 },
      whoosh: { volume: 0.3, playbackRate: 1, frequency: 500, duration: 150 },
      success_chime: { volume: 0.5, playbackRate: 1, frequency: 1100, duration: 350 }
    };

    // Store sound configurations
    Object.entries(soundAssets).forEach(([sound, config]) => {
      this.sounds.set(sound as SoundEffect, {
        url: `/sounds/${sound}.mp3`, // Placeholder for actual files
        config
      });
    });
  }

  /**
   * Initialize the sound system (call after user interaction)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if user preferences allow sound
      const soundPreference = localStorage.getItem('christmas_sounds_enabled');
      if (soundPreference === 'false') {
        this.enabled = false;
      }

      this.isInitialized = true;
      console.log('🔊 Christmas Sound System initialized');
    } catch (error) {
      console.error('Failed to initialize sound system:', error);
    }
  }

  /**
   * Play a sound effect
   */
  play(effect: SoundEffect, volumeOverride?: number): void {
    if (!this.enabled || !this.isInitialized) return;

    const sound = this.sounds.get(effect);
    if (!sound) return;

    try {
      // Try to use actual audio file if available
      if (sound.audio) {
        this.playAudioElement(sound.audio, volumeOverride, sound.config);
      } else {
        // Fallback to generated tone
        this.playGeneratedTone(sound, volumeOverride);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${effect}:`, error);
    }
  }

  /**
   * Play audio element
   */
  private playAudioElement(audio: HTMLAudioElement, volumeOverride?: number, config?: Partial<SoundConfig>): void {
    const clone = audio.cloneNode() as HTMLAudioElement;
    clone.volume = (volumeOverride ?? config?.volume ?? 1) * this.masterVolume;
    clone.playbackRate = config?.playbackRate ?? 1;
    clone.play().catch(() => {
      // Silently fail if playback is blocked
    });
  }

  /**
   * Generate and play tone using Web Audio API
   */
  private playGeneratedTone(sound: SoundAsset, volumeOverride?: number): void {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      const frequency = (sound.config as any).frequency || 800;
      const duration = (sound.config as any).duration || 200;
      const volume = (volumeOverride ?? sound.config.volume ?? 0.5) * this.masterVolume;

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Envelope for smoother sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);

      // Cleanup
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
      }, duration + 100);
    } catch (error) {
      // Silently fail if Web Audio API is not available
    }
  }

  /**
   * Play a sequence of sounds
   */
  playSequence(effects: SoundEffect[], delayMs: number = 100): void {
    effects.forEach((effect, index) => {
      setTimeout(() => this.play(effect), index * delayMs);
    });
  }

  /**
   * Play celebration sound pattern
   */
  playCelebration(): void {
    this.playSequence([
      'magic_sparkle',
      'success_chime',
      'jingle_bells',
      'celebration'
    ], 150);
  }

  /**
   * Play unlock sequence
   */
  playUnlockSequence(): void {
    this.playSequence([
      'tile_unlock',
      'magic_sparkle',
      'gift_reveal'
    ], 200);
  }

  /**
   * Set master volume (0-1)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('christmas_master_volume', volume.toString());
  }

  /**
   * Enable/disable sound system
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('christmas_sounds_enabled', enabled.toString());
  }

  /**
   * Get current enabled state
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Toggle sound on/off
   */
  toggle(): boolean {
    this.enabled = !this.enabled;
    localStorage.setItem('christmas_sounds_enabled', this.enabled.toString());
    return this.enabled;
  }

  /**
   * Preload actual audio files (when available)
   */
  async preloadSounds(soundEffects: SoundEffect[]): Promise<void> {
    const promises = soundEffects.map(async (effect) => {
      const sound = this.sounds.get(effect);
      if (!sound) return;

      try {
        const audio = new Audio(sound.url);
        audio.preload = 'auto';
        await audio.load();
        sound.audio = audio;
      } catch (error) {
        // Sound file not found, will use generated tone
        console.warn(`Sound file not found for ${effect}, using generated tone`);
      }
    });

    await Promise.allSettled(promises);
  }
}

// Export singleton instance
export const christmasSounds = new ChristmasSoundSystem();

// Utility functions for common sound patterns
export const soundPatterns = {
  /**
   * Snow interaction sound
   */
  snowClick: () => christmasSounds.play('snow_click', 0.3),

  /**
   * Tile unlock with celebration
   */
  tileUnlock: () => christmasSounds.playUnlockSequence(),

  /**
   * Hover effect
   */
  hoverSparkle: () => christmasSounds.play('tile_hover', 0.2),

  /**
   * Full celebration
   */
  celebrate: () => christmasSounds.playCelebration(),

  /**
   * Progress milestone
   */
  milestone: () => christmasSounds.playSequence(['progress_milestone', 'jingle_bells'], 300),

  /**
   * Voice command
   */
  voiceActivated: () => christmasSounds.play('voice_activate'),

  /**
   * Butterfly interaction
   */
  butterflyMagic: () => christmasSounds.play('butterfly_tap'),

  /**
   * Gesture magic
   */
  gestureMagic: () => christmasSounds.playSequence(['whoosh', 'magic_sparkle'], 100)
};
