import { Badge } from './Badge';
import { Tooltip } from './Tooltip';

export interface TagsWithTooltipProps {
  /** Tag list */
  tags: string[];
  /** Maximum visible tags count, default 3 */
  maxVisible?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TagsWithTooltip component for displaying tags with ellipsis and tooltip.
 *
 * Display logic:
 * 1. If tags.length <= maxVisible: display all tags
 * 2. If tags.length > maxVisible:
 *    - Display first maxVisible tags
 *    - Show +{remainingCount} Badge at the last position
 *    - Hover on +{n} Badge shows Tooltip listing remaining tags
 *
 * Default: maxVisible = 2, so with 3+ tags shows [tag1] [tag2] [+n]
 */
export function TagsWithTooltip({
  tags,
  maxVisible = 2,
  className,
}: TagsWithTooltipProps) {
  // If no tags, render nothing
  if (!tags || tags.length === 0) {
    return null;
  }

  // Calculate visible tags and remaining tags
  const visibleTags = tags.slice(0, maxVisible);
  const remainingTags = tags.slice(maxVisible);
  const hasMore = remainingTags.length > 0;

  // Tooltip content: display remaining tags horizontally with separator
  const tooltipContent = (
    <span>
      {remainingTags.join(' · ')}
    </span>
  );

  return (
    <div className={`flex items-center gap-1.5 ${className || ''}`}>
      {/* Display visible tags */}
      {visibleTags.map((tag) => (
        <Badge key={tag} variant="tag">
          {tag}
        </Badge>
      ))}

      {/* If there are more tags, show +n Badge with Tooltip */}
      {hasMore && (
        <Tooltip content={tooltipContent}>
          <span className="inline-flex">
            <Badge variant="tag">
              +{remainingTags.length}
            </Badge>
          </span>
        </Tooltip>
      )}
    </div>
  );
}

export default TagsWithTooltip;
