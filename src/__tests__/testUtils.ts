import type { CalendarDay } from '../types/calendar';
import { vi } from 'vitest';

export type CalendarDayFixture = CalendarDay & { day?: number };

export const createCalendarDay = (overrides: Partial<CalendarDayFixture> = {}): CalendarDayFixture => ({
  id: overrides.id ?? 1,
  message: overrides.message ?? 'Test message',
  photo_url: overrides.photo_url ?? '/test.jpg',
  is_opened: overrides.is_opened ?? false,
  opened_at: overrides.opened_at ?? null,
  created_at: overrides.created_at ?? '2023-12-01T00:00:00Z',
  title: overrides.title ?? `Day ${overrides.id ?? 1}`,
  subtitle: overrides.subtitle ?? 'Test subtitle',
  musicUrl: overrides.musicUrl,
  voiceUrl: overrides.voiceUrl,
  confettiType: overrides.confettiType ?? 'snow',
  unlockEffect: overrides.unlockEffect,
  day: overrides.day ?? overrides.id ?? 1,
});

/**
 * Creates a shared mock SoundManager instance with all methods
 * Use this in tests to ensure consistent mocking across test files
 */
export const createMockSoundManager = () => ({
  init: vi.fn().mockResolvedValue(undefined),
  loadSound: vi.fn(),
  duckMusic: vi.fn(),
  play: vi.fn(),
  playMusic: vi.fn(),
  stopMusic: vi.fn(),
  pauseMusic: vi.fn(),
  resumeMusic: vi.fn().mockResolvedValue(undefined),
  subscribeToMusic: vi.fn().mockReturnValue(() => {}),
  isMusicPlaying: vi.fn().mockReturnValue(false),
  getCurrentMusic: vi.fn().mockReturnValue(null),
});

/**
 * Clears all mocks in a SoundManager mock instance
 */
export const clearMockSoundManager = (mockSoundManager: ReturnType<typeof createMockSoundManager>) => {
  Object.values(mockSoundManager).forEach((maybeMock) => {
    if (typeof maybeMock === 'function' && 'mockClear' in maybeMock) {
      (maybeMock as { mockClear: () => void }).mockClear();
    }
  });
};

/**
 * Default video options used in App.tsx for testing
 */
export const DEFAULT_VIDEO_OPTIONS = [
  'https://www.youtube.com/embed/-Qt9OdhbVBQ',
  'https://www.youtube.com/embed/yRSVkNK3zaM',
  'https://www.youtube.com/embed/gE-dmCYBYqk',
  'https://www.youtube.com/embed/vyqMf_CJjPU',
  'https://youtube.com/shorts/embed/_XTMO_xS-cI',
  'https://youtube.com/shorts/embed/lG66BRozNFc',
  'https://youtube.com/shorts/embed/KYVP8pNMR7M',
];

/**
 * Default surprise options from adventMemories (first 4 days have surpriseVideoUrl)
 */
export const DEFAULT_SURPRISE_OPTIONS = [
  'https://www.youtube.com/embed/DXePdez8NcM?rel=0',
  'https://www.youtube.com/embed/bqjyTjdVfsA?rel=0',
  'https://www.youtube.com/embed/7jlxxG253ZQ?rel=0',
  'https://www.youtube.com/embed/mSw0nmOnd7s?list=RDmSw0nmOnd7s',
];
