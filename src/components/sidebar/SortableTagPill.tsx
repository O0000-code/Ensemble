import type { CSSProperties, MouseEvent as ReactMouseEvent } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Tag } from '@/types';
import { TagPillContent } from './TagPillContent';

/**
 * Sortable tag pill for the Sidebar Tags section. Mirrors `SortableCategoryRow`
 * but uses pill-shaped styling and is intended to live inside a
 * `rectSortingStrategy` SortableContext (Tags wrap to multiple rows).
 *
 * Behavior:
 * - useSortable transition pinned to 220ms with the project's `--ease-drag`
 *   curve (cubic-bezier(0.16, 1, 0.3, 1)) — see `02_design_spec.md` V3 §2.4.
 * - When dragging, the in-place pill goes to `opacity: 0` (V3 — let cascade
 *   fill the gap; the DragOverlay carries the visual). See `03_tech_plan.md`
 *   V3 §8.
 * - `disabled: isEditing` keeps the pill non-draggable while the inline edit
 *   input is open (a second safety net on top of the list-level
 *   `SortableContext.disabled`). See V3 §2.9.
 * - `justDropped` blocks the click that fires on mouseup-after-drop, so
 *   re-ordering a tag doesn't accidentally navigate / toggle the active
 *   filter. See V3 §2.9 / V3 §8.
 *
 * Container sizing / colors strictly reuse the existing pill button
 * className from `Sidebar.tsx:448-455` so the in-place pill is visually
 * identical to today's pill.
 *
 * @see `02_design_spec.md` V3 §2.1 (lift target — Tags scale 1.05)
 * @see `02_design_spec.md` V3 §2.8 (cursor: do NOT add cursor on the pill)
 */
interface SortableTagPillProps {
  tag: Tag;
  isActive: boolean;
  isEditing: boolean;
  justDropped: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: ReactMouseEvent) => void;
}

export function SortableTagPill({
  tag,
  isActive,
  isEditing,
  justDropped,
  onClick,
  onDoubleClick,
  onContextMenu,
}: SortableTagPillProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tag.id,
    disabled: isEditing,
    transition: {
      duration: 220,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  });

  const style: CSSProperties = {
    // CSS.Translate (NOT CSS.Transform): we only translate during sortable
    // cascade — no scale/rotate. Using Transform would inject scale(1) into
    // the matrix and interact poorly with the in-place pill's intrinsic
    // hover transitions.
    transform: CSS.Translate.toString(transform),
    transition,
    // V3 §2.1: in-place pill becomes invisible the moment the drag activates;
    // the DragOverlay carries the visual from then on.
    opacity: isDragging ? 0 : 1,
  };

  const handleClick = (e: ReactMouseEvent) => {
    if (justDropped) {
      // Mouseup-after-drop fires a click on the original element. Suppress
      // it so the user's drag doesn't accidentally toggle the active tag.
      e.preventDefault();
      return;
    }
    onClick();
  };

  // V3 P1-3 fix: native <button> Space/Enter activation competes with
  // dnd-kit's KeyboardSensor lift. Chain dnd-kit's onKeyDown first; only
  // navigate on Space/Enter when the sensor didn't pre-empt.
  const dndKeyDown = listeners?.onKeyDown as ((e: React.KeyboardEvent) => void) | undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    dndKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  const { onKeyDown: _dndOnKeyDown, ...listenersWithoutKeyDown } =
    listeners ?? ({} as Record<string, unknown>);
  void _dndOnKeyDown;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listenersWithoutKeyDown}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onKeyDown={handleKeyDown}
      className={`
        inline-flex items-center px-2.5 py-[5px] rounded text-[11px] font-medium
        transition-colors duration-150
        ${
          isActive
            ? 'bg-[#18181B] text-white border-transparent'
            : 'bg-transparent text-[#52525B] border border-[#E5E5E5] hover:bg-[#F4F4F5]'
        }
      `}
    >
      <TagPillContent tag={tag} isActive={isActive} />
    </div>
  );
}

export default SortableTagPill;
