import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DropAnimation } from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Category } from '@/types';
import { CategoryInlineInput } from './CategoryInlineInput';
import { SortableCategoryRow } from './SortableCategoryRow';
import { DragOverlayCategoryRow } from './DragOverlayCategoryRow';
import { CustomMouseSensor } from './dnd/CustomMouseSensor';
import { snapModifier } from './dnd/snapModifier';
import { makeAnnouncements, sidebarScreenReaderInstructions } from './dnd/announcements';
import { CATEGORY_DROP_ANIMATION } from './dnd/animations';

/**
 * 1D vertical drag-and-drop list container for the sidebar's Categories
 * section. Wraps the existing visible/showAll/inline-edit/inline-add row
 * rendering with a `<DndContext>` + `<SortableContext>` and a `<DragOverlay>`.
 *
 * Design / architecture references (V3 — must match exactly):
 * - `02_design_spec.md` V3 §2.4 (cascade), §2.5 (snap), §2.6 (distance-aware
 *   settle), §2.10 ("Show X more" auto-expand on drag start), §2.11 (data
 *   feedback)
 * - `03_tech_plan.md` V3 §7 (DndContext template, modifiers placement),
 *   §11 (snapModifier), §12 (announcements)
 * - `04_implementation_plan.md` V3 §2 T8
 *
 * Key V3 invariants (do not regress):
 * - `<DndContext modifiers={[snapModifier]}>` — snap only; the strategy
 *   (`verticalListSortingStrategy`) naturally constrains let-pass direction
 *   to the Y axis. We must NOT add `restrictToVerticalAxis` here, which
 *   in V2 caused the DragOverlay to clamp to X=0 (the "stuck on left edge"
 *   P0 bug).
 * - `<DragOverlay modifiers={[restrictToWindowEdges]}>` — only prevents
 *   the floating clone from leaving the window; pointer follow stays free.
 * - `SortableContext.items` only contains category ids — the
 *   `CategoryInlineInput` and the "Show X more" button are rendered inside
 *   the context but excluded from `items`, so dnd-kit does not treat them
 *   as sortables.
 * - `SortableContext.disabled` flips to `true` whenever any add/edit input
 *   is mounted, killing drag activation while inline editing is in flight
 *   (defence-in-depth against the input-eats-drag class of bugs). The
 *   inline input is also wrapped with `data-no-dnd="true"` as a second net.
 */
interface SortableCategoriesListProps {
  categories: Category[];
  activeCategoryId: string | null;
  editingCategoryId: string | null;
  isAddingCategory: boolean;
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  /** Threshold above which the "Show X more" collapse UI appears. */
  maxVisible: number;
  onReorder: (orderedIds: string[]) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onCategoryClick: (categoryId: string) => void;
  onCategoryDoubleClick: (categoryId: string) => void;
  onCategoryContextMenu: (category: Category, e: React.MouseEvent) => void;
  onCategoryColorChange: (categoryId: string, color: string) => void;
  onCategorySave: (id: string | null, name: string) => void;
  onCategoryEditCancel: () => void;
}

export function SortableCategoriesList({
  categories,
  activeCategoryId,
  editingCategoryId,
  isAddingCategory,
  showAll,
  setShowAll,
  maxVisible,
  onReorder,
  onDragStart,
  onDragEnd,
  onCategoryClick,
  onCategoryDoubleClick,
  onCategoryContextMenu,
  onCategoryColorChange,
  onCategorySave,
  onCategoryEditCancel,
}: SortableCategoriesListProps) {
  // The id of the row currently being dragged — drives DragOverlay rendering.
  const [activeId, setActiveId] = useState<string | null>(null);
  // Brief window after drop in which the source row swallows the synthetic
  // click — prevents accidental nav after a drag that ends on the source.
  const [justDroppedId, setJustDroppedId] = useState<string | null>(null);
  // Distance-aware drop animation per V3 §2.6: starts at the cascade-matched
  // base (220ms) but is recomputed on each drag end based on travel distance.
  // `null` means "skip drop animation" (used when snap has already aligned).
  const [dropAnimationConfig, setDropAnimationConfig] = useState<DropAnimation | null>(
    CATEGORY_DROP_ANIMATION,
  );

  const activeCategory =
    activeId !== null ? (categories.find((c) => c.id === activeId) ?? null) : null;

  // 4px activation distance keeps single-click navigation working — see
  // `02_design_spec.md` V3 §2.1 ("activation gesture") and §2.9.
  const sensors = useSensors(
    useSensor(CustomMouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Whether *any* inline input is mounted — when true, the entire
  // SortableContext is disabled so editing/adding is never interrupted by
  // an accidental drag activation (V3 spec §2.9: "edit/add 态时整个
  // SortableContext 设 disabled 而非单 row 禁用").
  const isInputMounted = isAddingCategory || editingCategoryId !== null;

  const visibleCategories = showAll ? categories : categories.slice(0, maxVisible);
  const remainingCount = categories.length - maxVisible;

  const handleDragStart = (event: DragStartEvent) => {
    // Auto-expand the collapsed list on drag start so the user can target
    // any row, not only the visible 9 (V3 §2.10).
    if (!showAll && categories.length > maxVisible) {
      setShowAll(true);
    }
    setActiveId(String(event.active.id));
    onDragStart();
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // V3 §2.6: compute distance between the dragged element's translated
    // center and the drop slot's center. Skip drop animation entirely if
    // snap has already aligned us within 4px; otherwise scale duration
    // linearly with distance, capped at 280ms.
    if (active.rect.current.translated && over) {
      const a = active.rect.current.translated;
      const o = over.rect;
      const dx = o.left + o.width / 2 - (a.left + a.width / 2);
      const dy = o.top + o.height / 2 - (a.top + a.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);
      setDropAnimationConfig(
        dist < 4
          ? null
          : {
              duration: Math.min(280, 120 + dist * 0.5),
              easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
            },
      );
    }

    setActiveId(null);
    onDragEnd();

    if (over && active.id !== over.id) {
      const oldIdx = categories.findIndex((c) => c.id === active.id);
      const newIdx = categories.findIndex((c) => c.id === over.id);
      if (oldIdx !== -1 && newIdx !== -1) {
        onReorder(arrayMove(categories, oldIdx, newIdx).map((c) => c.id));
      }
    }

    // 50ms guard window — covers the React render after onDragEnd plus the
    // synthetic click that fires on mouseup. SortableCategoryRow checks this
    // and short-circuits its onClick during the window.
    const droppedId = String(active.id);
    setJustDroppedId(droppedId);
    setTimeout(() => setJustDroppedId(null), 50);
  };

  const handleDragCancel = () => {
    setActiveId(null);
    // V3 P2-3: reset dropAnimationConfig so the next drag starts with the
    // default animation (otherwise a previous distance-aware `null` would
    // leak into the next drop).
    setDropAnimationConfig(CATEGORY_DROP_ANIMATION);
    onDragEnd();
  };

  // Empty-state fallback — mirrors Sidebar.tsx:380-392 verbatim. Kept outside
  // the DndContext because there is nothing to sort (no items, no overlay).
  if (categories.length === 0) {
    return (
      <div className="flex flex-col gap-0.5">
        {isAddingCategory ? (
          <div data-no-dnd="true">
            <CategoryInlineInput
              mode="add"
              onSave={(name) => onCategorySave(null, name)}
              onCancel={() => onCategoryEditCancel()}
            />
          </div>
        ) : (
          <p className="text-xs text-[#A1A1AA] px-2.5">No categories</p>
        )}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      // V3 §7 NEW-P0-1: snap-only here. The DragOverlay declares its own
      // restrictToWindowEdges below; do NOT put restrictToVerticalAxis here.
      modifiers={[snapModifier]}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      accessibility={{
        announcements: makeAnnouncements(categories, 'category'),
        screenReaderInstructions: sidebarScreenReaderInstructions,
      }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext
        // Only category ids participate in sorting. The inline input and the
        // "Show X more" button are siblings inside the same DOM container but
        // excluded from `items`, so dnd-kit does not treat them as sortables.
        items={categories.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
        disabled={isInputMounted}
      >
        <div data-sortable-list className="flex flex-col gap-0.5">
          {visibleCategories.map((category) => {
            const isEditing = editingCategoryId === category.id;

            // Inline edit takes over the slot — render the input in place of
            // the sortable row. The wrapping `data-no-dnd="true"` is
            // defence-in-depth (the parent SortableContext is also disabled
            // whenever editingCategoryId !== null).
            if (isEditing) {
              return (
                <div key={category.id} data-no-dnd="true">
                  <CategoryInlineInput
                    mode="edit"
                    category={category}
                    onSave={(name) => onCategorySave(category.id, name)}
                    onCancel={() => onCategoryEditCancel()}
                  />
                </div>
              );
            }

            return (
              <SortableCategoryRow
                key={category.id}
                category={category}
                isActive={activeCategoryId === category.id}
                isEditing={false}
                justDropped={justDroppedId === category.id}
                onClick={() => onCategoryClick(category.id)}
                onDoubleClick={() => onCategoryDoubleClick(category.id)}
                onContextMenu={(e) => onCategoryContextMenu(category, e)}
                onColorChange={(color) => onCategoryColorChange(category.id, color)}
              />
            );
          })}

          {/* Add input appended at end of the visible list — wrapped in a
              data-no-dnd container so the focused input can't be hijacked by
              an accidental drag activation. */}
          {isAddingCategory && (
            <div data-no-dnd="true">
              <CategoryInlineInput
                mode="add"
                onSave={(name) => onCategorySave(null, name)}
                onCancel={() => onCategoryEditCancel()}
              />
            </div>
          )}

          {/* "Show X more" / "Show less" — sibling to sortable rows but NOT in
              SortableContext.items. data-no-dnd guards against accidental
              activation if the user clicks-then-drags the chevron. */}
          {remainingCount > 0 && (
            <button
              data-no-dnd="true"
              onClick={() => setShowAll(!showAll)}
              className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[12px] font-medium text-[#A1A1AA] hover:bg-[#F4F4F5] transition-colors"
            >
              {showAll ? (
                <>
                  <ChevronUp size={12} />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <ChevronDown size={12} />
                  <span>Show {remainingCount} more</span>
                </>
              )}
            </button>
          )}
        </div>
      </SortableContext>

      {/* V3 §7: explicit modifiers on the DragOverlay only — restrictToWindowEdges
          stops the floating clone from escaping the viewport while keeping
          pointer-follow free in both axes. dropAnimation is recomputed in
          onDragEnd; `null` means "skip" (already snapped to slot). */}
      <DragOverlay modifiers={[restrictToWindowEdges]} dropAnimation={dropAnimationConfig}>
        {activeCategory && <DragOverlayCategoryRow category={activeCategory} />}
      </DragOverlay>
    </DndContext>
  );
}

export default SortableCategoriesList;
