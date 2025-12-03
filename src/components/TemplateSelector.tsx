import React, { useState } from 'react';
import { applyTemplateStyling, getTemplateIcon } from '../lib/templateStyling';
import { DEFAULT_TEMPLATES } from '../types/calendar';
import { TemplatePreview } from './TemplatePreview';

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

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

const AVAILABLE_TEMPLATES: Template[] = [
  {
    id: DEFAULT_TEMPLATES.PASTEL_DREAMS,
    name: 'Pastel Dreams',
    description: 'Soft pastel colors with dreamy illustrations perfect for little dreamers',
    metadata: {
      colors: { primary: '#FFB3BA', secondary: '#BAFFC9', accent: '#BAE1FF' },
      fonts: { heading: 'Comic Sans MS', body: 'Arial' },
      icons: ['butterfly', 'star', 'heart'],
      layout: 'rounded_tiles'
    }
  },
  {
    id: DEFAULT_TEMPLATES.ADVENTURE_THEME,
    name: 'Adventure Boy',
    description: 'Bold colors with adventure-themed graphics for brave explorers',
    metadata: {
      colors: { primary: '#FF6B35', secondary: '#F7931E', accent: '#FFD23F' },
      fonts: { heading: 'Impact', body: 'Verdana' },
      icons: ['mountain', 'compass', 'telescope'],
      layout: 'square_tiles'
    }
  },
  {
    id: DEFAULT_TEMPLATES.CELEBRATION_THEME,
    name: 'Rainbow Fantasy',
    description: 'Bright rainbow colors with magical elements and unicorns',
    metadata: {
      colors: { primary: '#FF0080', secondary: '#8000FF', accent: '#00FF80' },
      fonts: { heading: 'Fantasy', body: 'Georgia' },
      icons: ['unicorn', 'rainbow', 'castle'],
      layout: 'hexagon_tiles'
    }
  }
];

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    // Apply template styling immediately for preview
    const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      applyTemplateStyling(template.metadata, template.id);
    }
  };

  const handlePreviewTemplate = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleSelectFromPreview = (template: Template) => {
    handleSelectTemplate(template.id);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">
        Choose a Calendar Theme *
      </label>
      <div className="grid grid-cols-1 gap-4">
        {AVAILABLE_TEMPLATES.map((template) => (
          <div
            key={template.id}
            onClick={() => handleSelectTemplate(template.id)}
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
                  style={{ backgroundColor: template.metadata.colors.primary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.metadata.colors.secondary }}
                />
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: template.metadata.colors.accent }}
                />
              </div>

               {/* Template Info */}
               <div className="flex-1">
                 <div className="flex items-center space-x-2">
                   <span className="text-2xl">{getTemplateIcon(template.metadata.icons[0])}</span>
                   <h3 className="font-semibold text-gray-800">{template.name}</h3>
                   {selectedTemplate === template.id && (
                     <span className="text-blue-500">✓</span>
                   )}
                 </div>
                 <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     handlePreviewTemplate(template);
                   }}
                   className="text-sm text-blue-500 hover:text-blue-700 mt-2 underline"
                 >
                   Preview Theme
                 </button>
               </div>
            </div>

            {/* Sample Calendar Preview */}
            <div className="mt-4 grid grid-cols-7 gap-1">
              {Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className={`aspect-square rounded border-2 flex items-center justify-center text-xs font-bold transition-all ${
                    template.metadata.layout === 'square_tiles' ? 'rounded-none' :
                    template.metadata.layout === 'hexagon_tiles' ? 'rounded-none' : 'rounded'
                  }`}
                  style={{
                    background: template.metadata.gradients?.tileBackground || (
                      i % 3 === 0 ? template.metadata.colors.primary + '20' :
                      i % 3 === 1 ? template.metadata.colors.secondary + '20' :
                      template.metadata.colors.accent + '20'
                    ),
                    borderColor: i % 3 === 0 ? template.metadata.colors.primary :
                                i % 3 === 1 ? template.metadata.colors.secondary :
                                template.metadata.colors.accent,
                    clipPath: template.metadata.layout === 'hexagon_tiles'
                      ? 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
                      : undefined
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleSelectFromPreview}
        />
      )}
    </div>
  );
};

export default TemplateSelector;