import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Category } from '@/types';
import { CategoryRowContent } from './CategoryRowContent';

/**
 * Sortable wrapper around a category row. Lives inside `SortableContext`
 * (set by `SortableCategoriesList`). When a drag is active for this row,
 * the inline DOM goes to `opacity: 0` to make space for the let-pass
 * cascade — the visible drag clone is rendered by `DragOverlay`
 * (`DragOverlayCategoryRow`).
 *
 * @see `02_design_spec.md` V3 §2.1 (lift two-stage), §2.4 (cascade)
 * @see `03_tech_plan.md` V3 §8 (implementation reference)
 */
interface SortableCategoryRowProps {
  category: Category;
  isActive: boolean;
  isEditing: boolean;
  /**
   * True for the single frame after this row was just dropped. Suppresses
   * the click navigation that would otherwise fire from the synthetic
   * mouseup at drop position. Cleared by parent ~50ms later.
   * See `02_design_spec.md` V3 §2.9.
   */
  justDropped: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onColorChange: (color: string) => void;
}

export function SortableCategoryRow({
  category,
  isActive,
  isEditing,
  justDropped,
  onClick,
  onDoubleClick,
  onContextMenu,
  onColorChange,
}: SortableCategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
    // Editing-mode rows must not be draggable (defence-in-depth — the parent
    // SortableContext is also disabled when any row is being edited).
    disabled: isEditing,
    // 220ms cascade matches `--duration-drag-reorder` in tokens; easing
    // mirrors `--ease-drag` (`cubic-bezier(0.16, 1, 0.3, 1)`).
    transition: {
      duration: 220,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  });

  const style: CSSProperties = {
    // CSS.Translate.toString — emits only `translate3d(x, y, 0)`, no scale.
    // We must NOT use CSS.Transform.toString because dnd-kit's default
    // Transform includes scaleX/scaleY which would squeeze the row when
    // neighbours' measured rects differ (V3 explicitly forbids this).
    transform: CSS.Translate.toString(transform),
    transition,
    // V3 spec §2.1: the inline DOM "disappears to make space" — the visible
    // dragged clone is the DragOverlay. Using opacity 0 (not 0.4) keeps the
    // cascade visually clean. Pointer events stay live so dnd-kit can still
    // receive over/end events on the source slot if the drag returns.
    opacity: isDragging ? 0 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Drop fires a synthetic click on mouseup that we must swallow when the
    // pointer ends back on the source row. The 50ms guard window in the
    // parent covers the React render after onDragEnd.
    if (justDropped) {
      e.preventDefault();
      return;
    }
    onClick();
  };

  // V3 P0-2 fix: do NOT shadow dnd-kit's KeyboardSensor onKeyDown.
  // The sensor (configured with sortableKeyboardCoordinates in the parent
  // List) needs Space/Enter to lift the row for keyboard reorder. We chain:
  // run dnd-kit's listener first; only navigate on Space/Enter if it didn't
  // pre-empt the event (e.g., when keyboard drag is not active).
  const dndKeyDown = listeners?.onKeyDown as ((e: React.KeyboardEvent) => void) | undefined;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    dndKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  // Spread listeners but override onKeyDown with our chained handler, so
  // dnd-kit's other listeners (onPointerDown etc.) still apply.
  const { onKeyDown: _dndOnKeyDown, ...listenersWithoutKeyDown } =
    listeners ?? ({} as Record<string, unknown>);
  void _dndOnKeyDown;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listenersWithoutKeyDown}
      // className must mirror Sidebar.tsx:295-308 exactly so the migration
      // is visually a no-op outside drag interactions. cursor (default vs
      // grabbing) is handled in CSS via [aria-roledescription='sortable'].
      className={`
        h-8 px-2.5 flex items-center gap-2.5 rounded-[6px] cursor-pointer
        transition-colors duration-150
        ${isActive ? 'bg-[#F4F4F5]' : 'hover:bg-[#F4F4F5]'}
      `}
      onClick={handleClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <CategoryRowContent
        category={category}
        showCount
        isActive={isActive}
        onColorChange={onColorChange}
      />
    </div>
  );
}

export default SortableCategoryRow;
