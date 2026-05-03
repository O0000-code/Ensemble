import type { Tag } from '@/types';
import { TagPillContent } from './TagPillContent';

/**
 * Floating clone of a tag pill rendered inside the dnd-kit `<DragOverlay>`
 * portal during a drag gesture. Lives outside the SortableContext, so it
 * has no `useSortable` and no transform — dnd-kit positions the overlay
 * itself by following the pointer.
 *
 * Visuals (per `02_design_spec.md` V3 §2.2):
 * - Same pill geometry as the in-place pill (`px-2.5 py-[5px]` / `text-[11px]`
 *   / `font-medium`) so the lift transition (in-place pill fades out, overlay
 *   fades in) reads as the same element.
 * - Background follows active vs default — active uses `#18181B` (dark),
 *   default uses `#FAFAFA` (NOT transparent like the in-place pill, since the
 *   overlay needs a visible surface to read as a floating chip).
 * - The `drag-overlay-pill` utility class (defined in `index.css`, see
 *   `03_tech_plan.md` V3 §10) provides the multi-layer hsl shadow,
 *   border-radius, and `cursor: grabbing`.
 *
 * @see `02_design_spec.md` V3 §2.2 (DragOverlay spec for Tags)
 * @see `03_tech_plan.md` V3 §10 (.drag-overlay-pill CSS class)
 */
interface DragOverlayTagPillProps {
  tag: Tag;
  /** Active state controls background + text color, matching the in-place pill. */
  isActive?: boolean;
}

export function DragOverlayTagPill({ tag, isActive = false }: DragOverlayTagPillProps) {
  return (
    <div
      className={`
        drag-overlay-pill px-2.5 py-[5px] text-[11px] font-medium
        ${isActive ? 'bg-[#18181B] text-white' : 'bg-[#FAFAFA] text-[#52525B]'}
      `}
    >
      <TagPillContent tag={tag} isActive={isActive} />
    </div>
  );
}

export default DragOverlayTagPill;
