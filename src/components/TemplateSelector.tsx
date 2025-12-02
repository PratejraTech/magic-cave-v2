import React from 'react';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: {
    colors: { primary: string; secondary: string; accent: string };
    icon: string;
  };
}

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

const AVAILABLE_TEMPLATES: Template[] = [
  {
    id: 'pastel-dreams',
    name: 'Pastel Dreams',
    description: 'Soft pastel colors with dreamy illustrations perfect for little dreamers',
    preview: {
      colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
      icon: '🦋'
    }
  },
  {
    id: 'adventure-boy',
    name: 'Adventure Boy',
    description: 'Bold colors with adventure-themed graphics for brave explorers',
    preview: {
      colors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD23F' },
      icon: '🗺️'
    }
  },
  {
    id: 'rainbow-fantasy',
    name: 'Rainbow Fantasy',
    description: 'Bright rainbow colors with magical elements and unicorns',
    preview: {
      colors: { primary: '#FF0080', secondary: '#8000FF', accent: '#00FF80' },
      icon: '🦄'
    }
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Choose a Calendar Theme *
      </label>
      <div className="grid grid-cols-1 gap-4">
        {AVAILABLE_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template.id)}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Color Preview */}
              <div className="flex space-x-1">
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.preview.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.preview.colors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.preview.colors.accent }}
                />
              </div>

              {/* Template Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{template.preview.icon}</span>
                  <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  {selectedTemplate === template.id && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </div>
            </div>

            {/* Sample Calendar Preview */}
            <div className="mt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded border-2 flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: i % 3 === 0 ? template.preview.colors.primary + '20' :
                                   i % 3 === 1 ? template.preview.colors.secondary + '20' :
                                   template.preview.colors.accent + '20',
                    borderColor: i % 3 === 0 ? template.preview.colors.primary :
                               i % 3 === 1 ? template.preview.colors.secondary :
                               template.preview.colors.accent
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;