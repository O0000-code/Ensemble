import { MouseSensor as LibMouseSensor } from '@dnd-kit/core';
import type { MouseEvent as ReactMouseEvent } from 'react';

/**
 * Walks up from `element` checking each ancestor's `data-no-dnd` attribute.
 * Returns false if any ancestor declares `data-no-dnd="true"`, signaling
 * that drag activation should be suppressed (e.g. ColorPicker dot click).
 */
const shouldHandleEvent = (element: HTMLElement | null): boolean => {
  let cur: HTMLElement | null = element;
  while (cur) {
    if (cur.dataset && cur.dataset.noDnd === 'true') return false;
    cur = cur.parentElement;
  }
  return true;
};

/**
 * Custom MouseSensor that opts out of drag activation when the mousedown
 * target (or any ancestor) is marked with `data-no-dnd="true"`. This lets
 * us preserve interactive children like ColorPicker swatches inside an
 * otherwise-draggable Sortable row.
 */
export class CustomMouseSensor extends LibMouseSensor {
  static activators = [
    {
      eventName: 'onMouseDown' as const,
      handler: ({ nativeEvent: e }: ReactMouseEvent): boolean =>
        shouldHandleEvent(e.target as HTMLElement),
    },
  ];
}
