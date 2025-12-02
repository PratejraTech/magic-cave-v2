import { TemplateMetadata } from '../types/advent';

/**
 * Applies template styling by setting CSS custom properties on the root element
 */
export function applyTemplateStyling(metadata: TemplateMetadata): void {
  const root = document.documentElement;

  // Set color variables
  root.style.setProperty('--template-primary', metadata.colors.primary);
  root.style.setProperty('--template-secondary', metadata.colors.secondary);
  root.style.setProperty('--template-accent', metadata.colors.accent);

  // Set font variables
  root.style.setProperty('--template-heading-font', `'${metadata.fonts.heading}', cursive`);
  root.style.setProperty('--template-body-font', `'${metadata.fonts.body}', sans-serif`);
}

/**
 * Resets template styling to default values
 */
export function resetTemplateStyling(): void {
  const root = document.documentElement;

  root.style.removeProperty('--template-primary');
  root.style.removeProperty('--template-secondary');
  root.style.removeProperty('--template-accent');
  root.style.removeProperty('--template-heading-font');
  root.style.removeProperty('--template-body-font');
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