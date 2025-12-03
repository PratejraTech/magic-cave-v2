import React from 'react';
import { X } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  metadata: {
    colors: { primary: string; secondary: string; accent: string };
    fonts: { heading: string; body: string };
    icons: string[];
    layout: 'rounded_tiles' | 'square_tiles' | 'hexagon_tiles';
    gradients?: {
      tileBackground?: string;
      tileHover?: string;
    };
    animations?: {
      tileHover?: string;
      tileClick?: string;
    };
  };
}

interface TemplatePreviewProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

const SAMPLE_CALENDAR_DATA = Array.from({ length: 25 }, (_, i) => ({
  day: i + 1,
  title: i < 5 ? `Day ${i + 1}` : undefined,
  body: i < 5 ? "Sample content for this special day..." : undefined,
  isUnlocked: i < 5,
}));

export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  isOpen,
  onClose,
  onSelect
}) => {
  if (!isOpen) return null;

  const handleSelect = () => {
    onSelect(template);
    onClose();
  };

  const getTileStyle = (day: number) => {
    const baseStyle: React.CSSProperties = {
      background: template.metadata.gradients?.tileBackground || (
        day % 3 === 0 ? template.metadata.colors.primary + '20' :
        day % 3 === 1 ? template.metadata.colors.secondary + '20' :
        template.metadata.colors.accent + '20'
      ),
      borderColor: day % 3 === 0 ? template.metadata.colors.primary :
                   day % 3 === 1 ? template.metadata.colors.secondary :
                   template.metadata.colors.accent,
    };

    return baseStyle;
  };

  const getTileClasses = (tile: typeof SAMPLE_CALENDAR_DATA[0]) => {
    let classes = `aspect-square border-2 flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-105 ${tile.isUnlocked ? 'shadow-lg' : ''}`;

    if (template.metadata.layout === 'square_tiles') {
      classes += ' rounded-none';
    } else if (template.metadata.layout === 'hexagon_tiles') {
      classes += ' rounded-none hexagon-tile';
    } else {
      classes += ' rounded-lg';
    }

    return classes;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-4">
            {/* Color Preview */}
            <div className="flex space-x-2">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: template.metadata.colors.primary }}
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: template.metadata.colors.secondary }}
              />
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: template.metadata.colors.accent }}
              />
            </div>

            {/* Template Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{template.name}</h2>
              <p className="text-gray-600">{template.description}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Sample Calendar Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Calendar Preview</h3>
            <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
              {SAMPLE_CALENDAR_DATA.map((tile) => (
                <div
                  key={tile.day}
                  className={getTileClasses(tile)}
                  style={getTileStyle(tile.day)}
                >
                  <div className="font-bold text-lg mb-1">{tile.day}</div>
                  {tile.isUnlocked && tile.title && (
                    <div className="text-xs font-medium truncate w-full">
                      {tile.title}
                    </div>
                  )}
                  {tile.isUnlocked && (
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1"></div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 text-center mt-4">
              Green dots show unlocked tiles with sample content
            </p>
          </div>

          {/* Template Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <h4 className="font-semibold mb-3">Color Scheme</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: template.metadata.colors.primary }}
                  />
                  <span className="text-sm">Primary: {template.metadata.colors.primary}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: template.metadata.colors.secondary }}
                  />
                  <span className="text-sm">Secondary: {template.metadata.colors.secondary}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: template.metadata.colors.accent }}
                  />
                  <span className="text-sm">Accent: {template.metadata.colors.accent}</span>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div>
              <h4 className="font-semibold mb-3">Typography</h4>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-600">Headings:</span>
                  <div
                    className="text-lg font-bold mt-1"
                    style={{ fontFamily: template.metadata.fonts.heading }}
                  >
                    {template.metadata.fonts.heading}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Body Text:</span>
                  <div
                    className="text-sm mt-1"
                    style={{ fontFamily: template.metadata.fonts.body }}
                  >
                    {template.metadata.fonts.body}
                  </div>
                </div>
              </div>
            </div>

            {/* Icons */}
            <div>
              <h4 className="font-semibold mb-3">Theme Icons</h4>
              <div className="flex space-x-3">
                {template.metadata.icons.map((icon: string, index: number) => (
                  <div key={index} className="text-2xl">
                    {icon === 'butterfly' && '🦋'}
                    {icon === 'star' && '⭐'}
                    {icon === 'heart' && '💖'}
                    {icon === 'mountain' && '🏔️'}
                    {icon === 'compass' && '🧭'}
                    {icon === 'telescope' && '🔭'}
                    {icon === 'unicorn' && '🦄'}
                    {icon === 'rainbow' && '🌈'}
                    {icon === 'castle' && '🏰'}
                  </div>
                ))}
              </div>
            </div>

            {/* Layout */}
            <div>
              <h4 className="font-semibold mb-3">Layout Style</h4>
              <div className="text-sm">
                <span className="capitalize">{template.metadata.layout.replace('_', ' ')}</span>
                {template.metadata.gradients && (
                  <div className="mt-2">
                    <span className="text-gray-600">Includes gradient backgrounds</span>
                  </div>
                )}
                {template.metadata.animations && (
                  <div className="mt-1">
                    <span className="text-gray-600">Interactive animations</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Select This Theme
          </button>
        </div>
      </div>
    </div>
  );
};