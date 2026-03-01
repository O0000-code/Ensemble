import { describe, it, expect } from 'vitest';
import { categoryColors, getCategoryColor } from '../constants';

describe('categoryColors', () => {
  it('contains expected category keys', () => {
    expect(categoryColors).toHaveProperty('development');
    expect(categoryColors).toHaveProperty('design');
    expect(categoryColors).toHaveProperty('research');
    expect(categoryColors).toHaveProperty('productivity');
    expect(categoryColors).toHaveProperty('other');
  });

  it('all values are valid hex color strings', () => {
    Object.values(categoryColors).forEach((color) => {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });
});

describe('getCategoryColor', () => {
  it('returns correct color for known categories', () => {
    expect(getCategoryColor('development')).toBe('#18181B');
    expect(getCategoryColor('design')).toBe('#8B5CF6');
    expect(getCategoryColor('research')).toBe('#3B82F6');
    expect(getCategoryColor('productivity')).toBe('#10B981');
  });

  it('is case-insensitive', () => {
    expect(getCategoryColor('Development')).toBe('#18181B');
    expect(getCategoryColor('DESIGN')).toBe('#8B5CF6');
  });

  it('returns "other" color for unknown categories', () => {
    expect(getCategoryColor('nonexistent')).toBe(categoryColors.other);
    expect(getCategoryColor('')).toBe(categoryColors.other);
  });

  it('handles null/undefined by returning "other" color', () => {
    expect(getCategoryColor(null as unknown as string)).toBe(categoryColors.other);
    expect(getCategoryColor(undefined as unknown as string)).toBe(categoryColors.other);
  });
});
