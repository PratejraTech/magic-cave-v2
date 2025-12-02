import { SoundManager } from '../features/advent/utils/SoundManager';

const THEME_TRACK_FILENAMES = ['Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3', 'Jingle-Bells-3(chosic.com).mp3', 'silent-night-piano-version-christmas-background-music-12457.mp3', 'Ólafur\ Arnalds\ -\ Tomorrow\'s\ Song\ \(Living\ Room\ Songs\).mp3','Broadway_Kids_-_Rudolph_the_Red-Nosed_Reindeer_(mp3.pm).mp3'];
const RANDOM_START_WINDOW_SECONDS = 120;

/**
 * Get a random theme track path. Exported for use in other modules that need a single random track.
 */
export const getRandomThemeTrackPath = (): string => {
  const randomThemeTrackFilename = THEME_TRACK_FILENAMES[Math.floor(Math.random() * THEME_TRACK_FILENAMES.length)];
  return `/music/${encodeURIComponent(randomThemeTrackFilename)}`;
};

export const playThemeAtRandomPoint = async (manager: SoundManager) => {
  // Select a random song each time the function is called
  const themeTrackPath = getRandomThemeTrackPath();
  const randomStart = Math.floor(Math.random() * RANDOM_START_WINDOW_SECONDS);
  await manager.playMusic(themeTrackPath, randomStart);
};
