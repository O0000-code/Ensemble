/**
 * Truncate text to first sentence (ending with . or 。)
 * Won't cut in the middle of a word for English text
 * Removes trailing punctuation before adding ellipsis
 */
export function truncateToFirstSentence(text: string, maxLength: number = 100): string {
  if (!text) return '';

  // Find first sentence ending
  let sentenceEnd = -1;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    // Chinese period - always ends sentence
    if (char === '。') {
      sentenceEnd = i + 1;
      break;
    }
    // English period - only ends sentence if followed by space, newline, or end
    if (char === '.') {
      const nextChar = text[i + 1];
      if (!nextChar || nextChar === ' ' || nextChar === '\n' || nextChar === '\t') {
        sentenceEnd = i + 1;
        break;
      }
    }
  }

  let result = sentenceEnd > 0 ? text.slice(0, sentenceEnd) : text;

  // If result fits within maxLength, return it (with period intact)
  if (result.length <= maxLength) {
    return result;
  }

  // Need to truncate - find word boundary
  // Look for the last space within the limit
  let cutIndex = maxLength;

  // Search backwards from maxLength to find a space
  for (let i = maxLength - 1; i >= maxLength * 0.4; i--) {
    if (result[i] === ' ') {
      cutIndex = i;
      break;
    }
  }

  // Cut at the found position
  result = result.slice(0, cutIndex);

  // Remove trailing punctuation (comma, semicolon, colon, etc.)
  result = result.replace(/[,;:，；：、\s]+$/, '');

  return result + '...';
}
