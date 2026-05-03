import type { Category } from '@/types';
import { CategoryRowContent } from './CategoryRowContent';

/**
 * Visible drag clone shown inside `<DragOverlay>` while a category row is
 * being dragged. The inline source row goes to `opacity: 0`; this component
 * is the user-perceived "lifted" element.
 *
 * Visuals (multi-layer hsl shadow, 6px radius, white background, grabbing
 * cursor) come from the `.drag-overlay-row` class in `src/index.css` —
 * see `02_design_spec.md` V3 §2.2 and `03_tech_plan.md` V3 §10.
 *
 * Per spec §2.2 the count number is omitted in the overlay.
 */
interface DragOverlayCategoryRowProps {
  category: Category;
}

export function DragOverlayCategoryRow({ category }: DragOverlayCategoryRowProps) {
  return (
    <div className="drag-overlay-row h-8 px-2.5 flex items-center gap-2.5">
      <CategoryRowContent category={category} showCount={false} />
    </div>
  );
}

export default DragOverlayCategoryRow;
