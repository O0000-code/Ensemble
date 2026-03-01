import { describe, it, expect } from 'vitest';
import { truncateToFirstSentence } from '../text';

describe('truncateToFirstSentence', () => {
  it('returns empty string for falsy input', () => {
    expect(truncateToFirstSentence('')).toBe('');
    expect(truncateToFirstSentence(null as unknown as string)).toBe('');
    expect(truncateToFirstSentence(undefined as unknown as string)).toBe('');
  });

  it('returns entire text when first sentence is within maxLength', () => {
    expect(truncateToFirstSentence('Hello world.', 50)).toBe('Hello world.');
  });

  it('detects English sentence ending with period followed by space', () => {
    expect(truncateToFirstSentence('First sentence. Second sentence.', 100)).toBe(
      'First sentence.',
    );
  });

  it('detects Chinese sentence ending with 。', () => {
    expect(truncateToFirstSentence('第一句话。第二句话。', 100)).toBe('第一句话。');
  });

  it('does not treat period in abbreviation as sentence end', () => {
    // Period followed directly by a letter is not a sentence boundary
    expect(truncateToFirstSentence('Use v2.0 version. It is great.', 100)).toBe(
      'Use v2.0 version.',
    );
  });

  it('truncates long text at word boundary and adds ellipsis', () => {
    const longText =
      'This is a very long sentence that goes on and on without any period to break it up properly';
    const result = truncateToFirstSentence(longText, 30);
    expect(result.endsWith('...')).toBe(true);
    // Should be at most maxLength + ellipsis
    expect(result.length).toBeLessThanOrEqual(33); // 30 + "..."
  });

  it('removes trailing punctuation before adding ellipsis', () => {
    const text = 'Word, another word, yet another word, and more words continue forever.';
    const result = truncateToFirstSentence(text, 20);
    // Should not end with ", ..." but with "..."
    expect(result).not.toMatch(/[,;:，；：、]\.\.\./);
    expect(result.endsWith('...')).toBe(true);
  });

  it('returns text with no sentence boundary as-is if within maxLength', () => {
    expect(truncateToFirstSentence('No period here', 100)).toBe('No period here');
  });

  it('uses default maxLength of 100', () => {
    const shortText = 'Short text.';
    expect(truncateToFirstSentence(shortText)).toBe('Short text.');
  });
});
