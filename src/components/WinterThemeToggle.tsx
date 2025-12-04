import React from 'react';
import { useWinterTheme } from '../contexts/WinterThemeContext';

const WinterThemeToggle: React.FC = () => {
  const { isWinterActive, variant, previewVariant, toggleWinter, setVariant, setPreviewVariant, isLoading } = useWinterTheme();

  if (isLoading) {
    return (
      <div className="winter-theme-toggle-skeleton">
        <div className="animate-pulse bg-gray-200 rounded-lg h-10 w-32"></div>
      </div>
    );
  }

  return (
    <div className="winter-theme-controls">
      <button
        onClick={toggleWinter}
        className={`winter-toggle-button ${isWinterActive ? 'active' : ''}`}
        aria-label={isWinterActive ? 'Disable winter wonderland theme' : 'Enable winter wonderland theme'}
        disabled={isLoading}
      >
        ❄️ {isWinterActive ? 'Winter Magic On' : 'Winter Magic Off'}
      </button>

      {isWinterActive && (
        <div className="variant-selector">
          <span className="variant-label">Choose your magic:</span>
          {(['feminine', 'masculine', 'neutral'] as const).map((v) => (
            <button
              key={v}
              onMouseEnter={() => setPreviewVariant(v)}
              onMouseLeave={() => setPreviewVariant(null)}
              onClick={() => {
                setVariant(v);
                setPreviewVariant(null);
              }}
              className={`variant-button ${variant === v ? 'active' : ''} ${previewVariant === v ? 'preview' : ''}`}
              aria-label={`Switch to ${v} winter theme`}
              disabled={isLoading}
            >
              {v === 'feminine' && '🌹 Rose & Silver'}
              {v === 'masculine' && '🌲 Pine & Steel'}
              {v === 'neutral' && '✨ Emerald & Frost'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default WinterThemeToggle;