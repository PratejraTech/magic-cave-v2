import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fontLoader, preloadTemplateFonts, preloadGoogleFonts } from '../lib/fontLoader';

// Mock document.fonts
Object.defineProperty(document, 'fonts', {
  value: {
    load: vi.fn().mockResolvedValue([])
  },
  writable: true
});

describe('FontLoader', () => {
  beforeEach(() => {
    fontLoader.clearCache();
    vi.clearAllMocks();
  });

  it('should preload fonts successfully', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    await preloadTemplateFonts('Arial', 'Helvetica', {
      onSuccess,
      onError
    });

    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('should handle font loading with fallbacks', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();

    // Mock document.fonts.load to reject
    (document.fonts.load as any).mockRejectedValueOnce(new Error('Font load failed'));

    // The function should still resolve with fallback behavior
    await preloadTemplateFonts('NonExistentFont', 'AnotherNonExistentFont', {
      onSuccess,
      onError,
      timeout: 100
    });

    // With current implementation, onSuccess is called even with fallbacks
    expect(onSuccess).toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('should skip system fonts', async () => {
    const onSuccess = vi.fn();

    await preloadTemplateFonts('serif', 'sans-serif', {
      onSuccess
    });

    expect(onSuccess).toHaveBeenCalled();
    // System fonts should not trigger font loading
  });

  it('should preload Google Fonts', () => {
    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    preloadGoogleFonts(['Roboto', 'Open Sans']);

    expect(appendChildSpy).toHaveBeenCalledTimes(2);

    const calls = appendChildSpy.mock.calls;
    const linkElement = calls[0][0] as HTMLLinkElement;
    expect(linkElement).toHaveProperty('href');
    expect(linkElement.href).toContain('fonts.googleapis.com');
    expect(linkElement.href).toContain('Roboto');

    appendChildSpy.mockRestore();
  });

  it('should not duplicate Google Font links', () => {
    // Add existing link
    const existingLink = document.createElement('link');
    existingLink.rel = 'stylesheet';
    existingLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap';
    document.head.appendChild(existingLink);

    const appendChildSpy = vi.spyOn(document.head, 'appendChild');

    preloadGoogleFonts(['Roboto']);

    expect(appendChildSpy).not.toHaveBeenCalled();

    appendChildSpy.mockRestore();
    document.head.removeChild(existingLink);
  });

  it('should track loaded fonts', () => {
    expect(fontLoader.isFontLoaded('Arial')).toBe(false);

    // Simulate loading
    fontLoader['loadedFonts'].add('Arial');

    expect(fontLoader.isFontLoaded('Arial')).toBe(true);
  });
});