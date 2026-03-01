/**
 * Tauri IPC Mock helpers for testing
 *
 * Provides utilities to mock `@tauri-apps/api/core` invoke calls
 * so tests can run without a real Tauri runtime.
 */
import { vi } from 'vitest';

// Registry of mock command handlers
type CommandHandler = (...args: unknown[]) => unknown;
const mockHandlers = new Map<string, CommandHandler>();

/**
 * Mocked invoke function.
 * Returns the result from a registered handler, or null if no handler is registered.
 */
export const mockInvoke = vi.fn(async (command: string, args?: Record<string, unknown>) => {
  const handler = mockHandlers.get(command);
  if (handler) {
    return handler(args);
  }
  return null;
});

/**
 * Register a mock handler for a specific Tauri IPC command.
 *
 * @example
 * ```ts
 * registerMockCommand('get_categories', () => [
 *   { id: '1', name: 'Development', color: '#000', count: 5 }
 * ]);
 * ```
 */
export function registerMockCommand(command: string, handler: CommandHandler): void {
  mockHandlers.set(command, handler);
}

/**
 * Clear all registered mock command handlers and reset the invoke mock.
 * Call this in beforeEach or afterEach to ensure test isolation.
 */
export function clearMockCommands(): void {
  mockHandlers.clear();
  mockInvoke.mockClear();
}

/**
 * Setup the Tauri environment mock.
 * Call this via vi.mock at the top of your test file:
 *
 * @example
 * ```ts
 * vi.mock('@tauri-apps/api/core', () => ({
 *   invoke: mockInvoke,
 * }));
 * ```
 */
export function setupTauriMock(): void {
  // Simulate Tauri 2.x environment detection
  Object.defineProperty(window, '__TAURI_INTERNALS__', {
    value: {},
    writable: true,
    configurable: true,
  });
}

/**
 * Teardown the Tauri environment mock.
 * Removes the __TAURI_INTERNALS__ property from window.
 */
export function teardownTauriMock(): void {
  if ('__TAURI_INTERNALS__' in window) {
    delete (window as Record<string, unknown>).__TAURI_INTERNALS__;
  }
}
