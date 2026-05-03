import type { Tag } from '@/types';

/**
 * Shared inner content of a tag pill — used by both the inline sortable pill
 * (`SortableTagPill`) and the floating drag clone (`DragOverlayTagPill`).
 *
 * Renders the tag name only. The pill shape (padding / border / background /
 * radius / text color) is provided entirely by the parent container, so this
 * component does not re-style the text — `color` cascades from the parent
 * button/div. This mirrors the pattern of `CategoryRowContent`.
 *
 * The `isActive` prop is accepted but not used for styling here; it is part
 * of the shared API so callers can hand the same data to both the in-place
 * pill and the DragOverlay clone without branching their props shape.
 *
 * @see `02_design_spec.md` V3 §2.2 (DragOverlay keeps pill shape)
 * @see `03_tech_plan.md` V3 §8 (component split — parallels CategoryRowContent)
 */
interface TagPillContentProps {
  tag: Tag;
  /** Currently unused for styling; reserved for future active-state visuals. */
  isActive?: boolean;
}

export function TagPillContent({ tag }: TagPillContentProps) {
  return <>{tag.name}</>;
}

export default TagPillContent;
