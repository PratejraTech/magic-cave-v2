import React, { useState } from 'react';
import {
  customizationEngine,
  CustomizationOptions,
  CustomizationEngine
} from '../lib/customizationEngine';

interface CustomizationPanelProps {
  onClose: () => void;
  onApply: (options: CustomizationOptions) => void;
  initialOptions?: CustomizationOptions;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  onClose,
  onApply,
  initialOptions
}) => {
  const [options, setOptions] = useState<CustomizationOptions>(() => {
    if (initialOptions) return initialOptions;

    // Default options
    return {
      animations: CustomizationEngine.ANIMATION_PRESETS.gentle,
      music: CustomizationEngine.MUSIC_THEMES.christmas_classic,
      layout: CustomizationEngine.LAYOUT_PRESETS.cozy_grid,
      effects: {
        snow: false,
        sparkles: true,
        floatingElements: false,
        backgroundPattern: 'none'
      },
      accessibility: {
        highContrast: false,
        reducedMotion: false,
        largeText: false
      }
    };
  });

  const [activeTab, setActiveTab] = useState<'animations' | 'layout' | 'effects' | 'accessibility'>('animations');

  const handleApply = () => {
    customizationEngine.applyCustomizations(options);
    onApply(options);
  };

  const updateOption = (path: string, value: unknown) => {
    setOptions(prev => {
      const newOptions = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = newOptions as unknown as Record<string, unknown>;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newOptions;
    });
  };

  const tabs = [
    { id: 'animations', label: 'Animations', icon: '🎭' },
    { id: 'layout', label: 'Layout', icon: '📐' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'accessibility', label: 'Accessibility', icon: '♿' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Advanced Customization</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl p-1"
            aria-label="Close customization panel"
          >
            ×
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'animations' | 'layout' | 'effects' | 'accessibility')}
              className={`px-4 py-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-b-2 border-purple-500 text-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'animations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Animation Style</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CustomizationEngine.ANIMATION_PRESETS).map(([key, preset]) => (
                  <div
                    key={key}
                    onClick={() => updateOption('animations', preset)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      options.animations.name === preset.name
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <h4 className="font-medium">{preset.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Layout & Design</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CustomizationEngine.LAYOUT_PRESETS).map(([key, preset]) => (
                  <div
                    key={key}
                    onClick={() => updateOption('layout', preset)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      options.layout.id === preset.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <h4 className="font-medium">{preset.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{preset.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>Shape: {preset.tileShape}</span>
                      <span>Size: {preset.tileSize}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'effects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Visual Effects</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="snow"
                    checked={options.effects.snow}
                    onChange={(e) => updateOption('effects.snow', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="snow" className="flex items-center gap-2">
                    <span>❄️</span>
                    <div>
                      <div className="font-medium">Snow Effect</div>
                      <div className="text-sm text-gray-600">Falling snow animation</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sparkles"
                    checked={options.effects.sparkles}
                    onChange={(e) => updateOption('effects.sparkles', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="sparkles" className="flex items-center gap-2">
                    <span>✨</span>
                    <div>
                      <div className="font-medium">Sparkle Effects</div>
                      <div className="text-sm text-gray-600">Magical sparkle animations</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="floatingElements"
                    checked={options.effects.floatingElements}
                    onChange={(e) => updateOption('effects.floatingElements', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="floatingElements" className="flex items-center gap-2">
                    <span>🎈</span>
                    <div>
                      <div className="font-medium">Floating Elements</div>
                      <div className="text-sm text-gray-600">Balloons and floating decorations</div>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Pattern
                </label>
                <select
                  value={options.effects.backgroundPattern}
                  onChange={(e) => updateOption('effects.backgroundPattern', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">No Pattern</option>
                  <option value="snowflakes">Snowflakes</option>
                  <option value="stars">Stars</option>
                  <option value="hearts">Hearts</option>
                  <option value="geometric">Geometric</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Accessibility Options</h3>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="highContrast"
                    checked={options.accessibility.highContrast}
                    onChange={(e) => updateOption('accessibility.highContrast', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="highContrast" className="flex items-center gap-2">
                    <span>🔍</span>
                    <div>
                      <div className="font-medium">High Contrast</div>
                      <div className="text-sm text-gray-600">Increased contrast for better visibility</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="reducedMotion"
                    checked={options.accessibility.reducedMotion}
                    onChange={(e) => updateOption('accessibility.reducedMotion', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="reducedMotion" className="flex items-center gap-2">
                    <span>🚫</span>
                    <div>
                      <div className="font-medium">Reduced Motion</div>
                      <div className="text-sm text-gray-600">Minimize animations and transitions</div>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="largeText"
                    checked={options.accessibility.largeText}
                    onChange={(e) => updateOption('accessibility.largeText', e.target.checked)}
                    className="mr-3"
                  />
                  <label htmlFor="largeText" className="flex items-center gap-2">
                    <span>📝</span>
                    <div>
                      <div className="font-medium">Large Text</div>
                      <div className="text-sm text-gray-600">Increase text size for better readability</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-6 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 font-medium"
          >
            Apply Customizations
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;