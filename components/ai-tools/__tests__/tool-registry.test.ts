import { AI_TOOLS } from '../tool-registry';

describe('tool registry', () => {
  it('contains all six suite tools', () => {
    expect(AI_TOOLS.map((t) => t.id)).toEqual([
      'phonetic-converter',
      'prompt-improver',
      'email-drafter',
      'summarizer',
      'meeting-actions',
      'output-checker',
    ]);
  });

  it('routes the phonetic converter to the tools page', () => {
    const phonetic = AI_TOOLS.find((t) => t.id === 'phonetic-converter');
    expect(phonetic?.href).toBe('/tools');
  });

  it('gives every tool a name, tagline, and href', () => {
    for (const tool of AI_TOOLS) {
      expect(tool.name.length).toBeGreaterThan(3);
      expect(tool.tagline.length).toBeGreaterThan(10);
      expect(tool.href.startsWith('/tools')).toBe(true);
    }
  });
});
