import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { isTauri, BROWSER_MODE_MESSAGE } from '../tauri';

describe('isTauri', () => {
  beforeEach(() => {
    // Clean up any Tauri flags
    if ('__TAURI_INTERNALS__' in window) {
      delete (window as Record<string, unknown>).__TAURI_INTERNALS__;
    }
    if ('__TAURI__' in window) {
      delete (window as Record<string, unknown>).__TAURI__;
    }
  });

  afterEach(() => {
    // Clean up
    if ('__TAURI_INTERNALS__' in window) {
      delete (window as Record<string, unknown>).__TAURI_INTERNALS__;
    }
    if ('__TAURI__' in window) {
      delete (window as Record<string, unknown>).__TAURI__;
    }
  });

  it('returns false when no Tauri globals exist', () => {
    expect(isTauri()).toBe(false);
  });

  it('returns true when __TAURI_INTERNALS__ exists (Tauri 2.x)', () => {
    Object.defineProperty(window, '__TAURI_INTERNALS__', {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(isTauri()).toBe(true);
  });

  it('returns true when __TAURI__ exists (Tauri 1.x fallback)', () => {
    Object.defineProperty(window, '__TAURI__', {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(isTauri()).toBe(true);
  });
});

describe('BROWSER_MODE_MESSAGE', () => {
  it('is a non-empty string', () => {
    expect(typeof BROWSER_MODE_MESSAGE).toBe('string');
    expect(BROWSER_MODE_MESSAGE.length).toBeGreaterThan(0);
  });

  it('mentions tauri dev', () => {
    expect(BROWSER_MODE_MESSAGE).toContain('tauri dev');
  });
});
