import React, { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import Toggle from '../common/Toggle';
import Badge from '../common/Badge';
import { ICON_MAP } from '@/components/common';
import { Skill } from '@/types';

// ============================================================================
// Animation Constants
// ============================================================================

const TRANSITION_DURATION = '250ms';
const TRANSITION_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
const TRANSITION_BASE = `${TRANSITION_DURATION} ${TRANSITION_EASING}`;
// Delay for right section to appear when expanding (closing detail panel)
const RIGHT_SECTION_DELAY = '150ms';

// ============================================================================
// Icon & Color Helpers
// ============================================================================

const getSkillIcon = (skill: Skill): React.ElementType => {
  if (skill.icon && ICON_MAP[skill.icon]) {
    return ICON_MAP[skill.icon];
  }
  return Sparkles;
};

const categoryColors: Record<string, string> = {
  development: '#18181B',
  design: '#8B5CF6',
  research: '#3B82F6',
  productivity: '#10B981',
  other: '#71717A',
};

// ============================================================================
// SkillListItem Component
// ============================================================================

interface SkillListItemProps {
  skill: Skill;
  compact?: boolean;
  selected?: boolean;
  onClick?: () => void;
  onToggle?: (enabled: boolean) => void;
  onIconClick?: (triggerRef: React.RefObject<HTMLDivElement>) => void;
}

/**
 * Unified Skill list item with smooth transition between full and compact modes.
 *
 * Full mode (compact=false): Shows category badge and tags
 * Compact mode (compact=true): Shows only icon, name, description, toggle
 *
 * Key animation behavior:
 * - When collapsing (full → compact): right section fades out immediately
 * - When expanding (compact → full): right section fades in with delay
 *   to prevent layout shift while list width is still animating
 */
export const SkillListItem: React.FC<SkillListItemProps> = ({
  skill,
  compact = false,
  selected = false,
  onClick,
  onToggle,
  onIconClick,
}) => {
  const iconRef = useRef<HTMLDivElement>(null);
  const IconComponent = getSkillIcon(skill);
  const categoryColor = categoryColors[skill.category] || '#71717A';

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleChange = (checked: boolean) => {
    onToggle?.(checked);
  };

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
        justify-between
        rounded-lg
        border
        border-[#E5E5E5]
        px-5
        py-4
        ${selected ? 'bg-[#FAFAFA]' : 'bg-white hover:bg-[#FAFAFA]'}
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={{
        transition: `background-color ${TRANSITION_BASE}`,
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {/* Icon Container */}
        <div
          ref={iconRef}
          onClick={(e) => {
            e.stopPropagation();
            onIconClick?.(iconRef as React.RefObject<HTMLDivElement>);
          }}
          className={`
            flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
            ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
            ${onIconClick ? 'cursor-pointer hover:ring-2 hover:ring-[#18181B]/10' : ''}
          `}
          style={{
            transition: `background-color ${TRANSITION_BASE}, box-shadow ${TRANSITION_BASE}`,
          }}
        >
          <IconComponent
            className={`h-5 w-5 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`}
            style={{ transition: `color ${TRANSITION_BASE}` }}
          />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span
            className={`text-sm text-[#18181B] truncate ${selected ? 'font-semibold' : 'font-medium'}`}
            style={{ transition: `font-weight ${TRANSITION_BASE}` }}
          >
            {skill.name}
          </span>
          <span className="text-xs font-normal text-[#71717A] truncate max-w-[500px]">
            {skill.description}
          </span>
        </div>
      </div>

      {/* Right Section - Category & Tags (hidden in compact mode with delay on show) */}
      <div
        className="flex items-center gap-1.5 shrink-0"
        style={rightSectionStyle}
      >
        {/* Category Badge */}
        <Badge variant="category" color={categoryColor}>
          {skill.category ? skill.category.charAt(0).toUpperCase() + skill.category.slice(1) : 'Uncategorized'}
        </Badge>

        {/* Tags (max 2) */}
        {skill.tags.slice(0, 2).map((tag) => (
          <Badge key={tag} variant="tag">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Toggle - Always visible */}
      <div
        onClick={handleToggleClick}
        className="shrink-0 ml-4"
      >
        <Toggle
          checked={skill.enabled}
          onChange={handleToggleChange}
          size="medium"
        />
      </div>
    </div>
  );
};

export default SkillListItem;
