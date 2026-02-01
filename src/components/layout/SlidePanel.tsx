import React from 'react';
import { X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

// ============================================================================
// SlidePanel Component
// ============================================================================
// A slide-in panel that appears from the right side of the screen.
// Used for detail views in Skills, MCP Servers, Scenes, and Projects pages.
//
// Features:
// - Smooth slide-in/slide-out animation from the right
// - Optional header with close button
// - Window dragging support on header
// - Configurable width and animation duration

// Helper to start window dragging
const startDrag = async (e: React.MouseEvent) => {
  if (e.button !== 0) return; // Only left mouse button
  try {
    await getCurrentWindow().startDragging();
  } catch (err) {
    // Ignore errors in browser mode
  }
};

export interface SlidePanelProps {
  /** Whether the panel is open/visible */
  isOpen: boolean;
  /** Panel width in pixels (default: 800) */
  width?: number;
  /** Content for the panel header (left side) */
  header?: React.ReactNode;
  /** Header right side content (shown before close button) */
  headerRight?: React.ReactNode;
  /** Panel main content */
  children: React.ReactNode;
  /** Callback when panel should close */
  onClose: () => void;
  /** Animation duration in milliseconds (default: 250) */
  duration?: number;
  /** Whether to show the close button (default: true) */
  showCloseButton?: boolean;
  /** Additional CSS classes for the panel container */
  className?: string;
}

/**
 * SlidePanel provides a sliding detail panel that appears from the right.
 *
 * Layout:
 * - Header: 56px height, contains title/info on left, actions + close button on right
 * - Content: Scrollable area with 28px padding
 *
 * Animation:
 * - Slides in from right using CSS transform
 * - Duration: 250ms (configurable)
 * - Easing: cubic-bezier(0.4, 0, 0.2, 1)
 */
export function SlidePanel({
  isOpen,
  width = 800,
  header,
  headerRight,
  children,
  onClose,
  duration = 250,
  showCloseButton = true,
  className = '',
}: SlidePanelProps) {
  return (
    <div
      className={`
        absolute top-0 right-0 h-full
        bg-white border-l border-[#E5E5E5]
        flex flex-col
        transition-transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        ${className}
      `}
      style={{
        width: `${width}px`,
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header - 56px height, draggable for window movement */}
      {(header || showCloseButton) && (
        <div
          className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E5E5E5] px-7"
          onMouseDown={startDrag}
        >
          {/* Left side - Header content */}
          <div className="pointer-events-none flex items-center [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_a]:pointer-events-auto [&_[role='button']]:pointer-events-auto [&_[role='switch']]:pointer-events-auto">
            {header}
          </div>

          {/* Right side - Actions and Close button */}
          <div className="pointer-events-none flex items-center gap-2 [&_button]:pointer-events-auto [&_input]:pointer-events-auto [&_a]:pointer-events-auto [&_[role='button']]:pointer-events-auto [&_[role='switch']]:pointer-events-auto">
            {headerRight}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E5E5] text-[#71717A] transition-colors hover:bg-[#FAFAFA] hover:text-[#18181B]"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content - Scrollable area */}
      <div className="flex-1 overflow-y-auto p-7">
        {children}
      </div>
    </div>
  );
}

export default SlidePanel;
