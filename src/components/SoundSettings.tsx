/**
 * Sound Settings Component
 * Allows users to control Christmas sound effects
 */

import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { christmasSounds } from '../lib/soundSystem';
import { Button } from './ui/WonderButton';

interface SoundSettingsProps {
  className?: string;
}

const SoundSettings: React.FC<SoundSettingsProps> = ({ className = '' }) => {
  const [enabled, setEnabled] = useState(christmasSounds.isEnabled());
  const [volume, setVolume] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Initialize sound system on first user interaction
    const initSound = () => {
      christmasSounds.initialize();
      document.removeEventListener('click', initSound);
    };
    document.addEventListener('click', initSound);

    return () => document.removeEventListener('click', initSound);
  }, []);

  const handleToggle = () => {
    const newState = christmasSounds.toggle();
    setEnabled(newState);

    // Play feedback sound if enabling
    if (newState) {
      setTimeout(() => christmasSounds.play('success_chime'), 100);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    christmasSounds.setMasterVolume(newVolume);

    // Play test sound
    christmasSounds.play('magic_sparkle', newVolume);
  };

  return (
    <div className={`sound-settings ${className}`}>
      {/* Quick toggle button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="relative"
        aria-label={enabled ? 'Mute sounds' : 'Enable sounds'}
        title={enabled ? 'Mute Christmas sounds' : 'Enable Christmas sounds'}
      >
        {enabled ? (
          <Volume2 className="w-5 h-5 text-primary-rose" />
        ) : (
          <VolumeX className="w-5 h-5 text-text-tertiary" />
        )}
      </Button>

      {/* Expandable settings (optional) */}
      {showSettings && (
        <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-2xl p-4 w-64 z-50 border border-bg-muted">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Sound Settings</h3>

          {/* Enable/Disable */}
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm text-text-secondary">Christmas Sounds</label>
            <button
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                enabled ? 'bg-primary-rose' : 'bg-bg-muted'
              }`}
              aria-label="Toggle sound"
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  enabled ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Volume slider */}
          {enabled && (
            <div className="space-y-2">
              <label className="text-sm text-text-secondary block">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-primary-rose"
                aria-label="Volume control"
              />
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>Quiet</span>
                <span>{Math.round(volume * 100)}%</span>
                <span>Loud</span>
              </div>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={() => setShowSettings(false)}
            className="mt-4 w-full py-2 text-sm text-primary-rose hover:bg-bg-soft rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Settings toggle (hidden by default, can be shown in parent dashboard) */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="hidden text-xs text-text-tertiary hover:text-primary-rose transition-colors"
        aria-label="Open sound settings"
      >
        {showSettings ? 'Hide' : 'Settings'}
      </button>
    </div>
  );
};

export default SoundSettings;
