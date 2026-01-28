import { FolderPlus } from 'lucide-react';
import type { Project, Scene } from '../../types';

// ============================================================================
// ProjectItem Component
// ============================================================================
// Used in: Projects list panel
// Design reference: 06-projects-design.md Section 2.1

export interface ProjectItemProps {
  project: Project;
  scene?: Scene;
  selected?: boolean;
  onClick?: () => void;
}

/**
 * ProjectItem displays a single project in the list.
 *
 * Layout:
 * - Container: padding 12px 14px, radius 6px
 * - Left: Project name + path (truncated)
 * - Right: Scene badge (if scene is associated)
 *
 * States:
 * - Default: transparent background
 * - Hover: bg #FAFAFA
 * - Selected: bg #FAFAFA
 */
export function ProjectItem({
  project,
  scene,
  selected = false,
  onClick,
}: ProjectItemProps) {
  // Format path for display (show last 2-3 segments)
  const formatPath = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 3) return path;
    return '~/' + segments.slice(-2).join('/');
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex w-full items-center justify-between
        rounded-md px-3.5 py-3
        text-left
        transition-colors duration-150
        ${selected ? 'bg-[#FAFAFA]' : 'hover:bg-[#FAFAFA]'}
      `}
    >
      {/* Left Content: Name + Path */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium text-[#18181B]">
          {project.name}
        </span>
        <span className="truncate text-[11px] font-normal text-[#71717A]">
          {formatPath(project.path)}
        </span>
      </div>

      {/* Right Content: Scene Badge */}
      {scene ? (
        <span
          className={`
            ml-3 flex-shrink-0 rounded-[3px] px-2 py-[3px]
            text-[10px] font-medium
            ${selected
              ? 'bg-[#F4F4F5] text-[#18181B]'
              : 'bg-[#FAFAFA] text-[#71717A]'
            }
          `}
        >
          {scene.name}
        </span>
      ) : (
        <span className="ml-3 flex-shrink-0 rounded-[3px] bg-[#FAFAFA] px-2 py-[3px] text-[10px] font-normal text-[#A1A1AA]">
          No Scene
        </span>
      )}
    </button>
  );
}

// ============================================================================
// NewProjectItem Component
// ============================================================================
// Used when creating a new project (shown at top of list)

export interface NewProjectItemProps {
  name?: string;
  path?: string;
  onClick?: () => void;
}

/**
 * NewProjectItem displays the placeholder for a new project being created.
 *
 * Styles:
 * - bg #FAFAFA
 * - border 2px solid #18181B (highlight)
 * - FolderPlus icon on right
 */
export function NewProjectItem({
  name = 'New Project',
  path = 'Click to configure path...',
  onClick,
}: NewProjectItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex w-full items-center justify-between
        rounded-md border-2 border-[#18181B] bg-[#FAFAFA]
        px-3.5 py-3
        text-left
        transition-colors duration-150
      "
    >
      {/* Left Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-[13px] font-medium text-[#18181B]">
          {name || 'New Project'}
        </span>
        <span className="truncate text-[11px] font-normal text-[#71717A]">
          {path || 'Click to configure path...'}
        </span>
      </div>

      {/* Right Icon */}
      <FolderPlus className="ml-3 h-[18px] w-[18px] flex-shrink-0 text-[#71717A]" />
    </button>
  );
}

export default ProjectItem;
