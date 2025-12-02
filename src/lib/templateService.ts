import { Template, TemplateMetadata } from '../types/advent';

// Mock template data - in production this would come from an API or database
const MOCK_TEMPLATES: Record<string, Template> = {
  'winter-wonderland': {
    template_id: 'winter-wonderland',
    name: 'Winter Wonderland',
    description: 'A magical winter theme with snowflakes and warm colors',
    metadata: {
      colors: {
        primary: '#dc2626', // Red
        secondary: '#16a34a', // Green
        accent: '#eab308' // Gold
      },
      fonts: {
        heading: '"Mountains of Christmas", cursive',
        body: 'system-ui, sans-serif'
      },
      icons: ['snowflake', 'tree', 'gift'],
      layout: 'rounded_tiles',
      gradients: {
        tileBackground: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)',
        tileHover: 'linear-gradient(135deg, #fed7aa 0%, #fdba74 100%)'
      },
      animations: {
        tileHover: 'scale(1.05)',
        tileClick: 'scale(0.95)'
      }
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    retired: false
  },
  'modern-christmas': {
    template_id: 'modern-christmas',
    name: 'Modern Christmas',
    description: 'A contemporary Christmas theme with clean lines and vibrant colors',
    metadata: {
      colors: {
        primary: '#7c3aed', // Purple
        secondary: '#059669', // Emerald
        accent: '#f59e0b' // Amber
      },
      fonts: {
        heading: '"Inter", sans-serif',
        body: '"Inter", sans-serif'
      },
      icons: ['star', 'bell', 'candle'],
      layout: 'square_tiles',
      gradients: {
        tileBackground: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        tileHover: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)'
      },
      animations: {
        tileHover: 'translateY(-2px)',
        tileClick: 'scale(0.98)'
      }
    },
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    retired: false
  }
};

export class TemplateService {
  static getTemplate(templateId: string): Template | null {
    return MOCK_TEMPLATES[templateId] || null;
  }

  static getAllTemplates(): Template[] {
    return Object.values(MOCK_TEMPLATES).filter(template => !template.retired);
  }

  static getTemplateMetadata(templateId: string): TemplateMetadata | null {
    const template = this.getTemplate(templateId);
    return template ? template.metadata : null;
  }

  static getDefaultTemplate(): Template {
    return MOCK_TEMPLATES['winter-wonderland'];
  }
}

// Export singleton instance
export const templateService = TemplateService;