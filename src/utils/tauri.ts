// Tauri environment detection and safe invoke wrapper

/**
 * Check if running in Tauri environment
 * Tauri 2.x uses __TAURI_INTERNALS__ instead of __TAURI__
 */
export const isTauri = (): boolean => {
  if (typeof window === 'undefined') return false;

  // Tauri 2.x detection
  if ('__TAURI_INTERNALS__' in window) return true;

  // Tauri 1.x fallback
  if ('__TAURI__' in window) return true;

  return false;
};

/**
 * Safe invoke wrapper that handles non-Tauri environments
 * Returns null if not in Tauri environment
 */
export const safeInvoke = async <T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T | null> => {
  if (!isTauri()) {
    console.warn(`Tauri not available. Cannot invoke: ${command}`);
    return null;
  }

  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, args);
};

/**
 * Browser mode warning message
 */
export const BROWSER_MODE_MESSAGE = "Please run this app using 'npm run tauri dev' for full functionality";
