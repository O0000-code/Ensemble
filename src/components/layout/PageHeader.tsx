import React from 'react';
import { SearchInput } from '../common/SearchInput';
import { getCurrentWindow } from '@tauri-apps/api/window';

// Helper to start window dragging
const startDrag = async (e: React.MouseEvent) => {
  if (e.button !== 0) return;

  const target = e.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  // Don't drag if clicking on interactive elements
  if (
    tagName === 'button' ||
    tagName === 'input' ||
    tagName === 'a' ||
    tagName === 'select' ||
    tagName === 'textarea' ||
    target.getAttribute('role') === 'button' ||
    target.getAttribute('role') === 'switch' ||
    target.closest('button, input, a, select, textarea, [role="button"], [role="switch"]')
  ) {
    return;
  }

  try {
    await getCurrentWindow().startDragging();
  } catch (err) {
    // Ignore errors in browser mode
  }
};

// ============================================================================
// PageHeader Component
// ============================================================================
// Used for: Skills list, MCP Servers list, Scenes list, Settings pages
// Single-column page header with title, optional badge, search, and actions

export interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional badge element (e.g., count badge) */
  badge?: React.ReactNode;
  /** Search input value */
  searchValue?: string;
  /** Search input change handler */
  onSearchChange?: (value: string) => void;
  /** Search input placeholder text */
  searchPlaceholder?: string;
  /** Action buttons or other elements for the right side */
  actions?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PageHeader provides a consistent header for single-column pages.
 *
 * Layout:
 * - Height: 56px
 * - Padding: 0 28px
 * - Border bottom: 1px solid #E5E5E5
 * - Background: #FFFFFF
 *
 * Left section:
 * - Title (16px/600, #18181B)
 * - Optional badge
 *
 * Right section:
 * - Optional search input
 * - Optional action buttons
 */
export function PageHeader({
  title,
  badge,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  actions,
  className = '',
}: PageHeaderProps) {
  const showSearch = searchValue !== undefined && onSearchChange !== undefined;

  return (
    <header
      onMouseDown={startDrag}
      className={`
        flex
        h-14
        flex-shrink-0
        items-center
        justify-between
        border-b
        border-[#E5E5E5]
        bg-white
        px-7
        ${className}
      `}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-semibold text-[#18181B]">
          {title}
        </h1>
        {badge}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {showSearch && (
          <SearchInput
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}
        {actions}
      </div>
    </header>
  );
}

export default PageHeader;
