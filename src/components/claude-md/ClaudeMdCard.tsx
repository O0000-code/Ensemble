// src/components/claude-md/ClaudeMdCard.tsx

import React, { useRef, useState } from 'react';
import { FileText, MoreHorizontal, Trash2 } from 'lucide-react';
import { ClaudeMdBadge } from './ClaudeMdBadge';
import { TagsWithTooltip } from '@/components/common/TagsWithTooltip';
import type { ClaudeMdFile } from '@/types/claudeMd';
import { useAppStore } from '@/stores/appStore';

// ============================================================================
// Animation Constants
// ============================================================================

const TRANSITION_DURATION = '250ms';
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_BASE = `${TRANSITION_DURATION} ${TRANSITION_EASING}`;
const RIGHT_SECTION_DELAY = '150ms';

// ============================================================================
// Helper Functions
// ============================================================================


// ============================================================================
// ClaudeMdCard Component
// ============================================================================

interface ClaudeMdCardProps {
  /** CLAUDE.md file data */
  file: ClaudeMdFile;
  /** Whether to show compact mode (when detail panel is open) */
  compact?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Delete handler */
  onDelete?: () => void;
}

/**
 * ClaudeMdCard Component
 *
 * Displays a CLAUDE.md file card in the list view.
 *
 * Design specs (from P3AWE):
 * - Width: fill_container
 * - Border radius: 8px
 * - Border: 1px solid #E5E5E5
 * - Padding: 16px 20px
 * - Gap: 14px
 * - Background: white
 *
 * Layout:
 * - Icon Container: 40x40, layout none (for badge positioning)
 *   - Icon Wrap: 40x40, bg #FAFAFA, cornerRadius 8px, icon 20x20 (#52525B)
 *   - Badge: 16x16, cornerRadius 8px (circle), 2px white border, position x=28, y=-4
 * - Info: name (13px, #18181B, 500) + path (12px, #71717A), gap 3px
 * - Tags: category + tags
 * - Actions: 28x28, ellipsis icon
 */
export const ClaudeMdCard: React.FC<ClaudeMdCardProps> = ({
  file,
  compact = false,
  onClick,
  onDelete,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const { tags: appTags } = useAppStore();

  // Get tag names from tag IDs
  const tagNames = file.tagIds
    .map((tagId) => appTags.find((t) => t.id === tagId)?.name)
    .filter(Boolean) as string[];

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.();
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Right section transition: immediate hide, delayed show
  const rightSectionStyle = {
    opacity: compact ? 0 : 1,
    maxWidth: compact ? 0 : '400px',
    overflow: 'hidden' as const,
    transition: compact
      ? `opacity ${TRANSITION_BASE}, max-width ${TRANSITION_BASE}`
      : `opacity ${TRANSITION_BASE} ${RIGHT_SECTION_DELAY}, max-width ${TRANSITION_BASE} ${RIGHT_SECTION_DELAY}`,
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-[14px]
        rounded-lg
        border
        border-[#E5E5E5]
        px-5 py-4
        bg-white
        ${onClick ? 'cursor-pointer hover:bg-[#FAFAFA]' : ''}
      `}
      style={{
        transition: `background-color ${TRANSITION_BASE}`,
      }}
    >
      {/* Icon Container - 40x40, layout none for badge positioning */}
      <div className="relative h-10 w-10 flex-shrink-0">
        {/* Icon Wrap - 40x40, bg #FAFAFA, cornerRadius 8px */}
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FAFAFA]">
          <FileText className="h-5 w-5 text-[#52525B]" />
        </div>
        {/* Badge - positioned at top-right, x=28 (right -4px), y=-4 (top -4px) */}
        {/* If file is set as global, show global badge regardless of sourceType */}
        <div className="absolute -right-1 -top-1">
          <ClaudeMdBadge type={file.isGlobal ? 'global' : file.sourceType} />
        </div>
      </div>

      {/* Info - flex-1, gap 3px */}
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        {/* Name - 13px, #18181B, font-medium (500) */}
        <span className="text-[13px] font-medium text-[#18181B] truncate">
          {file.name}
        </span>
        {/* Path - 12px, #71717A, font-normal */}
        <span className="text-xs font-normal text-[#71717A] truncate">
          {file.sourcePath}
        </span>
      </div>

      {/* Tags Section (hidden in compact mode) */}
      <div
        className="flex items-center gap-[6px] shrink-0"
        style={rightSectionStyle}
      >
        {tagNames.length > 0 && <TagsWithTooltip tags={tagNames} />}
      </div>

      {/* Actions Button - 28x28, ellipsis icon */}
      <div ref={menuRef} className="shrink-0 relative">
        <button
          onClick={handleMoreClick}
          className="flex h-7 w-7 items-center justify-center rounded hover:bg-[#F4F4F5] transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal className="h-4 w-4 text-[#A1A1AA]" />
        </button>

        {/* Dropdown Menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg border border-[#E5E5E5] shadow-lg z-50 py-1">
            <button
              onClick={handleDelete}
              disabled={file.isGlobal}
              className={`
                w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors
                ${
                  file.isGlobal
                    ? 'text-[#A1A1AA] cursor-not-allowed'
                    : 'text-[#DC2626] hover:bg-[#FEF2F2]'
                }
              `}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClaudeMdCard;
