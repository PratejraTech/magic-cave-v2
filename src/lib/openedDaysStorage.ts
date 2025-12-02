import { getOpenedDaysMap, setOpenedDaysMap } from './cookieStorage';

type OpenedDayMap = Record<number, string>;

const STORAGE_KEY = 'advent-opened-days';

const canUseStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

/**
 * Check if force unlock mode is enabled
 */
function isForceUnlock(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    import.meta.env.DEV ||
    String(import.meta.env.VITE_FORCE_UNLOCK ?? import.meta.env.FORCE_UNLOCK ?? '').toLowerCase() === 'true'
  );
}

export function loadOpenedDayMap(): OpenedDayMap {
  const forceUnlock = isForceUnlock();

  // When force unlock is false, use cookies for session persistence
  if (!forceUnlock) {
    try {
      const cookieMap = getOpenedDaysMap();
      // If cookie has data, use it
      if (Object.keys(cookieMap).length > 0) {
        return cookieMap;
      }
      // Otherwise, check localStorage for backward compatibility and migrate
      if (canUseStorage()) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw) as OpenedDayMap;
            // Migrate to cookies
            if (Object.keys(parsed).length > 0) {
              setOpenedDaysMap(parsed);
              return parsed;
            }
          }
        } catch {
          // Ignore localStorage errors
        }
      }
      return {};
    } catch (error) {
      console.error('Error loading opened days map from cookies:', error);
      return {};
    }
  }

  // When force unlock is true, use localStorage (for testing)
  if (!canUseStorage()) {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as OpenedDayMap;
    return parsed;
  } catch {
    return {};
  }
}

export function persistOpenedDay(dayId: number, openedAt: string) {
  const forceUnlock = isForceUnlock();

  // When force unlock is false, store in cookies
  if (!forceUnlock) {
    try {
      const data = loadOpenedDayMap();
      data[dayId] = openedAt;
      setOpenedDaysMap(data);
      return;
    } catch (error) {
      console.error('Error persisting opened day to cookies:', error);
      return;
    }
  }

  // When force unlock is true, use localStorage (for testing)
  if (!canUseStorage()) {
    return;
  }

  const data = loadOpenedDayMap();
  data[dayId] = openedAt;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetOpenedDays() {
  const forceUnlock = isForceUnlock();

  // When force unlock is false, clear cookies
  if (!forceUnlock) {
    try {
      setOpenedDaysMap({});
      return;
    } catch (error) {
      console.error('Error resetting opened days in cookies:', error);
      return;
    }
  }

  // When force unlock is true, clear localStorage (for testing)
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
}
