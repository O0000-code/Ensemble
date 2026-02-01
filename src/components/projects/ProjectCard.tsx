import React from 'react';
import { Folder, MoreHorizontal } from 'lucide-react';
import type { Project, Scene } from '../../types';

// ============================================================================
// Types
// ============================================================================

export interface ProjectCardProps {
  project: Project;
  scene?: Scene;
  onClick: () => void;
  onMoreClick?: (e: React.MouseEvent) => void;
}

// ============================================================================
// ProjectCard Component
// ============================================================================

/**
 * ProjectCard Component
 *
 * Displays a project card in the projects list page.
 *
 * Design specs (from VXJaS - Projects List):
 * - Layout: justify-content: space-between, align-items: center
 * - Size: width fill_container (w-full)
 * - Padding: 16px 20px (py-4 px-5)
 * - Border: 1px solid #E5E5E5
 * - Corner Radius: 8px
 * - Hover: bg #FAFAFA
 *
 * Left Section (gap: 14):
 * - Icon Wrap: 40x40, rounded-lg, bg #FAFAFA
 * - Icon: folder, 20x20, #52525B
 * - Info: name (14px, font-medium, #18181B) + path (12px, #71717A)
 *
 * Right Section (gap: 24):
 * - Meta Info: Scene label/value (11px, gap: 6)
 * - Status Badge: "Configured" if project has scene
 * - Action Button: 28x28, MoreHorizontal icon
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  scene,
  onClick,
  onMoreClick,
}) => {
  // Format path for display (show truncated version)
  const formatPath = (path: string) => {
    const segments = path.split('/').filter(Boolean);
    if (segments.length <= 3) return path;
    return '~/' + segments.slice(-2).join('/');
  };

  // Check if project is configured (has an assigned scene)
  const isConfigured = !!scene;

  return (
    <div
      onClick={onClick}
      className="
        flex
        w-full
        cursor-pointer
        items-center
        justify-between
        rounded-lg
        border
        border-[#E5E5E5]
        bg-white
        px-5
        py-4
        transition-colors
        hover:bg-[#FAFAFA]
      "
    >
      {/* Left Section */}
      <div className="flex items-center gap-3.5">
        {/* Icon Wrap */}
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#FAFAFA]">
          <Folder className="h-5 w-5 text-[#52525B]" />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#18181B]">
            {project.name}
          </span>
          <span className="text-xs font-normal text-[#71717A]">
            {formatPath(project.path)}
          </span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        {/* Meta Info - Scene */}
        {scene && (
          <div className="flex items-center gap-5">
            <div className="flex flex-col items-end gap-1.5">
              <span className="text-[11px] font-medium text-[#A1A1AA]">Scene</span>
              <span className="text-[11px] font-semibold text-[#52525B]">
                {scene.name}
              </span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {isConfigured && (
          <span className="rounded px-2.5 py-1 text-[10px] font-semibold text-[#16A34A] bg-[#DCFCE7]">
            Configured
          </span>
        )}

        {/* Action Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoreClick?.(e);
          }}
          className="flex h-7 w-7 items-center justify-center rounded transition-colors hover:bg-[#F4F4F5]"
        >
          <MoreHorizontal className="h-4 w-4 text-[#A1A1AA]" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
