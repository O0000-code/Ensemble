import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * EmptyState Component
 *
 * Displays a centered empty state with icon, title, optional description and action.
 * Used when there's no content to display (e.g., empty lists, no search results).
 *
 * Design specs:
 * - Container: flex column, centered, padding 48px
 * - Icon container: 32x32, color #D4D4D8
 * - Title: margin-top 16px, 14px/500, #71717A
 * - Description: margin-top 8px, 13px/normal, #D4D4D8, max-width 280px
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12">
      {/* Icon Container - 32x32, centered */}
      <div className="w-8 h-8 flex items-center justify-center text-[#D4D4D8]">
        {icon}
      </div>

      {/* Title */}
      <h3 className="mt-4 text-sm font-medium text-[#71717A]">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="mt-2 text-[13px] font-normal text-[#D4D4D8] max-w-[280px]">
          {description}
        </p>
      )}

      {/* Optional Action Button */}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
