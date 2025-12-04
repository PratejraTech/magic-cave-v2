import { templateService } from './templateService';

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundGradient: string;
  fontFamily: string;
  iconStyle: 'modern' | 'traditional' | 'playful';
}

export type WinterGenderVariant = 'feminine' | 'masculine' | 'neutral';

export interface WinterWonderlandConfig {
  enabled: boolean;
  genderVariant: WinterGenderVariant;
  enhancedEffects: boolean;
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

  /* 🏔️ Winter Wonderland Theme System */

  static applyWinterWonderlandTheme(config: WinterWonderlandConfig) {
    const body = document.body;

    if (config.enabled) {
      body.classList.add('winter-wonderland');
      body.classList.add(config.genderVariant);

      // Apply enhanced effects if requested
      if (config.enhancedEffects) {
        body.classList.add('winter-enhanced');
      }
    } else {
      body.classList.remove('winter-wonderland', 'feminine', 'masculine', 'neutral', 'winter-enhanced');
    }
  }

  static getWinterWonderlandConfig(): WinterWonderlandConfig {
    const body = document.body;
    const enabled = body.classList.contains('winter-wonderland');

    let genderVariant: WinterGenderVariant = 'neutral';
    if (body.classList.contains('feminine')) genderVariant = 'feminine';
    else if (body.classList.contains('masculine')) genderVariant = 'masculine';

    const enhancedEffects = body.classList.contains('winter-enhanced');

    return {
      enabled,
      genderVariant,
      enhancedEffects
    };
  }

  static setWinterGenderVariant(variant: WinterGenderVariant) {
    const body = document.body;
    body.classList.remove('feminine', 'masculine', 'neutral');
    body.classList.add(variant);
  }

  static toggleWinterWonderland(enabled: boolean = true) {
    const body = document.body;
    if (enabled) {
      body.classList.add('winter-wonderland');
    } else {
      body.classList.remove('winter-wonderland');
    }
  }

  static getWinterWonderlandThemeDescription(variant: WinterGenderVariant): string {
    const descriptions = {
      feminine: 'Frosted Rose & Silver Noel - Elegant winter theme with soft rose and silver accents, perfect for a magical feminine touch',
      masculine: 'Midnight Pine & Arctic Steel - Strong winter theme with deep pine greens and steel blues for a classic masculine feel',
      neutral: 'Evergreen Wonderland - Balanced winter theme with fresh emerald greens and natural winter tones for everyone'
    };
    return descriptions[variant];
  }

  static getWinterWonderlandPreview(variant: WinterGenderVariant) {
    const previews = {
      feminine: {
        colors: ['#E8A5B5', '#C9A0D8', '#F8F4FF'],
        ornaments: ['🌹', '💖', '❄️'],
        description: 'Soft, elegant winter aesthetic'
      },
      masculine: {
        colors: ['#4A90A4', '#2C5F2D', '#E8F4F8'],
        ornaments: ['🌲', '⚡', '🎄'],
        description: 'Strong, classic winter aesthetic'
      },
      neutral: {
        colors: ['#10B981', '#059669', '#ECFDF5'],
        ornaments: ['🌿', '✨', '🎁'],
        description: 'Balanced, natural winter aesthetic'
      }
    };
    return previews[variant];
  }
}