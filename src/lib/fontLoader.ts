/**
 * Font loading utilities for template fonts
 * Handles preloading and error handling for web fonts
 */

interface FontLoadOptions {
  timeout?: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

class FontLoader {
  private loadedFonts = new Set<string>();
  private loadingPromises = new Map<string, Promise<void>>();

  /**
   * Preload a font family
   */
  async preloadFont(fontFamily: string, options: FontLoadOptions = {}): Promise<void> {
    const { timeout = 10000, onSuccess, onError } = options;

    // If already loaded, return immediately
    if (this.loadedFonts.has(fontFamily)) {
      onSuccess?.();
      return;
    }

    // If already loading, return the existing promise
    if (this.loadingPromises.has(fontFamily)) {
      return this.loadingPromises.get(fontFamily)!;
    }

    const loadPromise = this.loadFont(fontFamily, timeout);
    this.loadingPromises.set(fontFamily, loadPromise);

    try {
      await loadPromise;
      this.loadedFonts.add(fontFamily);
      onSuccess?.();
    } catch (error) {
      this.loadingPromises.delete(fontFamily);
      const fontError = error instanceof Error ? error : new Error(`Failed to load font: ${fontFamily}`);
      onError?.(fontError);
      throw fontError;
    }
  }

  /**
   * Load a font using optimized FontFace API and document.fonts
   */
  private async loadFont(fontFamily: string, timeout: number): Promise<void> {
    // Method 1: Use document.fonts.check() for fastest detection
    if ('fonts' in document && typeof document.fonts.check === 'function') {
      try {
        // Check if font is already available
        if (document.fonts.check(`12px ${fontFamily}`)) {
          return;
        }

        // Load the font
        await document.fonts.load(`12px ${fontFamily}`);

        // Verify it loaded
        if (document.fonts.check(`12px ${fontFamily}`)) {
          return;
        }
      } catch (error) {
        // Continue to fallback methods
      }
    }

    // Method 2: Use FontFace API directly
    if ('FontFace' in window) {
      try {
        const fontFace = new FontFace(fontFamily.split(',')[0].trim().replace(/['"]/g, ''), `local('${fontFamily}')`);
        await fontFace.load();
        document.fonts.add(fontFace);
        return;
      } catch (error) {
        // Font not available locally, continue to network loading
      }
    }

    // Method 3: Network loading with timeout
    await new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        resolve(); // Resolve on timeout - CSS will handle fallbacks
      }, Math.min(timeout, 3000));

      // Try to load via document.fonts if available
      if ('fonts' in document) {
        document.fonts.load(`12px ${fontFamily}`).then(() => {
          clearTimeout(timeoutId);
          resolve();
        }).catch(() => {
          clearTimeout(timeoutId);
          resolve(); // Resolve anyway - CSS handles fallbacks
        });
      }
    });
  }

  /**
   * Check if a font is loaded
   */
  isFontLoaded(fontFamily: string): boolean {
    return this.loadedFonts.has(fontFamily);
  }

  /**
   * Clear loaded fonts cache (useful for testing)
   */
  clearCache(): void {
    this.loadedFonts.clear();
    this.loadingPromises.clear();
  }
}

// Export singleton instance
export const fontLoader = new FontLoader();

/**
 * Preload fonts for a template
 */
export async function preloadTemplateFonts(
  headingFont: string,
  bodyFont: string,
  options: FontLoadOptions = {}
): Promise<void> {
  const fontsToLoad = [];

  // Only load fonts that are not system fonts
  const systemFonts = ['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'];
  const headingBase = headingFont.split(',')[0].trim().replace(/['"]/g, '');
  const bodyBase = bodyFont.split(',')[0].trim().replace(/['"]/g, '');

  if (!systemFonts.includes(headingBase.toLowerCase())) {
    fontsToLoad.push(headingFont);
  }
  if (!systemFonts.includes(bodyBase.toLowerCase()) && headingFont !== bodyFont) {
    fontsToLoad.push(bodyFont);
  }

  if (fontsToLoad.length === 0) {
    options.onSuccess?.();
    return;
  }

  try {
    await Promise.all(
      fontsToLoad.map(font => fontLoader.preloadFont(font, {
        ...options,
        onSuccess: undefined, // Don't call onSuccess for individual fonts
        onError: undefined,   // Don't call onError for individual fonts
      }))
    );
    options.onSuccess?.();
  } catch (error) {
    options.onError?.(error instanceof Error ? error : new Error('Font loading failed'));
    throw error;
  }
}

/**
 * Preload Google Fonts by adding link tags
 */
export function preloadGoogleFonts(fontFamilies: string[]): void {
  const existingLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map(link => link.getAttribute('href'))
    .filter(href => href?.includes('fonts.googleapis.com'));

  fontFamilies.forEach(fontFamily => {
    const fontName = fontFamily.split(',')[0].trim().replace(/['"]/g, '');
    const googleUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;500;600;700&display=swap`;

    // Check if already loaded
    if (existingLinks.some(href => href?.includes(encodeURIComponent(fontName)))) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = googleUrl;
    link.setAttribute('data-font-family', fontName);
    document.head.appendChild(link);
  });
}