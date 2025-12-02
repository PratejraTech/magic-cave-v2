import { templateService } from './templateService';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  fontFamily: string;
  iconStyle: 'modern' | 'traditional' | 'playful';
}

export class ThemeIntegrationService {
  static getThemeFromTemplate(templateId: string): ThemeConfig {
    const template = templateService.getTemplate(templateId);

    if (!template) {
      return this.getSeasonalTheme(); // Fallback to seasonal theme
    }

    const metadata = template.metadata;

    return {
      primaryColor: metadata.colors.primary,
      secondaryColor: metadata.colors.secondary,
      accentColor: metadata.colors.accent,
      backgroundGradient: metadata.gradients?.tileBackground || 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: metadata.fonts.heading,
      iconStyle: 'modern' // Default for now
    };
  }

  static applyThemeToPage(theme: ThemeConfig) {
    const root = document.documentElement;

    root.style.setProperty('--theme-primary', theme.primaryColor);
    root.style.setProperty('--theme-secondary', theme.secondaryColor);
    root.style.setProperty('--theme-accent', theme.accentColor);
    root.style.setProperty('--theme-background', theme.backgroundGradient);
    root.style.setProperty('--theme-font', theme.fontFamily);

    // Apply to body
    document.body.style.background = theme.backgroundGradient;
    document.body.style.fontFamily = theme.fontFamily;
  }

  static getSeasonalTheme(): ThemeConfig {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    // Christmas/Advent season (Dec 1-25)
    if (month === 11 && day <= 25) {
      return {
        primaryColor: '#dc2626', // Red
        secondaryColor: '#16a34a', // Green
        accentColor: '#eab308', // Gold
        backgroundGradient: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)',
        fontFamily: '"Mountains of Christmas", cursive',
        iconStyle: 'traditional'
      };
    }

    // Default winter theme
    return {
      primaryColor: '#3b82f6', // Blue
      secondaryColor: '#64748b', // Slate
      accentColor: '#f59e0b', // Amber
      backgroundGradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'system-ui, sans-serif',
      iconStyle: 'modern'
    };
  }
}