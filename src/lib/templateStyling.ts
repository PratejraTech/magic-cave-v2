import { TemplateMetadata } from '../types/advent';
import { preloadTemplateFonts, preloadGoogleFonts } from './fontLoader';

/**
 * Validates template metadata structure and values
 */
export function validateTemplateMetadata(metadata: any): metadata is TemplateMetadata {
  if (!metadata || typeof metadata !== 'object') {
    console.warn('Template metadata is not an object');
    return false;
  }

  // Validate colors
  if (!metadata.colors || typeof metadata.colors !== 'object') {
    console.warn('Template colors are missing or invalid');
    return false;
  }

  const { primary, secondary, accent } = metadata.colors;
  if (!isValidColor(primary) || !isValidColor(secondary) || !isValidColor(accent)) {
    console.warn('Template colors contain invalid color values');
    return false;
  }

  // Accessibility check: Warn about potential contrast issues
  if (!hasMinimumContrast(primary, '#ffffff') || !hasMinimumContrast(primary, '#000000')) {
    console.warn('Template primary color may have contrast issues with white/black text');
  }

  // Validate fonts
  if (!metadata.fonts || typeof metadata.fonts !== 'object') {
    console.warn('Template fonts are missing or invalid');
    return false;
  }

  const { heading, body } = metadata.fonts;
  if (!heading || !body || typeof heading !== 'string' || typeof body !== 'string') {
    console.warn('Template fonts are missing or invalid');
    return false;
  }

  // Validate icons
  if (!Array.isArray(metadata.icons)) {
    console.warn('Template icons must be an array');
    return false;
  }

  // Validate layout
  const validLayouts = ['rounded_tiles', 'square_tiles', 'hexagon_tiles'];
  if (!validLayouts.includes(metadata.layout)) {
    console.warn('Template layout is invalid:', metadata.layout);
    return false;
  }

  // Validate gradients (optional)
  if (metadata.gradients) {
    if (typeof metadata.gradients !== 'object') {
      console.warn('Template gradients must be an object');
      return false;
    }
  }

  // Validate animations (optional)
  if (metadata.animations) {
    if (typeof metadata.animations !== 'object') {
      console.warn('Template animations must be an object');
      return false;
    }
  }

  return true;
}

/**
 * Checks if a string is a valid CSS color
 */
function isValidColor(color: any): boolean {
  if (typeof color !== 'string') return false;

  // Check for hex colors
  if (color.startsWith('#')) {
    return /^#[0-9A-Fa-f]{3,8}$/.test(color);
  }

  // Check for named colors (basic validation)
  const namedColors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gray', 'grey'];
  if (namedColors.includes(color.toLowerCase())) return true;

  // Check for rgb/rgba/hsl/hsla
  if (color.startsWith('rgb') || color.startsWith('hsl')) {
    return true; // Basic check - could be more thorough
  }

  return false;
}

/**
 * Basic contrast ratio check (simplified)
 * Returns true if colors have minimum contrast for accessibility
 */
function hasMinimumContrast(color1: string, color2: string): boolean {
  // This is a simplified check - in production, you'd want a proper color contrast library
  // For now, we'll do basic checks to avoid obviously bad combinations

  const c1 = color1.toLowerCase();
  const c2 = color2.toLowerCase();

  // Same colors have no contrast
  if (c1 === c2) return false;

  // Light colors on light colors
  const lightColors = ['white', '#ffffff', 'yellow', '#ffff00', 'lightgray', '#d3d3d3'];
  if (lightColors.includes(c1) && lightColors.includes(c2)) return false;

  // Dark colors on dark colors
  const darkColors = ['black', '#000000', 'darkgray', '#a9a9a9', 'gray', '#808080'];
  if (darkColors.includes(c1) && darkColors.includes(c2)) return false;

  return true; // Assume acceptable contrast for other combinations
}

// Cache for currently applied template to prevent unnecessary updates
let currentTemplateId: string | null = null;
let currentTemplateHash: string | null = null;

/**
 * Generate a simple hash for template metadata to detect changes
 */
function getTemplateHash(metadata: TemplateMetadata): string {
  return JSON.stringify({
    colors: metadata.colors,
    fonts: metadata.fonts,
    layout: metadata.layout,
    gradients: metadata.gradients,
    animations: metadata.animations
  });
}

/**
 * Applies template styling by setting CSS custom properties on the root element
 * Memoized to prevent unnecessary DOM updates
 */
export function applyTemplateStyling(metadata: TemplateMetadata, templateId?: string): void {
  // Validate metadata first
  if (!validateTemplateMetadata(metadata)) {
    console.error('Invalid template metadata provided, skipping application');
    return;
  }

  // Check if this template is already applied
  const newHash = getTemplateHash(metadata);
  if (currentTemplateHash === newHash && (!templateId || currentTemplateId === templateId)) {
    return; // No changes needed
  }

  // Update cache
  currentTemplateId = templateId || null;
  currentTemplateHash = newHash;

  const root = document.documentElement;

  // Set color variables
  root.style.setProperty('--template-primary', metadata.colors.primary);
  root.style.setProperty('--template-secondary', metadata.colors.secondary);
  root.style.setProperty('--template-accent', metadata.colors.accent);

  // Ensure accessibility: maintain focus indicators
  root.style.setProperty('--template-focus-ring', '2px solid var(--template-accent)');
  root.style.setProperty('--template-focus-outline', 'none');

  // Set font variables
  const headingFont = `'${metadata.fonts.heading}', cursive`;
  const bodyFont = `'${metadata.fonts.body}', sans-serif`;

  root.style.setProperty('--template-heading-font', headingFont);
  root.style.setProperty('--template-body-font', bodyFont);

  // Preload fonts asynchronously
  const headingFontName = metadata.fonts.heading;
  const bodyFontName = metadata.fonts.body;

  // Preload Google Fonts if they appear to be Google Fonts
  const googleFonts = [];
  if (headingFontName.toLowerCase().includes('google') ||
      ['roboto', 'open sans', 'lato', 'montserrat', 'raleway', 'nunito', 'poppins'].some(font =>
        headingFontName.toLowerCase().includes(font.toLowerCase()))) {
    googleFonts.push(headingFontName);
  }
  if (bodyFontName.toLowerCase().includes('google') ||
      ['roboto', 'open sans', 'lato', 'montserrat', 'raleway', 'nunito', 'poppins'].some(font =>
        bodyFontName.toLowerCase().includes(font.toLowerCase()))) {
    googleFonts.push(bodyFontName);
  }

  if (googleFonts.length > 0) {
    preloadGoogleFonts(googleFonts);
  }

  // Preload fonts with error handling
  preloadTemplateFonts(headingFont, bodyFont, {
    timeout: 5000,
    onError: (error) => {
      console.warn('Template font loading failed:', error);
      // Fonts will fall back to system fonts via CSS
    }
  }).catch(error => {
    console.warn('Template font preloading error:', error);
  });
}

/**
 * Resets template styling to default values
 */
export function resetTemplateStyling(): void {
  // Clear cache
  currentTemplateId = null;
  currentTemplateHash = null;

  const root = document.documentElement;

  root.style.removeProperty('--template-primary');
  root.style.removeProperty('--template-secondary');
  root.style.removeProperty('--template-accent');
  root.style.removeProperty('--template-heading-font');
  root.style.removeProperty('--template-body-font');
  root.style.removeProperty('--template-focus-ring');
  root.style.removeProperty('--template-focus-outline');
}

/**
 * Icon mapping for template icons
 * Maps icon names to actual icon components or classes
 */
export const TEMPLATE_ICONS = {
  butterfly: '🦋',
  star: '⭐',
  heart: '❤️',
  mountain: '🏔️',
  compass: '🧭',
  telescope: '🔭',
  unicorn: '🦄',
  rainbow: '🌈',
  castle: '🏰',
} as const;

export type TemplateIcon = keyof typeof TEMPLATE_ICONS;

/**
 * Gets the display icon for a template icon name
 */
export function getTemplateIcon(iconName: string): string {
  return TEMPLATE_ICONS[iconName as TemplateIcon] || '❓';
}