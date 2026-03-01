import { describe, it, expect } from 'vitest';
import { parseDescription } from '../parseDescription';

describe('parseDescription', () => {
  it('returns empty firstSentence and null remaining for empty input', () => {
    expect(parseDescription('')).toEqual({ firstSentence: '', remaining: null });
    expect(parseDescription(null as unknown as string)).toEqual({
      firstSentence: '',
      remaining: null,
    });
    expect(parseDescription(undefined as unknown as string)).toEqual({
      firstSentence: '',
      remaining: null,
    });
  });

  it('splits on ". Use when" pattern (most common 56%)', () => {
    const result = parseDescription(
      'Review UI code for compliance. Use when asked to review my UI.',
    );
    expect(result).toEqual({
      firstSentence: 'Review UI code for compliance.',
      remaining: 'Use when asked to review my UI.',
    });
  });

  it('splits on ". This skill should be used when" pattern', () => {
    const result = parseDescription(
      'Formats TypeScript files. This skill should be used when code needs formatting.',
    );
    expect(result).toEqual({
      firstSentence: 'Formats TypeScript files.',
      remaining: 'This skill should be used when code needs formatting.',
    });
  });

  it('splits on "Triggers:" pattern', () => {
    const result = parseDescription('Automates deployment. Triggers: when push to main branch.');
    expect(result).toEqual({
      firstSentence: 'Automates deployment.',
      remaining: 'Triggers: when push to main branch.',
    });
  });

  it('splits on numbered list pattern (1)', () => {
    const result = parseDescription('Multi-step workflow. (1) First step (2) Second step.');
    expect(result).toEqual({
      firstSentence: 'Multi-step workflow.',
      remaining: '(1) First step (2) Second step.',
    });
  });

  it('splits on Chinese markers', () => {
    const result = parseDescription('将Markdown格式转换为Word文档。适用场景：论文转换');
    expect(result).toEqual({
      firstSentence: '将Markdown格式转换为Word文档。',
      remaining: '适用场景：论文转换',
    });
  });

  it('falls back to first sentence boundary', () => {
    const result = parseDescription(
      'This is the first sentence. And then some more details follow.',
    );
    expect(result).toEqual({
      firstSentence: 'This is the first sentence.',
      remaining: 'And then some more details follow.',
    });
  });

  it('returns entire description when no sentence boundary exists', () => {
    const result = parseDescription('Best practices for Remotion - Video creation in React');
    expect(result).toEqual({
      firstSentence: 'Best practices for Remotion - Video creation in React',
      remaining: null,
    });
  });

  it('normalizes multiline input', () => {
    const result = parseDescription('First line\n  second line. Use when needed.');
    expect(result.firstSentence).toBe('First line second line.');
    expect(result.remaining).toBe('Use when needed.');
  });
});
