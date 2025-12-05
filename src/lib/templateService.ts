import { Template, TemplateMetadata } from '../types/calendar';
import { TEMPLATE_LIBRARY } from '../data/templates';

const toTemplateRecord = (definition: typeof TEMPLATE_LIBRARY[number]): Template => ({
  template_id: definition.id,
  name: definition.name,
  description: definition.description,
  metadata: definition.metadata,
  created_at: definition.createdAt || '2024-01-01T00:00:00Z',
  updated_at: definition.updatedAt || definition.createdAt || '2024-01-01T00:00:00Z',
  retired: false
});

// Mock template data - in production this would come from an API or database
const MOCK_TEMPLATES: Record<string, Template> = TEMPLATE_LIBRARY.reduce((acc, definition) => {
  acc[definition.id] = toTemplateRecord(definition);
  return acc;
}, {} as Record<string, Template>);

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
