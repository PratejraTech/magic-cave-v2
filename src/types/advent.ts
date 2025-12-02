export type ConfettiType = 'snow' | 'stars' | 'candy' | 'reindeer';
export type UnlockEffect = 'fireworks' | 'snowstorm' | 'aurora' | 'gingerbread';

export interface AdventDay {
  id: number;
  title: string;
  subtitle?: string | null;
  message: string;
  photo_url: string;
  is_opened: boolean;
  opened_at: string | null;
  created_at: string;
  confettiType?: ConfettiType;
  unlockEffect?: UnlockEffect;
  musicUrl?: string;
  voiceUrl?: string;
  photoMarkdownPath?: string | null;
  photoMarkdownTitle?: string | null;
}

export interface AdventMemory {
  id: number;
  title: string;
  message: string;
  confettiType?: ConfettiType;
  unlockEffect?: UnlockEffect;
  palette: 'sunrise' | 'twilight' | 'forest' | 'starlight';
  subtitle?: string | null;
  musicUrl?: string;
  voiceUrl?: string;
  photoPath?: string;
  photoMarkdownPath?: string | null;
  photoMarkdownTitle?: string | null;
  surpriseVideoUrl?: string;
}

// New schema types for multi-user calendar system
export interface Parent {
  parent_uuid: string;
  name: string;
  email: string;
  auth_provider: 'google' | 'facebook' | 'email_magic_link';
  auth_provider_id?: string;
  family_uuid: string;
  created_at: string;
  updated_at: string;
}

export interface Child {
  child_uuid: string;
  parent_uuid: string;
  name: string;
  birthdate: string;
  gender: 'male' | 'female' | 'other' | 'unspecified';
  interests: Record<string, any>;
  selected_template?: string;
  created_at: string;
  updated_at: string;
}

export interface Template {
  template_id: string;
  name: string;
  description: string;
  metadata: TemplateMetadata;
  created_at: string;
  updated_at: string;
  retired: boolean;
}

export interface TemplateMetadata {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  icons: string[];
  layout: 'rounded_tiles' | 'square_tiles' | 'hexagon_tiles';
}

export interface Calendar {
  calendar_id: string;
  child_uuid: string;
  parent_uuid: string;
  template_id: string;
  share_uuid?: string;
  is_published: boolean;
  year: number;
  version: number;
  last_tile_opened: number;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CalendarTile {
  tile_id: string;
  calendar_id: string;
  day: number;
  title?: string;
  body?: string;
  media_url?: string;
  gift?: Record<string, any>;
  gift_unlocked: boolean;
  note_from_child?: string;
  opened_at?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// Default template IDs (matching database)
export const DEFAULT_TEMPLATES = {
  PASTEL_DREAMS: '550e8400-e29b-41d4-a716-446655440000',
  ADVENTURE_BOY: '550e8400-e29b-41d4-a716-446655440001',
  RAINBOW_FANTASY: '550e8400-e29b-41d4-a716-446655440002',
} as const;
