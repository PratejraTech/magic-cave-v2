

export interface AnimationPreset {
  name: string;
  description: string;
  tileHover: string;
  tileClick: string;
  tileEnter: string;
  tileExit: string;
}

export interface MusicTheme {
  id: string;
  name: string;
  description: string;
  tracks: string[];
  mood: 'cheerful' | 'magical' | 'calm' | 'festive' | 'playful';
}

export interface LayoutPreset {
  id: string;
  name: string;
  description: string;
  tileShape: 'rounded' | 'square' | 'hexagon' | 'circle';
  gridColumns: number;
  spacing: 'tight' | 'normal' | 'loose';
  tileSize: 'small' | 'medium' | 'large';
}

export interface CustomizationOptions {
  animations: AnimationPreset;
  music: MusicTheme;
  layout: LayoutPreset;
  effects: {
    snow: boolean;
    sparkles: boolean;
    floatingElements: boolean;
    backgroundPattern: string;
  };
  accessibility: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

class CustomizationEngine {
  private currentOptions: CustomizationOptions | null = null;

  // Animation presets
  static readonly ANIMATION_PRESETS: Record<string, AnimationPreset> = {
    gentle: {
      name: 'Gentle',
      description: 'Soft, subtle animations perfect for young children',
      tileHover: 'transform: scale(1.02); transition: all 0.3s ease;',
      tileClick: 'transform: scale(0.98); transition: all 0.1s ease;',
      tileEnter: 'animation: fadeInUp 0.5s ease-out;',
      tileExit: 'animation: fadeOut 0.3s ease-in;'
    },
    playful: {
      name: 'Playful',
      description: 'Fun, bouncy animations that add excitement',
      tileHover: 'transform: scale(1.05) rotate(1deg); transition: all 0.3s ease;',
      tileClick: 'transform: scale(0.95) rotate(-1deg); transition: all 0.1s ease;',
      tileEnter: 'animation: bounceIn 0.6s ease-out;',
      tileExit: 'animation: bounceOut 0.4s ease-in;'
    },
    magical: {
      name: 'Magical',
      description: 'Enchanting animations with sparkle effects',
      tileHover: 'transform: scale(1.03); filter: brightness(1.1); transition: all 0.4s ease;',
      tileClick: 'transform: scale(0.97); filter: brightness(0.9); transition: all 0.1s ease;',
      tileEnter: 'animation: sparkleIn 0.8s ease-out;',
      tileExit: 'animation: sparkleOut 0.5s ease-in;'
    },
    calm: {
      name: 'Calm',
      description: 'Peaceful, slow animations for a soothing experience',
      tileHover: 'transform: translateY(-2px); transition: all 0.5s ease;',
      tileClick: 'transform: translateY(1px); transition: all 0.2s ease;',
      tileEnter: 'animation: slideInUp 0.7s ease-out;',
      tileExit: 'animation: slideOutDown 0.4s ease-in;'
    }
  };

  // Music themes
  static readonly MUSIC_THEMES: Record<string, MusicTheme> = {
    christmas_classic: {
      id: 'christmas_classic',
      name: 'Christmas Classics',
      description: 'Traditional Christmas carols and festive melodies',
      tracks: ['Jingle-Bells-3(chosic.com).mp3', 'silent-night-piano-version-christmas-background-music-12457.mp3'],
      mood: 'festive'
    },
    magical_winter: {
      id: 'magical_winter',
      name: 'Magical Winter',
      description: 'Enchanting winter melodies with a touch of magic',
      tracks: ['Ólafur Arnalds - Tomorrow\'s Song (Living Room Songs).mp3', 'Ben Bohmer, Nils Hoffmann & Malou - Breathing.mp3'],
      mood: 'magical'
    },
    cheerful_playtime: {
      id: 'cheerful_playtime',
      name: 'Cheerful Playtime',
      description: 'Happy, upbeat tunes perfect for play and discovery',
      tracks: ['Broadway_Kids_-_Rudolph_the_Red-Nosed_Reindeer_(mp3.pm).mp3'],
      mood: 'cheerful'
    },
    peaceful_moments: {
      id: 'peaceful_moments',
      name: 'Peaceful Moments',
      description: 'Calm, soothing music for quiet reflection',
      tracks: ['Ólafur Arnalds - Tomorrow\'s Song (Living Room Songs).mp3'],
      mood: 'calm'
    }
  };

  // Layout presets
  static readonly LAYOUT_PRESETS: Record<string, LayoutPreset> = {
    cozy_grid: {
      id: 'cozy_grid',
      name: 'Cozy Grid',
      description: 'Comfortable grid layout with rounded tiles',
      tileShape: 'rounded',
      gridColumns: 4,
      spacing: 'normal',
      tileSize: 'medium'
    },
    adventure_path: {
      id: 'adventure_path',
      name: 'Adventure Path',
      description: 'Hexagonal tiles arranged like stepping stones',
      tileShape: 'hexagon',
      gridColumns: 3,
      spacing: 'loose',
      tileSize: 'large'
    },
    magical_circle: {
      id: 'magical_circle',
      name: 'Magical Circle',
      description: 'Circular tiles in a radial pattern',
      tileShape: 'circle',
      gridColumns: 5,
      spacing: 'tight',
      tileSize: 'small'
    },
    classic_squares: {
      id: 'classic_squares',
      name: 'Classic Squares',
      description: 'Traditional square tiles in a clean grid',
      tileShape: 'square',
      gridColumns: 4,
      spacing: 'normal',
      tileSize: 'medium'
    }
  };

  applyCustomizations(options: CustomizationOptions): void {
    this.currentOptions = options;
    this.applyAnimations(options.animations);
    this.applyLayout(options.layout);
    this.applyEffects(options.effects);
    this.applyAccessibility(options.accessibility);
  }

  private applyAnimations(animations: AnimationPreset): void {
    const root = document.documentElement;

    // Preserve raw declarations for backward compatibility
    root.style.setProperty('--tile-hover-animation', animations.tileHover);
    root.style.setProperty('--tile-click-animation', animations.tileClick);
    root.style.setProperty('--tile-enter-tokens', animations.tileEnter);
    root.style.setProperty('--tile-exit-tokens', animations.tileExit);

    // Parse individual declarations so CSS can apply granular tokens
    const hoverStyles = this.parseDeclarationBlock(animations.tileHover);
    const clickStyles = this.parseDeclarationBlock(animations.tileClick);
    const enterStyles = this.parseDeclarationBlock(animations.tileEnter);
    const exitStyles = this.parseDeclarationBlock(animations.tileExit);

    root.style.setProperty('--tile-hover-transform', hoverStyles.transform || 'scale(1.03)');
    root.style.setProperty('--tile-hover-filter', hoverStyles.filter || 'brightness(1.05)');
    root.style.setProperty('--tile-hover-transition', hoverStyles.transition || 'transform 0.3s ease');
    root.style.setProperty('--tile-active-transform', clickStyles.transform || 'scale(0.97)');
    root.style.setProperty('--tile-active-transition', clickStyles.transition || 'transform 0.2s ease');
    root.style.setProperty('--tile-enter-animation', enterStyles.animation || 'none');
    root.style.setProperty('--tile-exit-animation', exitStyles.animation || 'none');

    // Inject keyframe animations if needed
    this.injectAnimationKeyframes();
  }

  private applyLayout(layout: LayoutPreset): void {
    const root = document.documentElement;

    // Set layout CSS variables
    root.style.setProperty('--grid-columns', layout.gridColumns.toString());
    root.style.setProperty('--tile-shape', layout.tileShape);
    root.style.setProperty('--tile-spacing', this.getSpacingValue(layout.spacing));
    root.style.setProperty('--tile-size', this.getSizeValue(layout.tileSize));

    const shapeStyles = this.getShapeStyles(layout.tileShape);
    root.style.setProperty('--tile-border-radius', shapeStyles.borderRadius);
    root.style.setProperty('--tile-clip-path', shapeStyles.clipPath);
  }

  private applyEffects(effects: CustomizationOptions['effects']): void {
    const root = document.documentElement;

    // Set effect CSS variables
    root.style.setProperty('--show-snow', effects.snow ? 'block' : 'none');
    root.style.setProperty('--show-sparkles', effects.sparkles ? 'block' : 'none');
    root.style.setProperty('--show-floating-elements', effects.floatingElements ? 'block' : 'none');
    root.style.setProperty('--background-pattern', effects.backgroundPattern || 'none');

    // Apply background pattern
    if (effects.backgroundPattern && effects.backgroundPattern !== 'none') {
      root.style.setProperty('--background-image', `url('/assets/patterns/${effects.backgroundPattern}.svg')`);
    } else {
      root.style.removeProperty('--background-image');
    }
  }

  private applyAccessibility(accessibility: CustomizationOptions['accessibility']): void {
    const root = document.documentElement;

    // Set accessibility CSS variables
    root.style.setProperty('--high-contrast', accessibility.highContrast ? 'true' : 'false');
    root.style.setProperty('--reduced-motion', accessibility.reducedMotion ? 'true' : 'false');
    root.style.setProperty('--large-text', accessibility.largeText ? 'true' : 'false');

    // Apply reduced motion preferences
    if (accessibility.reducedMotion) {
      root.style.setProperty('--animation-duration', '0s');
      root.style.setProperty('--transition-duration', '0s');
    } else {
      root.style.removeProperty('--animation-duration');
      root.style.removeProperty('--transition-duration');
    }

    // Apply high contrast
    if (accessibility.highContrast) {
      root.style.setProperty('--contrast-ratio', '1.5');
    } else {
      root.style.removeProperty('--contrast-ratio');
    }

    // Apply large text
    if (accessibility.largeText) {
      root.style.setProperty('--font-scale', '1.2');
    } else {
      root.style.removeProperty('--font-scale');
    }
  }

  private injectAnimationKeyframes(): void {
    // Inject custom keyframe animations
    const keyframes = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes bounceIn {
        0% { opacity: 0; transform: scale(0.3); }
        50% { opacity: 1; transform: scale(1.05); }
        70% { transform: scale(0.9); }
        100% { opacity: 1; transform: scale(1); }
      }

      @keyframes sparkleIn {
        0% { opacity: 0; transform: scale(0.8) rotate(0deg); filter: brightness(1); }
        50% { opacity: 0.7; transform: scale(1.1) rotate(180deg); filter: brightness(1.3); }
        100% { opacity: 1; transform: scale(1) rotate(360deg); filter: brightness(1); }
      }

      @keyframes slideInUp {
        from { opacity: 0; transform: translateY(30px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes sparkleOut {
        0% { opacity: 1; transform: scale(1); filter: brightness(1); }
        100% { opacity: 0; transform: scale(0.8); filter: brightness(0.7); }
      }

      @keyframes bounceOut {
        0% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.3); }
      }

      @keyframes slideOutDown {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(30px); }
      }

      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;

    // Check if keyframes are already injected
    const existingStyle = document.getElementById('customization-keyframes');
    if (existingStyle) {
      existingStyle.textContent = keyframes;
    } else {
      const style = document.createElement('style');
      style.id = 'customization-keyframes';
      style.textContent = keyframes;
      document.head.appendChild(style);
    }
  }

  private getSpacingValue(spacing: string): string {
    switch (spacing) {
      case 'tight': return '0.5rem';
      case 'loose': return '1.5rem';
      default: return '1rem';
    }
  }

  private getSizeValue(size: string): string {
    switch (size) {
      case 'small': return '120px';
      case 'large': return '200px';
      default: return '160px';
    }
  }

  getCurrentOptions(): CustomizationOptions | null {
    return this.currentOptions;
  }

  resetCustomizations(): void {
    this.currentOptions = null;

    const root = document.documentElement;
    const propertiesToRemove = [
      '--tile-hover-animation',
      '--tile-click-animation',
      '--tile-enter-tokens',
      '--tile-exit-tokens',
      '--tile-enter-animation',
      '--tile-exit-animation',
      '--tile-hover-transform',
      '--tile-hover-filter',
      '--tile-hover-transition',
      '--tile-active-transform',
      '--tile-active-transition',
      '--grid-columns',
      '--tile-shape',
      '--tile-spacing',
      '--tile-size',
      '--tile-border-radius',
      '--tile-clip-path',
      '--show-snow',
      '--show-sparkles',
      '--show-floating-elements',
      '--background-pattern',
      '--background-image',
      '--high-contrast',
      '--reduced-motion',
      '--large-text',
      '--animation-duration',
      '--transition-duration',
      '--contrast-ratio',
      '--font-scale'
    ];

    propertiesToRemove.forEach(prop => {
      root.style.removeProperty(prop);
    });

    // Remove injected keyframes
    const existingStyle = document.getElementById('customization-keyframes');
    if (existingStyle) {
      existingStyle.remove();
    }
  }

  private getShapeStyles(shape: LayoutPreset['tileShape']): { borderRadius: string; clipPath: string } {
    switch (shape) {
      case 'hexagon':
        return {
          borderRadius: '1rem',
          clipPath: 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
        };
      case 'circle':
        return {
          borderRadius: '9999px',
          clipPath: 'none'
        };
      case 'square':
        return {
          borderRadius: '0.75rem',
          clipPath: 'none'
        };
      default:
        return {
          borderRadius: '1.5rem',
          clipPath: 'none'
        };
    }
  }

  private parseDeclarationBlock(block: string): Record<string, string> {
    if (!block) return {};

    return block
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .reduce((acc, declaration) => {
        const [property, value] = declaration.split(':');
        if (property && value) {
          acc[property.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>);
  }

  // Utility methods for getting presets
  static getAnimationPreset(name: string): AnimationPreset | null {
    return this.ANIMATION_PRESETS[name] || null;
  }

  static getMusicTheme(id: string): MusicTheme | null {
    return this.MUSIC_THEMES[id] || null;
  }

  static getLayoutPreset(id: string): LayoutPreset | null {
    return this.LAYOUT_PRESETS[id] || null;
  }

  static getAllAnimationPresets(): Record<string, AnimationPreset> {
    return this.ANIMATION_PRESETS;
  }

  static getAllMusicThemes(): Record<string, MusicTheme> {
    return this.MUSIC_THEMES;
  }

  static getAllLayoutPresets(): Record<string, LayoutPreset> {
    return this.LAYOUT_PRESETS;
  }
}

// Export singleton instance
export const customizationEngine = new CustomizationEngine();

// Export class for static access
export { CustomizationEngine };
