/**
 * @jest-environment node
 */
import { getToolConfig, isKnownTool } from '../config';
import { AiServiceError } from '../types';

describe('AI tool config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AI_DEFAULT_MODEL;
    delete process.env.AI_MODEL_PROMPT_IMPROVER;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('getToolConfig', () => {
    it('returns the prompt-improver config with the default model', () => {
      const config = getToolConfig('prompt-improver');

      expect(config.id).toBe('prompt-improver');
      expect(config.model).toBe('claude-haiku-4-5');
      expect(config.maxTokens).toBe(1024);
      expect(config.maxInputChars).toBe(2000);
      expect(config.systemPrompt.length).toBeGreaterThan(50);
    });

    it('lets AI_DEFAULT_MODEL override the built-in default', () => {
      process.env.AI_DEFAULT_MODEL = 'claude-sonnet-4-6';

      expect(getToolConfig('prompt-improver').model).toBe('claude-sonnet-4-6');
    });

    it('lets the per-tool env var win over AI_DEFAULT_MODEL', () => {
      process.env.AI_DEFAULT_MODEL = 'claude-sonnet-4-6';
      process.env.AI_MODEL_PROMPT_IMPROVER = 'claude-opus-4-8';

      expect(getToolConfig('prompt-improver').model).toBe('claude-opus-4-8');
    });

    it('ignores empty-string env overrides', () => {
      process.env.AI_DEFAULT_MODEL = '';
      process.env.AI_MODEL_PROMPT_IMPROVER = '';

      expect(getToolConfig('prompt-improver').model).toBe('claude-haiku-4-5');
    });

    it('throws a 404 AiServiceError for an unknown tool', () => {
      expect(() => getToolConfig('does-not-exist')).toThrow(AiServiceError);
      try {
        getToolConfig('does-not-exist');
      } catch (error) {
        expect((error as AiServiceError).status).toBe(404);
      }
    });
  });

  describe('isKnownTool', () => {
    it('accepts known tools', () => {
      expect(isKnownTool('prompt-improver')).toBe(true);
    });

    it('rejects unknown tools', () => {
      expect(isKnownTool('resume-writer')).toBe(false);
      expect(isKnownTool('')).toBe(false);
    });
  });

  describe('full tool suite', () => {
    const ALL_TOOLS = [
      'prompt-improver',
      'email-drafter',
      'summarizer',
      'meeting-actions',
      'output-checker',
    ];

    it.each(ALL_TOOLS)('%s has a complete config', (toolId) => {
      const config = getToolConfig(toolId);

      expect(config.id).toBe(toolId);
      expect(config.model).toBe('claude-haiku-4-5');
      expect(config.maxTokens).toBeGreaterThanOrEqual(1024);
      expect(config.maxInputChars).toBeGreaterThanOrEqual(2000);
      expect(config.systemPrompt.length).toBeGreaterThan(50);
    });

    it('resolves per-tool env overrides for every tool', () => {
      process.env.AI_MODEL_EMAIL_DRAFTER = 'claude-sonnet-4-6';
      process.env.AI_MODEL_OUTPUT_CHECKER = 'claude-opus-4-8';

      expect(getToolConfig('email-drafter').model).toBe('claude-sonnet-4-6');
      expect(getToolConfig('output-checker').model).toBe('claude-opus-4-8');
      expect(getToolConfig('summarizer').model).toBe('claude-haiku-4-5');
    });
  });
});