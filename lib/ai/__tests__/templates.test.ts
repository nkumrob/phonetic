/**
 * @jest-environment node
 */
import { getTemplates } from '../templates';

const AI_TOOL_IDS = [
  'prompt-improver',
  'email-drafter',
  'summarizer',
  'meeting-actions',
  'output-checker',
];

describe('starter templates', () => {
  it.each(AI_TOOL_IDS)('%s has 3-6 well-formed templates', (toolId) => {
    const templates = getTemplates(toolId);
    expect(templates.length).toBeGreaterThanOrEqual(3);
    expect(templates.length).toBeLessThanOrEqual(6);
    for (const template of templates) {
      expect(template.label.length).toBeGreaterThan(3);
      expect(template.label.length).toBeLessThan(40);
      expect(template.input.length).toBeGreaterThanOrEqual(20);
      expect(template.input.length).toBeLessThanOrEqual(2000);
    }
  });

  it('returns empty for tools without templates', () => {
    expect(getTemplates('phonetic-converter')).toEqual([]);
    expect(getTemplates('unknown')).toEqual([]);
  });
});
