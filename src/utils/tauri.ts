// Tauri environment detection and safe invoke wrapper

/**
 * Check if running in Tauri environment
 */
export const isTauri = (): boolean => {
  return typeof window !== 'undefined' &&
    (window as unknown as { __TAURI__?: unknown }).__TAURI__ !== undefined;
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
