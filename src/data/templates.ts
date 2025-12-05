import { DEFAULT_TEMPLATES, TemplateMetadata } from '../types/calendar';

export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  metadata: TemplateMetadata;
  tags?: string[];
  headline?: string;
  familyHook?: string;
  heroGradient?: string;
  createdAt?: string;
  updatedAt?: string;
}

const DEFAULT_TIMESTAMP = '2024-01-01T00:00:00Z';

const pastelDreams: TemplateDefinition = {
  id: DEFAULT_TEMPLATES.PASTEL_DREAMS,
  name: 'Pastel Dreams',
  description: 'Soft watercolor palette with floating butterflies for cozy bedtime countdowns.',
  tags: ['gentle', 'storybook'],
  headline: 'Dreamy nightly wishes painted in watercolor skies.',
  familyHook: 'Perfect for bedtime storytellers crafting gentle rituals.',
  heroGradient: 'linear-gradient(135deg, #ffd1dc 0%, #ffeedd 45%, #d9f0ff 100%)',
  metadata: {
    colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
    fonts: { heading: '"Baloo 2", cursive', body: '"Nunito", sans-serif' },
    icons: ['butterfly', 'star', 'heart'],
    layout: 'rounded_tiles',
    gradients: {
      tileBackground: 'linear-gradient(135deg, rgba(255,179,186,0.22) 0%, rgba(186,225,255,0.35) 100%)',
      tileHover: 'linear-gradient(135deg, rgba(186,255,201,0.55) 0%, rgba(186,225,255,0.75) 100%)'
    },
    animations: {
      tileHover: 'scale(1.04)',
      tileClick: 'scale(0.96)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

const adventureExplorer: TemplateDefinition = {
  id: DEFAULT_TEMPLATES.ADVENTURE_THEME,
  name: 'Adventure Explorer',
  description: 'Bold compass lines, trail markers, and a punchy palette for spirited adventurers.',
  tags: ['vibrant', 'explorer'],
  headline: 'Trail-ready tiles inspired by treasure maps and compass roses.',
  familyHook: 'Ideal for energetic kids who love quests, badges, and bragging rights.',
  heroGradient: 'linear-gradient(135deg, #1f7a8c 0%, #ff6b35 50%, #f2a541 100%)',
  metadata: {
    colors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#1F7A8C' },
    fonts: { heading: '"Archivo Black", sans-serif', body: '"Figtree", sans-serif' },
    icons: ['mountain', 'compass', 'telescope'],
    layout: 'square_tiles',
    gradients: {
      tileBackground: 'linear-gradient(135deg, rgba(255,107,53,0.16) 0%, rgba(31,122,140,0.14) 100%)',
      tileHover: 'linear-gradient(135deg, rgba(247,147,30,0.3) 0%, rgba(31,122,140,0.3) 100%)'
    },
    animations: {
      tileHover: 'translateY(-4px)',
      tileClick: 'scale(0.97)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

const rainbowFantasy: TemplateDefinition = {
  id: DEFAULT_TEMPLATES.CELEBRATION_THEME,
  name: 'Rainbow Fantasy',
  description: 'Unicorn-approved gradients, holographic glow, and confetti-ready tiles.',
  tags: ['sparkly', 'imaginative'],
  headline: 'Every tile feels like a sparkly wish on a rainbow runway.',
  familyHook: 'Designed for imaginative hearts who live for glitter, giggles, and surprise reveals.',
  heroGradient: 'linear-gradient(135deg, #ff00a8 0%, #7c3aed 50%, #08f7fe 100%)',
  metadata: {
    colors: { primary: '#FF0080', secondary: '#8000FF', accent: '#00FF80' },
    fonts: { heading: '"Fredoka One", cursive', body: '"Poppins", sans-serif' },
    icons: ['unicorn', 'rainbow', 'castle'],
    layout: 'hexagon_tiles',
    gradients: {
      tileBackground: 'linear-gradient(145deg, rgba(255,0,128,0.22) 0%, rgba(128,0,255,0.22) 50%, rgba(0,255,128,0.22) 100%)',
      tileHover: 'linear-gradient(145deg, rgba(255,0,128,0.45) 0%, rgba(128,0,255,0.45) 50%, rgba(0,255,128,0.45) 100%)'
    },
    animations: {
      tileHover: 'scale(1.06) rotate(1.5deg)',
      tileClick: 'scale(0.95) rotate(-1deg)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

const winterWonderland: TemplateDefinition = {
  id: 'winter-wonderland',
  name: 'Winter Wonderland',
  description: 'Iridescent ice layers, frosted edges, and gentle snowfall vibes.',
  tags: ['holiday', 'frosted'],
  headline: 'Aurora-lit snowdrifts and heartwarming messages in every tile.',
  familyHook: 'A festive classic for families who love hot cocoa, twinkle lights, and heirloom traditions.',
  heroGradient: 'linear-gradient(130deg, #0f172a 0%, #1d4ed8 45%, #38bdf8 100%)',
  metadata: {
    colors: { primary: '#dc2626', secondary: '#16a34a', accent: '#fbbf24' },
    fonts: { heading: '"Mountains of Christmas", cursive', body: '"Inter", sans-serif' },
    icons: ['snowflake', 'tree', 'gift'],
    layout: 'rounded_tiles',
    gradients: {
      tileBackground: 'linear-gradient(135deg, rgba(220,38,38,0.14) 0%, rgba(251,191,36,0.16) 50%, rgba(22,163,74,0.12) 100%)',
      tileHover: 'linear-gradient(135deg, rgba(251,191,36,0.35) 0%, rgba(22,163,74,0.35) 100%)'
    },
    animations: {
      tileHover: 'scale(1.05)',
      tileClick: 'scale(0.95)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

const modernChristmas: TemplateDefinition = {
  id: 'modern-christmas',
  name: 'Modern Christmas',
  description: 'Luxe midnight gradients and minimal typography for a sophisticated celebration.',
  tags: ['modern', 'premium'],
  headline: 'Gallery-worthy tiles with luxe gradients and editorial typography.',
  familyHook: 'Tailored for design-forward families who balance nostalgia with polish.',
  heroGradient: 'linear-gradient(135deg, #020617 0%, #312e81 50%, #0f766e 100%)',
  metadata: {
    colors: { primary: '#7C3AED', secondary: '#059669', accent: '#F59E0B' },
    fonts: { heading: '"Space Grotesk", sans-serif', body: '"Inter", sans-serif' },
    icons: ['star', 'bell', 'candle'],
    layout: 'square_tiles',
    gradients: {
      tileBackground: 'linear-gradient(135deg, rgba(124,58,237,0.28) 0%, rgba(5,150,105,0.24) 100%)',
      tileHover: 'linear-gradient(135deg, rgba(5,150,105,0.45) 0%, rgba(245,158,11,0.45) 100%)'
    },
    animations: {
      tileHover: 'translateY(-2px)',
      tileClick: 'scale(0.98)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

const traditionalChristmas: TemplateDefinition = {
  id: 'traditional-christmas',
  name: 'Traditional Christmas',
  description: 'Ribbon reds, pine greens, and handwritten warmth inspired by heirloom cards.',
  tags: ['classic', 'cozy'],
  headline: 'Ribbon-wrapped tiles echoing handwritten holiday cards.',
  familyHook: 'Made for families who treasure cocoa, carols, and keepsake ornaments.',
  heroGradient: 'linear-gradient(135deg, #7f1d1d 0%, #14532d 50%, #f59e0b 100%)',
  metadata: {
    colors: { primary: '#B91C1C', secondary: '#166534', accent: '#FBBF24' },
    fonts: { heading: '"Playfair Display", serif', body: '"Merriweather", serif' },
    icons: ['ornament', 'stocking', 'wreath'],
    layout: 'rounded_tiles',
    gradients: {
      tileBackground: 'linear-gradient(135deg, rgba(185,28,28,0.22) 0%, rgba(22,101,52,0.22) 100%)',
      tileHover: 'linear-gradient(135deg, rgba(22,101,52,0.35) 0%, rgba(251,191,36,0.35) 100%)'
    },
    animations: {
      tileHover: 'scale(1.03)',
      tileClick: 'scale(0.97)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

const cozyChristmas: TemplateDefinition = {
  id: 'cozy-christmas',
  name: 'Cozy Fireplace',
  description: 'Velvety cocoa tones, candlelight gradients, and textures inspired by knit stockings.',
  tags: ['warm', 'storytelling'],
  headline: 'Velvet embers, candle flickers, and handwritten notes.',
  familyHook: 'For cuddle-up families who cherish quiet nightly rituals and gratitude.',
  heroGradient: 'linear-gradient(135deg, #331d0b 0%, #7c2d12 50%, #f97316 100%)',
  metadata: {
    colors: { primary: '#92400E', secondary: '#7C2D12', accent: '#F59E0B' },
    fonts: { heading: '"Handlee", cursive', body: '"Karla", sans-serif' },
    icons: ['fireplace', 'hot-cocoa', 'blanket'],
    layout: 'square_tiles',
    gradients: {
      tileBackground: 'linear-gradient(135deg, rgba(146,64,14,0.25) 0%, rgba(124,45,18,0.25) 100%)',
      tileHover: 'linear-gradient(135deg, rgba(245,158,11,0.45) 0%, rgba(124,45,18,0.45) 100%)'
    },
    animations: {
      tileHover: 'translateY(-3px) scale(1.02)',
      tileClick: 'scale(0.98)'
    }
  },
  createdAt: DEFAULT_TIMESTAMP,
  updatedAt: DEFAULT_TIMESTAMP
};

export const TEMPLATE_LIBRARY: TemplateDefinition[] = [
  pastelDreams,
  adventureExplorer,
  rainbowFantasy,
  winterWonderland,
  modernChristmas,
  traditionalChristmas,
  cozyChristmas
];

export const TEMPLATE_MAP: Record<string, TemplateDefinition> = TEMPLATE_LIBRARY.reduce(
  (acc, template) => {
    acc[template.id] = template;
    return acc;
  },
  {} as Record<string, TemplateDefinition>
);

export const getTemplateDefinition = (id: string) => TEMPLATE_MAP[id] || null;
