import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Sparkles, X } from 'lucide-react';
import { TEMPLATE_LIBRARY, TemplateDefinition } from '../data/templates';
import { TemplatePreview } from './TemplatePreview';
import { Button } from './ui/WonderButton';
import { Card, CardContent, CardFooter, CardTags, CardTag } from './ui/card';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { cn } from '../lib/utils';
import { getTemplateIcon } from '../lib/templateStyling';

interface TemplateMarketplaceProps {
  currentTemplate: string | null;
  onSelectTemplate: (templateId: string) => void;
}

type FilterCategory = 'all' | 'popular' | 'modern' | 'whimsical' | 'elegant';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Templates' },
  { value: 'popular', label: 'Popular' },
  { value: 'modern', label: 'Modern' },
  { value: 'whimsical', label: 'Whimsical' },
  { value: 'elegant', label: 'Elegant' }
];

const PREVIEW_SAMPLE = Array.from({ length: 10 }, (_, index) => index + 1);

const TemplateMarketplace: React.FC<TemplateMarketplaceProps> = ({ currentTemplate, onSelectTemplate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateDefinition | null>(null);

  // Filter and search templates
  const filteredTemplates = useMemo(() => {
    let filtered = [...TEMPLATE_LIBRARY];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          template.headline?.toLowerCase().includes(query) ||
          template.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter((template) =>
        template.tags?.some((tag) => tag.toLowerCase() === filterCategory)
      );
    }

    // Sort by: current template first, then alphabetically
    filtered.sort((a, b) => {
      if (a.id === currentTemplate) return -1;
      if (b.id === currentTemplate) return 1;
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [searchQuery, filterCategory, currentTemplate]);

  const handleSelectTemplate = (templateId: string) => {
    onSelectTemplate(templateId);
  };

  const renderMiniCalendar = (template: TemplateDefinition) => {
    return (
      <div className="grid grid-cols-5 gap-1.5">
        {PREVIEW_SAMPLE.map((day, index) => (
          <div
            key={`${template.id}-${day}`}
            className={cn(
              'aspect-square rounded-lg border flex items-center justify-center text-[10px] font-semibold transition-all',
              template.metadata.layout === 'square_tiles' && 'rounded-none',
              template.metadata.layout === 'hexagon_tiles' && 'rounded-none'
            )}
            style={{
              background:
                template.metadata.gradients?.tileBackground ||
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
              color: template.metadata.colors.primary,
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
    <div className="space-y-8">
      {/* Search and Filters */}
      <Card variant="elevated">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              value={filterCategory}
              onChange={(value) => setFilterCategory(value as FilterCategory)}
              options={FILTER_OPTIONS}
              placeholder="Filter by category"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
        </p>
        {(searchQuery || filterCategory !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
            }}
            leftIcon={<X className="h-4 w-4" />}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredTemplates.map((template, index) => {
            const isSelected = currentTemplate === template.id;

            return (
              <motion.div
                key={template.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  variant="feature"
                  hover
                  className={cn(
                    'h-full relative overflow-hidden transition-all',
                    isSelected && 'ring-2 ring-primary-rose shadow-xl'
                  )}
                >
                  {/* Gradient Background */}
                  <div
                    className="absolute inset-0 opacity-30 pointer-events-none"
                    style={{
                      background:
                        template.heroGradient ||
                        `linear-gradient(135deg, ${template.metadata.colors.primary}40, ${template.metadata.colors.secondary}40)`
                    }}
                  />

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white shadow-md">
                      <Star className="h-3 w-3 text-primary-rose fill-primary-rose" />
                      <span className="text-xs font-semibold text-text-primary">Current</span>
                    </div>
                  )}

                  <CardContent className="relative z-10 pt-6 space-y-4">
                    {/* Icon and Title */}
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl shadow-sm"
                        style={{
                          background: `linear-gradient(135deg, ${template.metadata.colors.primary}, ${template.metadata.colors.secondary})`
                        }}
                      >
                        {getTemplateIcon(template.metadata.icons[0])}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text-primary">{template.name}</h3>
                        {template.headline && (
                          <p className="text-sm text-text-secondary mt-1">{template.headline}</p>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {template.tags && (
                      <CardTags>
                        {template.tags.map((tag) => (
                          <CardTag key={tag}>{tag}</CardTag>
                        ))}
                      </CardTags>
                    )}

                    {/* Mini Calendar Preview */}
                    <div className="pt-2">{renderMiniCalendar(template)}</div>
                  </CardContent>

                  <CardFooter className="relative z-10 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      Preview
                    </Button>
                    <Button
                      variant={isSelected ? 'soft' : 'primary'}
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSelectTemplate(template.id)}
                      disabled={isSelected}
                    >
                      {isSelected ? 'Applied' : 'Apply'}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center">
            <Sparkles className="h-12 w-12 text-text-tertiary mx-auto mb-4" />
            <p className="text-text-secondary">No templates found matching your search.</p>
            <p className="text-sm text-text-tertiary mt-2">Try adjusting your filters or search query.</p>
          </CardContent>
        </Card>
      )}

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          onSelect={(template) => {
            handleSelectTemplate(template.id);
            setPreviewTemplate(null);
          }}
        />
      )}
    </div>
  );
};

export default TemplateMarketplace;
