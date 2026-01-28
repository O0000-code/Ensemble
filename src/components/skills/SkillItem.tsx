import React from 'react';
import {
  Code,
  Github,
  BookOpen,
  Smartphone,
  Palette,
  Server,
  Database,
  Sparkles,
  FileCode,
  GitPullRequest,
  TestTube,
  Layers,
  Wand2,
} from 'lucide-react';
import type { Skill } from '../../types';
import Toggle from '../common/Toggle';
import Badge from '../common/Badge';

// ============================================================================
// Types
// ============================================================================

export interface SkillItemProps {
  skill: Skill;
  variant?: 'full' | 'compact';
  selected?: boolean;
  onClick?: () => void;
  onToggle?: (enabled: boolean) => void;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const skillIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'frontend-development': Code,
  'github-explorer': Github,
  'swiftui-expert': Smartphone,
  'api-design': Server,
  'unit-testing': TestTube,
  'ui-design-review': Palette,
  'algorithmic-art': Wand2,
  'color-system': Palette,
  'literature-review': BookOpen,
  'data-analysis': Database,
  'commit-guidelines': GitPullRequest,
  'pr-review': FileCode,
  'custom-template': Layers,
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  development: Code,
  design: Palette,
  research: BookOpen,
  productivity: Sparkles,
  other: Layers,
};

function getSkillIcon(skill: Skill): React.ComponentType<{ className?: string }> {
  // Try to match by skill ID (converted to kebab-case)
  const skillKey = skill.name.toLowerCase().replace(/\s+/g, '-');
  if (skillIconMap[skillKey]) {
    return skillIconMap[skillKey];
  }

  // Fall back to category icon
  if (categoryIconMap[skill.category]) {
    return categoryIconMap[skill.category];
  }

  // Default icon
  return Sparkles;
}

// ============================================================================
// Category Color Mapping
// ============================================================================

const categoryColors: Record<string, string> = {
  development: '#18181B',
  design: '#8B5CF6',
  research: '#3B82F6',
  productivity: '#10B981',
  other: '#71717A',
};

// ============================================================================
// SkillItem Component
// ============================================================================

export function SkillItem({
  skill,
  variant = 'full',
  selected = false,
  onClick,
  onToggle,
}: SkillItemProps) {
  const Icon = getSkillIcon(skill);
  const categoryColor = categoryColors[skill.category] || '#71717A';

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleToggleChange = (checked: boolean) => {
    onToggle?.(checked);
  };

  // Full variant - for main list
  if (variant === 'full') {
    return (
      <div
        onClick={onClick}
        className={`
          flex items-center gap-3.5
          rounded-lg border border-[#E5E5E5]
          bg-white
          px-4 py-3.5
          transition-colors
          ${onClick ? 'cursor-pointer hover:bg-[#FAFAFA]' : ''}
        `}
      >
        {/* Icon Container */}
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-[#FAFAFA]">
          <Icon className="h-[18px] w-[18px] text-[#52525B]" />
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
          <span className="text-[13px] font-medium text-[#18181B]">
            {skill.name}
          </span>
          <span className="max-w-[500px] truncate text-xs font-normal text-[#71717A]">
            {skill.description}
          </span>
        </div>

        {/* Tags Container */}
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {/* Category Badge */}
          <Badge variant="category" color={categoryColor}>
            {skill.category.charAt(0).toUpperCase() + skill.category.slice(1)}
          </Badge>

          {/* Tags (max 2) */}
          {skill.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="tag">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Toggle */}
        <div onClick={handleToggleClick} className="flex-shrink-0">
          <Toggle
            checked={skill.enabled}
            onChange={handleToggleChange}
            size="medium"
          />
        </div>
      </div>
    );
  }

  // Compact variant - for side list in detail page
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3
        rounded-md
        px-3.5 py-3
        transition-colors
        ${onClick ? 'cursor-pointer' : ''}
        ${selected ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'}
      `}
    >
      {/* Icon Container */}
      <div
        className={`
          flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md
          ${selected ? 'bg-[#F4F4F5]' : 'bg-[#FAFAFA]'}
        `}
      >
        <Icon
          className={`h-4 w-4 ${selected ? 'text-[#18181B]' : 'text-[#52525B]'}`}
        />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span
          className={`
            text-[13px] text-[#18181B]
            ${selected ? 'font-semibold' : 'font-medium'}
          `}
        >
          {skill.name}
        </span>
        <span className="truncate text-[11px] font-normal text-[#71717A]">
          {skill.description}
        </span>
      </div>

      {/* Toggle */}
      <div onClick={handleToggleClick} className="flex-shrink-0">
        <Toggle
          checked={skill.enabled}
          onChange={handleToggleChange}
          size="small"
        />
      </div>
    </div>
  );
}

export default SkillItem;
