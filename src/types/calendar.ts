export type ConfettiType = 'snow' | 'stars' | 'hearts' | 'celebration';
export type UnlockEffect = 'fireworks' | 'confetti' | 'sparkles' | 'balloons';

export interface CalendarDay {
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

export interface CalendarEntry {
  id: number;
  title: string;
  message: string;
  confettiType?: ConfettiType;
  unlockEffect?: UnlockEffect;
  palette: 'sunrise' | 'twilight' | 'forest' | 'ocean';
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
  gradients?: {
    tileBackground?: string;
    tileHover?: string;
  };
  animations?: {
    tileHover?: string;
    tileClick?: string;
  };
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

export type GiftType = 'sticker' | 'video' | 'downloadable' | 'external_link' | 'experience';

export interface Gift {
  type: GiftType;
  title: string;
  description?: string;
  // For sticker: emoji or image URL
  sticker?: string;
  // For video/downloadable/external_link: URL
  url?: string;
  // For experience: text instructions
  instructions?: string;
  // For downloadable: file metadata
  file_name?: string;
  file_size?: number;
}

export interface CalendarTile {
  tile_id: string;
  calendar_id: string;
  day: number;
  title?: string;
  body?: string;
  media_url?: string;
  gift?: Gift;
  gift_unlocked: boolean;
  note_from_child?: string;
  opened_at?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

// Analytics event types
export type AnalyticsEventType =
  | 'login'
  | 'signup'
  | 'tile_opened'
  | 'gift_unlocked'
  | 'note_submitted'
  | 'media_upload'
  | 'template_change'
  | 'pdf_export'
  | 'notification_sent'
  | 'notification_clicked';

// Analytics event metadata interfaces
export interface LoginEventMetadata {
  user_type: 'parent' | 'child';
  auth_provider?: 'google' | 'facebook' | 'email_magic_link';
}

export interface SignupEventMetadata {
  user_type: 'parent';
  auth_provider: 'google' | 'facebook' | 'email_magic_link';
}

export interface TileOpenedEventMetadata {
  tile_id: string;
  day: number;
}

export interface GiftUnlockedEventMetadata {
  tile_id: string;
  day: number;
  gift_type: GiftType;
}

export interface NoteSubmittedEventMetadata {
  tile_id: string;
  day: number;
  note_length: number;
}

export interface MediaUploadEventMetadata {
  tile_id?: string;
  file_type: string;
  file_size: number;
}

export interface TemplateChangeEventMetadata {
  old_template_id?: string;
  new_template_id: string;
}

export interface PdfExportEventMetadata {
  calendar_id: string;
  tile_count: number;
}

export interface NotificationSentEventMetadata {
  notification_type: string;
  scheduled_for: string;
}

export interface NotificationClickedEventMetadata {
  notification_type: string;
}

// Union type for all event metadata
export type AnalyticsEventMetadata =
  | LoginEventMetadata
  | SignupEventMetadata
  | TileOpenedEventMetadata
  | GiftUnlockedEventMetadata
  | NoteSubmittedEventMetadata
  | MediaUploadEventMetadata
  | TemplateChangeEventMetadata
  | PdfExportEventMetadata
  | NotificationSentEventMetadata
  | NotificationClickedEventMetadata;

export interface AnalyticsEvent {
  event_id: string;
  calendar_id?: string;
  parent_uuid?: string;
  child_uuid?: string;
  event_type: AnalyticsEventType;
  metadata: AnalyticsEventMetadata;
  created_at: string;
}

// Default template IDs (matching database)
export const DEFAULT_TEMPLATES = {
  PASTEL_DREAMS: '550e8400-e29b-41d4-a716-446655440000',
  ADVENTURE_THEME: '550e8400-e29b-41d4-a716-446655440001',
  CELEBRATION_THEME: '550e8400-e29b-41d4-a716-446655440002',
} as const;
