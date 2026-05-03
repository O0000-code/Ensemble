import type { DropAnimation } from '@dnd-kit/core';
import { defaultDropAnimation } from '@dnd-kit/core';

/**
 * Distance (in CSS pixels) within which the dragged item snaps to the
 * nearest droppable's center. See `02_design_spec.md` V3 §2.5 and
 * `snapModifier.ts`.
 */
export const SNAP_DISTANCE_PX = 12;

/**
 * Base drop animation for category rows. 220ms matches the cascade duration
 * (see `02_design_spec.md` V3 §2.4) so settle and let-pass feel co-timed.
 * Lists override this per-drop with a distance-aware config when needed
 * (see `03_tech_plan.md` V3 §7.2).
 */
export const CATEGORY_DROP_ANIMATION: DropAnimation = {
  ...defaultDropAnimation,
  duration: 220,
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
};

/**
 * Tag drop animation. Identical to category — kept as separate symbol so
 * future spec drift can change them independently without touching call sites.
 */
export const TAG_DROP_ANIMATION: DropAnimation = CATEGORY_DROP_ANIMATION;
