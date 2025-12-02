import type { CalendarEntry } from '../types/calendar';

const STORAGE_PREFIX = 'advent-photo-';

const svgUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
export const PHOTO_STORAGE_PATH = '/photos';

const formatDay = (dayId: number) => dayId.toString().padStart(2, '0');
export const getPhotoPath = (dayId: number) => `${PHOTO_STORAGE_PATH}/day-${formatDay(dayId)}.jpg`;

const paletteImages: Record<CalendarEntry['palette'], string> = {
  sunrise: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#ff9a9e"/><stop offset="100%" stop-color="#fad0c4"/></linearGradient></defs><rect width="200" height="200" fill="url(#g)" rx="30"/><path d="M100 160c60-40 80-70 80-100a40 40 0 0 0-80-10 40 40 0 0 0-80 10c0 30 20 60 80 100z" fill="#fff2f5" opacity="0.9"/></svg>`
  ),
  twilight: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#a18cd1"/><stop offset="100%" stop-color="#fbc2eb"/></linearGradient></defs><rect width="200" height="200" fill="url(#t)" rx="30"/><circle cx="140" cy="60" r="35" fill="#ffe9ff"/><circle cx="70" cy="130" r="28" fill="#ffe9ff" opacity="0.9"/><circle cx="100" cy="100" r="60" fill="none" stroke="#fff7ff" stroke-width="6"/></svg>`
  ),
  forest: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="f" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#a8e063"/><stop offset="100%" stop-color="#56ab2f"/></linearGradient></defs><rect width="200" height="200" rx="30" fill="url(#f)"/><path d="M50 150 L70 80 L90 150 Z" fill="#fff"/><path d="M100 150 L120 70 L140 150 Z" fill="#f9fbe7"/><path d="M130 150 L150 90 L170 150 Z" fill="#fff"/></svg>`
  ),
  starlight: svgUri(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="s" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#1e3c72"/><stop offset="100%" stop-color="#2a5298"/></linearGradient></defs><rect width="200" height="200" rx="30" fill="url(#s)"/><g fill="#ffd9fb"><circle cx="60" cy="60" r="6"/><circle cx="120" cy="40" r="4"/><circle cx="150" cy="80" r="8"/><circle cx="80" cy="140" r="5"/><circle cx="140" cy="150" r="7"/></g></svg>`
  ),
};

const getStorageKey = (dayId: number) => `${STORAGE_PREFIX}${dayId}`;

export function seedImageStore(memories: CalendarEntry[]) {
  if (typeof window === 'undefined') return;

  memories.forEach((memory) => {
    const key = getStorageKey(memory.id);
    const asset = memory.photoPath ?? paletteImages[memory.palette];
    window.localStorage.setItem(key, asset);
  });
}

export function getImageForDay(dayId: number, palette: CalendarEntry['palette']) {
  const fallback = paletteImages[palette];

  if (typeof window === 'undefined') return fallback;

  const stored = window.localStorage.getItem(getStorageKey(dayId));
  if (stored) {
    return stored;
  }

  return getPhotoPath(dayId);
}
