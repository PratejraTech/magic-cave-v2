import React, { createContext, useContext, useState, useEffect } from 'react';

type WinterVariant = 'feminine' | 'masculine' | 'neutral';

interface WinterThemeContextType {
  isWinterActive: boolean;
  variant: WinterVariant;
  previewVariant: WinterVariant | null;
  toggleWinter: () => void;
  setVariant: (variant: WinterVariant) => void;
  setPreviewVariant: (variant: WinterVariant | null) => void;
  isLoading: boolean;
}

const WinterThemeContext = createContext<WinterThemeContextType | undefined>(undefined);

export const WinterThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWinterActive, setIsWinterActive] = useState(() => {
    // Check localStorage or seasonal logic
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('winter-theme-active');
    const isDecember = new Date().getMonth() === 11; // December
    return saved ? JSON.parse(saved) : isDecember;
  });

  const [variant, setVariantState] = useState<WinterVariant>(() => {
    if (typeof window === 'undefined') return 'neutral';
    const saved = localStorage.getItem('winter-variant');
    return (saved as WinterVariant) || 'neutral';
  });

  const [previewVariant, setPreviewVariant] = useState<WinterVariant | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply theme to body with smooth transition
    const applyTheme = () => {
      const body = document.body;

      // Add transition class for enhanced visual feedback
      body.classList.add('winter-wonderland-transitioning');

      if (isWinterActive) {
        body.classList.add('winter-wonderland', variant);
        body.classList.remove('feminine', 'masculine', 'neutral'); // Remove old variant first
        body.classList.add(variant);
      } else {
        body.classList.remove('winter-wonderland', 'feminine', 'masculine', 'neutral');
      }

      // Remove transition class after animation completes
      setTimeout(() => {
        body.classList.remove('winter-wonderland-transitioning');
        setIsLoading(false);
      }, 800);
    };

    applyTheme();
  }, [isWinterActive, variant]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('winter-theme-active', JSON.stringify(isWinterActive));
    }
  }, [isWinterActive]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('winter-variant', variant);
    }
  }, [variant]);

  const toggleWinter = () => setIsWinterActive(!isWinterActive);
  const setVariant = (newVariant: WinterVariant) => setVariantState(newVariant);

  return (
    <WinterThemeContext.Provider value={{
      isWinterActive,
      variant,
      previewVariant,
      toggleWinter,
      setVariant,
      setPreviewVariant,
      isLoading
    }}>
      {children}
    </WinterThemeContext.Provider>
  );
};

export const useWinterTheme = () => {
  const context = useContext(WinterThemeContext);
  if (!context) {
    throw new Error('useWinterTheme must be used within WinterThemeProvider');
  }
  return context;
};