import React, { useMemo, useState } from 'react';
import { applyTemplateStyling, getTemplateIcon } from '../lib/templateStyling';
import { TemplatePreview } from './TemplatePreview';
import { TEMPLATE_LIBRARY, TemplateDefinition } from '../data/templates';
import { cn } from '../lib/utils';

interface TemplateSelectorProps {
  selectedTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

const PREVIEW_SAMPLE = Array.from({ length: 10 }, (_, index) => index + 1);

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelectTemplate }) => {
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  const orderedTemplates = useMemo(() => {
    if (!selectedTemplate) return TEMPLATE_LIBRARY;
    return [...TEMPLATE_LIBRARY].sort((a, b) =>
      a.id === selectedTemplate ? -1 : b.id === selectedTemplate ? 1 : 0
    );
  }, [selectedTemplate]);

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
    const template = TEMPLATE_LIBRARY.find(t => t.id === templateId);
    if (template) {
      applyTemplateStyling(template.metadata, template.id);
    }
  };

  const handlePreviewTemplate = (template: TemplateDefinition) => {
    setPreviewTemplate(template);
  };

  const handleSelectFromPreview = (template: TemplateDefinition) => {
    handleSelectTemplate(template.id);
  };

  const renderMiniCalendar = (template: TemplateDefinition) => {
    return (
      <div className="mt-4 grid grid-cols-5 gap-1 text-[11px] font-semibold text-slate-600">
        {PREVIEW_SAMPLE.map((day, index) => (
          <div
            key={`${template.id}-${day}`}
            className={cn(
              'rounded-lg border px-1 py-2 text-center transition-all',
              template.metadata.layout === 'square_tiles' && 'rounded-none',
              template.metadata.layout === 'hexagon_tiles' && 'rounded-none'
            )}
            style={{
              background: template.metadata.gradients?.tileBackground ||
                (index % 3 === 0
                  ? `${template.metadata.colors.primary}22`
                  : index % 3 === 1
                    ? `${template.metadata.colors.secondary}22`
                    : `${template.metadata.colors.accent}22`),
              borderColor:
                index % 3 === 0
                  ? template.metadata.colors.primary
                  : index % 3 === 1
                    ? template.metadata.colors.secondary
                    : template.metadata.colors.accent,
              clipPath:
                template.metadata.layout === 'hexagon_tiles'
                  ? 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)'
                  : undefined
            }}
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500 dark:text-slate-300">Template Library</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-400">Each template updates tile colors, fonts, hover motion, and winter effects instantly.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {orderedTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;

          return (
            <article
              key={template.id}
              onClick={() => handleSelectTemplate(template.id)}
              role="radio"
              aria-checked={isSelected}
              className={cn(
                'group relative overflow-hidden rounded-4xl border p-5 transition-all backdrop-blur-sm',
                'hover:-translate-y-0.5 hover:shadow-2xl cursor-pointer',
                isSelected
                  ? 'border-emerald-400 ring-2 ring-emerald-200/60 shadow-emerald-200/70'
                  : isDarkMode
                    ? 'border-white/10 bg-slate-900/70 shadow-[0_20px_60px_rgba(2,6,23,0.55)]'
                    : 'border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]'
              )}
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-90 transition-all group-hover:opacity-100"
                style={{
                  background: template.heroGradient || `linear-gradient(135deg, ${template.metadata.colors.primary}20, ${template.metadata.colors.secondary}25)`
                }}
              />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'flex size-12 items-center justify-center rounded-2xl text-2xl shadow-inner',
                      isDarkMode ? 'bg-white/20 text-white' : 'bg-white text-slate-900'
                    )}
                    aria-hidden="true"
                  >
                    {getTemplateIcon(template.metadata.icons[0])}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{template.name}</h3>
                      {isSelected && (
                        <span className="rounded-full bg-white/80 px-2 py-1 text-xs font-semibold text-emerald-600">
                          Selected
                        </span>
                      )}
                    </div>
                    {template.headline && (
                      <p className="mt-1 text-sm text-slate-700 dark:text-white/80">{template.headline}</p>
                    )}
                    {template.familyHook && (
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                        {template.familyHook}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePreviewTemplate(template);
                  }}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                    isDarkMode
                      ? 'border-white/30 text-white/80 hover:border-white hover:text-white'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                  )}
                >
                  Preview
                </button>
              </div>

              {template.tags && (
                <div className="relative z-10 mt-3 flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <span
                      key={tag}
                      className={cn(
                        'rounded-full border px-2 py-1 text-[11px] font-semibold uppercase tracking-wide',
                        isDarkMode
                          ? 'border-white/30 bg-white/10 text-white/80'
                          : 'border-white/40 bg-white/80 text-slate-600'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="relative z-10">
                {renderMiniCalendar(template)}
              </div>
            </article>
          );
        })}
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
