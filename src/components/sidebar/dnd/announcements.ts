import type { Announcements, ScreenReaderInstructions } from '@dnd-kit/core';

/**
 * Screen-reader instructions shown when the user focuses a draggable item.
 * Tells assistive-tech users how to operate the keyboard sensor.
 */
export const sidebarScreenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'To pick up a sortable item, press space or enter. While dragging, use arrow keys to move. Press space or enter to drop, escape to cancel.',
};

interface NamedItem {
  id: string;
  name: string;
}

/**
 * Build accessible drag announcements for a sortable list. Critically, all
 * announcements reference the human-readable `name` of each item (e.g.
 * "Coding") rather than the underlying UUID — see `03_tech_plan.md` V3 §12
 * and the V3 review note about VoiceOver speaking UUIDs being unusable.
 *
 * Args:
 * - `items`: the current ordered list of sortable items (id + name).
 * - `label`: the kind of item being announced ("category" | "tag"); shapes
 *   the natural-language phrasing.
 */
export function makeAnnouncements(items: NamedItem[], label: 'category' | 'tag'): Announcements {
  const findName = (id: string | number): string => {
    const found = items.find((item) => item.id === String(id));
    return found ? found.name : String(id);
  };

  const findPosition = (id: string | number): number => {
    const idx = items.findIndex((item) => item.id === String(id));
    return idx === -1 ? -1 : idx + 1;
  };

  const total = items.length;

  return {
    onDragStart({ active }) {
      const name = findName(active.id);
      const position = findPosition(active.id);
      return `Picked up ${label} ${name}. Position ${position} of ${total}.`;
    },
    onDragOver({ active, over }) {
      const activeName = findName(active.id);
      if (!over) {
        return `${
          label.charAt(0).toUpperCase() + label.slice(1)
        } ${activeName} is no longer over a droppable area.`;
      }
      const overName = findName(over.id);
      const overPosition = findPosition(over.id);
      return `${
        label.charAt(0).toUpperCase() + label.slice(1)
      } ${activeName} was moved over ${label} ${overName} at position ${overPosition} of ${total}.`;
    },
    onDragEnd({ active, over }) {
      const activeName = findName(active.id);
      if (!over) {
        return `${
          label.charAt(0).toUpperCase() + label.slice(1)
        } ${activeName} was dropped outside of a droppable area.`;
      }
      if (active.id === over.id) {
        return `${
          label.charAt(0).toUpperCase() + label.slice(1)
        } ${activeName} was dropped in its original position.`;
      }
      const overName = findName(over.id);
      const overPosition = findPosition(over.id);
      return `${
        label.charAt(0).toUpperCase() + label.slice(1)
      } ${activeName} was dropped at position ${overPosition} of ${total}, replacing ${label} ${overName}.`;
    },
    onDragCancel({ active }) {
      const activeName = findName(active.id);
      return `Dragging was cancelled. ${
        label.charAt(0).toUpperCase() + label.slice(1)
      } ${activeName} was returned to its original position.`;
    },
  };
}
