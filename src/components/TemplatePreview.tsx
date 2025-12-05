import React from 'react';
import { X } from 'lucide-react';
import { TemplateDefinition } from '../data/templates';
import { getTemplateIcon } from '../lib/templateStyling';
import { cn } from '../lib/utils';

interface TemplatePreviewProps {
  template: TemplateDefinition;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (template: TemplateDefinition) => void;
}

const SAMPLE_CALENDAR_DATA = Array.from({ length: 25 }, (_, i) => ({
  day: i + 1,
  title: i < 5 ? `Day ${i + 1}` : undefined,
  isUnlocked: i < 5
}));

const tileState = (tile: (typeof SAMPLE_CALENDAR_DATA)[number]) => {
  if (tile.isUnlocked) return 'unlocked';
  if (tile.day % 3 === 0) return 'locked';
  return 'empty';
};

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

  const tileClassName = (tile: (typeof SAMPLE_CALENDAR_DATA)[number]) =>
    cn(
      'winter-calendar-tile min-h-[90px]',
      template.metadata.layout === 'square_tiles' && 'winter-calendar-tile--square',
      template.metadata.layout === 'hexagon_tiles' && 'winter-calendar-tile--hexagon',
      tile.isUnlocked && 'shadow-lg'
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div
          className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-5"
          style={{
            background: `linear-gradient(135deg, ${template.metadata.colors.primary}0f, ${template.metadata.colors.secondary}0f)`
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-white text-3xl shadow">
              {getTemplateIcon(template.metadata.icons[0])}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{template.name}</h2>
              <p className="text-slate-600">{template.description}</p>
              {template.tags && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.tags.map(tag => (
                    <span
                      key={`${template.id}-${tag}`}
                      className="rounded-full border border-white/40 bg-white/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-600 transition hover:bg-white/70 hover:text-slate-900"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-200px)] space-y-8 overflow-y-auto px-6 py-8">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Calendar Preview</h3>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                {template.metadata.layout.replace('_', ' ')}
              </p>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {SAMPLE_CALENDAR_DATA.map((tile) => (
                <div
                  key={tile.day}
                  className={tileClassName(tile)}
                  data-state={tileState(tile)}
                  style={{
                    background:
                      (tileState(tile) === 'locked' && template.metadata.gradients?.tileBackground) ||
                      undefined
                  }}
                >
                  <div className="winter-calendar-day-label">Day {tile.day}</div>
                  {tile.title && (
                    <div className="winter-calendar-title" title={tile.title}>
                      {tile.title}
                    </div>
                  )}
                  <div
                    className={cn(
                      'winter-calendar-meta',
                      tile.isUnlocked
                        ? 'winter-calendar-meta--success'
                        : tileState(tile) === 'locked'
                          ? 'winter-calendar-meta--gift'
                          : undefined
                    )}
                  >
                    {tile.isUnlocked ? 'Unlocked' : tileState(tile) === 'locked' ? 'Locking' : 'Pending'}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-sm text-slate-500">
              Tiles inherit fonts, gradients, hover motion, and states from this template.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Color Palette</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: template.metadata.colors.primary }}
                  />
                  <span className="text-sm text-slate-600">{template.metadata.colors.primary}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: template.metadata.colors.secondary }}
                  />
                  <span className="text-sm text-slate-600">{template.metadata.colors.secondary}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="h-6 w-6 rounded-full border"
                    style={{ backgroundColor: template.metadata.colors.accent }}
                  />
                  <span className="text-sm text-slate-600">{template.metadata.colors.accent}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Typography</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Headings</p>
                  <p
                    className="mt-1 text-lg font-semibold text-slate-900"
                    style={{ fontFamily: template.metadata.fonts.heading }}
                  >
                    {template.metadata.fonts.heading}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Body</p>
                  <p
                    className="mt-1 text-sm text-slate-700"
                    style={{ fontFamily: template.metadata.fonts.body }}
                  >
                    {template.metadata.fonts.body}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Theme Icons</h4>
              <div className="flex gap-4 text-3xl">
                {template.metadata.icons.map((icon) => (
                  <span key={`${template.id}-${icon}`}>{getTemplateIcon(icon)}</span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-3 font-semibold text-slate-900">Layout & Motion</h4>
              <ul className="space-y-1 text-sm text-slate-600">
                <li className="capitalize">Layout · {template.metadata.layout.replace('_', ' ')}</li>
                {template.metadata.gradients?.tileBackground && (
                  <li>Layered gradient backgrounds</li>
                )}
                {template.metadata.animations?.tileHover && (
                  <li>Hover: {template.metadata.animations.tileHover}</li>
                )}
                {template.metadata.animations?.tileClick && (
                  <li>Click: {template.metadata.animations.tileClick}</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            Select This Theme
          </button>
        </div>
      </div>
    </div>
  );
};
