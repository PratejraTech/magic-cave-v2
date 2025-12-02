import type { AdventMemory } from '../types/advent';
import { getPhotoPath } from '../lib/localImageStore';
import { photoPairs } from './photoPairs.generated';

const titleSeeds = [
  'Butterfly Meadow Parade',
  'Heart Garden Treasure Hunt',
  'Rainbow Wing Dance Party',
  'Twilight Snuggle Caravan',
  'Stardust Storytime Picnic',
  'Aurora Flutter Adventure',
];

const messageSeeds: Array<(day: number) => string> = [
  (day) =>
    `Day ${day} begins with twinkling heart-lanterns and a swirl of pastel wings who whisper, "You make the sky brighter!"`,
  (day) =>
    `Take a deep breath on day ${day} and blow gentle kisses into the air—friendly butterflies will carry them to someone who needs a hug today.`,
  (day) =>
    `Build a tiny trail of day-${day} love-heart pebbles and follow it to a giggling butterfly who shares a secret dance just for you.`,
  (day) =>
    `On day ${day}, scoop up handfuls of shimmer snow, toss them high, and watch butterflies draw glowing rainbows while you twirl.`,
  (day) =>
    `Snuggle up on day ${day} with your favorite plush friend and listen closely; the butterfly choir is softly singing your name.`,
  (day) =>
    `Hop between floating heart-shaped clouds on day ${day} to find a jar of sparkles that transforms into wings whenever you laugh.`,
];

const paletteCycle: AdventMemory['palette'][] = ['sunrise', 'twilight', 'forest', 'starlight'];
const confettiCycle: NonNullable<AdventMemory['confettiType']>[] = ['snow', 'stars', 'candy', 'reindeer'];
const unlockCycle: NonNullable<AdventMemory['unlockEffect']>[] = ['fireworks', 'snowstorm', 'aurora', 'gingerbread'];
const musicTracks = [
  '/assets/christmas/audio/music/calm-carols.mp3',
  '/assets/christmas/audio/music/upbeat-sleigh.mp3',
  '/assets/christmas/audio/music/aurora-lullaby.mp3',
];
const voiceClips = [
  '/assets/christmas/audio/voices/butterfly-story-1.mp3',
  '/assets/christmas/audio/voices/butterfly-story-2.mp3',
  '/assets/christmas/audio/voices/butterfly-story-3.mp3',
];
const DEFAULT_SUBTITLE = 'Daddy Loves You!';

const TOTAL_DAYS = 25;
const dayNumbers = Array.from({ length: TOTAL_DAYS }, (_, index) => index + 1);

const resolvePairEntry = (day: number) => {
  if (!photoPairs.length) return null;
  // First try to find exact day match
  const exactMatch = photoPairs.find((pair) => pair.day === day);
  if (exactMatch) return exactMatch;
  // Fallback to index-based matching for days without specific pairs
  return photoPairs[day % photoPairs.length];
};

export const adventMemories: AdventMemory[] = dayNumbers.map((day, index) => {
  const pairEntry = resolvePairEntry(day);
  const fallbackMessage = messageSeeds[index % messageSeeds.length](day);

  return {
    id: day,
    title: pairEntry?.title ?? `${titleSeeds[index % titleSeeds.length]} (Day ${day})`,
    subtitle: pairEntry?.subtitle ?? DEFAULT_SUBTITLE,
    message: pairEntry?.body ?? pairEntry?.message ?? fallbackMessage,
    confettiType: confettiCycle[index % confettiCycle.length],
    unlockEffect: unlockCycle[index % unlockCycle.length],
    palette: paletteCycle[index % paletteCycle.length],
    musicUrl: musicTracks[index % musicTracks.length],
    voiceUrl: voiceClips[index % voiceClips.length],
    photoPath: pairEntry?.image ?? getPhotoPath(day),
    photoMarkdownPath: pairEntry?.metadata ?? null,
    photoMarkdownTitle: pairEntry?.title ?? null,
    surpriseVideoUrl:
      index < 4
        ? [
            'https://www.youtube.com/embed/DXePdez8NcM?rel=0',
            'https://www.youtube.com/embed/bqjyTjdVfsA?rel=0',
            'https://www.youtube.com/embed/7jlxxG253ZQ?rel=0',
            'https://www.youtube.com/embed/mSw0nmOnd7s?list=RDmSw0nmOnd7s',
          ][index]
        : undefined,
  };
});

export const memoryTexts: Array<{ day: number; message: string }> = adventMemories.map(
  ({ id, message }) => ({
    day: id,
    message,
  })
);
