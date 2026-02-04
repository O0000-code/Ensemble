// src/components/claude-md/ClaudeMdCard.tsx

import React, { useRef, useState } from 'react';
import { FileText, MoreHorizontal, Trash2, Eye } from 'lucide-react';
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

/**
 * Format file size for display
 */
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format relative time
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================================================
// ClaudeMdCard Component
// ============================================================================

interface ClaudeMdCardProps {
  /** CLAUDE.md file data */
  file: ClaudeMdFile;
  /** Whether to show compact mode (when detail panel is open) */
  compact?: boolean;
  /** Whether this card is selected */
  selected?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Delete handler */
  onDelete?: () => void;
  /** View button click handler */
  onView?: () => void;
}

/**
 * ClaudeMdCard Component
 *
 * Displays a CLAUDE.md file card in the list view.
 *
 * Design specs:
 * - Width: fill_container
 * - Border radius: 8px
 * - Border: 1px solid #E5E5E5
 * - Padding: 20px
 * - Gap: 16px
 * - Background: white (selected: #FAFAFA)
 *
 * Layout:
 * - File icon: 48x48, bg #F4F4F5, border-radius 8px, icon 24x24
 * - File info: name + badge, path, stats
 * - Right: tags, view button
 */
export const ClaudeMdCard: React.FC<ClaudeMdCardProps> = ({
  file,
  compact = false,
  selected = false,
  onClick,
  onDelete,
  onView,
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

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView?.();
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
        gap-4
        rounded-lg
        border
        border-[#E5E5E5]
        p-5
        ${selected ? 'bg-[#FAFAFA]' : 'bg-white hover:bg-[#FAFAFA]'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={{
        transition: `background-color ${TRANSITION_BASE}`,
      }}
    >
      {/* File Icon Container - 48x48 */}
      <div
        className={`
          flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg
          ${selected ? 'bg-[#F4F4F5]' : 'bg-[#F4F4F5]'}
        `}
        style={{
          transition: `background-color ${TRANSITION_BASE}`,
        }}
      >
        <FileText
          className={`h-6 w-6 ${selected ? 'text-[#18181B]' : 'text-[#71717A]'}`}
          style={{ transition: `color ${TRANSITION_BASE}` }}
        />
      </div>

      {/* File Info - flex-1 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* Title Row - Name + Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`text-sm text-[#18181B] truncate ${
              selected ? 'font-semibold' : 'font-semibold'
            }`}
          >
            {file.name}
          </span>
          <ClaudeMdBadge type={file.sourceType} />
        </div>

        {/* Path Row */}
        <span className="text-xs font-normal text-[#71717A] truncate">
          {file.sourcePath}
        </span>

        {/* Stats Row - File size, Modified time */}
        <div className="flex items-center gap-4">
          <span className="text-xs font-normal text-[#71717A]">
            {formatFileSize(file.size)}
          </span>
          <span className="text-xs font-normal text-[#71717A]">
            Modified {formatRelativeTime(file.updatedAt)}
          </span>
        </div>
      </div>

      {/* Right Section - Tags (hidden in compact mode) */}
      <div
        className="flex items-center gap-2 shrink-0"
        style={rightSectionStyle}
      >
        {tagNames.length > 0 && <TagsWithTooltip tags={tagNames} />}
      </div>

      {/* View Button - 32x32 */}
      <button
        onClick={handleView}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors"
        aria-label="View file"
      >
        <Eye className="h-4 w-4 text-[#71717A]" />
      </button>

      {/* More Menu */}
      <div ref={menuRef} className="shrink-0 relative">
        <button
          onClick={handleMoreClick}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[#F4F4F5] transition-colors"
          aria-label="More actions"
        >
          <MoreHorizontal className="w-4 h-4 text-[#71717A]" />
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
