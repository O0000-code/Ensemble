import React from 'react';

interface TagEmptyIconProps {
  className?: string;
}

/**
 * TagEmptyIcon Component
 *
 * 用于 Tag 筛选结果为空时的空状态图标。
 *
 * Design specs:
 * - Container: 44 x 32 px
 * - 3 stacked label shapes, each 30 x 16 px
 * - Asymmetric border-radius: [8, 4, 4, 8] (left-top, right-top, right-bottom, left-bottom)
 * - Each layer has a 4x4 px circular hole
 * - Stroke width: 1.5px
 * - Colors: Back #E4E4E7, Mid #D4D4D8, Front #A1A1AA
 */
export const TagEmptyIcon: React.FC<TagEmptyIconProps> = ({ className }) => {
  /**
   * Creates a label shape path with asymmetric border-radius
   * Left corners: 8px radius, Right corners: 4px radius
   *
   * @param x - X position offset
   * @param y - Y position offset
   * @returns SVG path data string
   */
  const createLabelPath = (x: number, y: number): string => {
    const w = 30;
    const h = 16;
    const rLeft = 8; // Left corners radius
    const rRight = 4; // Right corners radius
    const strokeOffset = 0.75; // Half of stroke-width 1.5

    // Adjust dimensions for stroke (stroke is centered, so inset by half)
    const x1 = x + strokeOffset;
    const y1 = y + strokeOffset;
    const w1 = w - 1.5;
    const h1 = h - 1.5;
    const rL = rLeft - strokeOffset;
    const rR = rRight - strokeOffset;

    // Build path: start from top-left corner (after the arc)
    // M = moveto, H = horizontal lineto, V = vertical lineto, A = arc, Z = closepath
    return [
      `M ${x1 + rL} ${y1}`, // Start at top-left, after left arc
      `H ${x1 + w1 - rR}`, // Top edge to right
      `A ${rR} ${rR} 0 0 1 ${x1 + w1} ${y1 + rR}`, // Top-right corner arc
      `V ${y1 + h1 - rR}`, // Right edge down
      `A ${rR} ${rR} 0 0 1 ${x1 + w1 - rR} ${y1 + h1}`, // Bottom-right corner arc
      `H ${x1 + rL}`, // Bottom edge to left
      `A ${rL} ${rL} 0 0 1 ${x1} ${y1 + h1 - rL}`, // Bottom-left corner arc
      `V ${y1 + rL}`, // Left edge up
      `A ${rL} ${rL} 0 0 1 ${x1 + rL} ${y1}`, // Top-left corner arc
      'Z', // Close path
    ].join(' ');
  };

  return (
    <svg
      className={className}
      width="44"
      height="32"
      viewBox="0 0 44 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Label Back (最后层) - Position: x:14, y:16 */}
      <path
        d={createLabelPath(14, 16)}
        stroke="#E4E4E7"
        strokeWidth="1.5"
      />
      {/* Hole Back - Center at (14 + 3 + 2, 16 + 6 + 2) = (19, 24) */}
      <circle cx="19" cy="24" r="2" fill="#E4E4E7" />

      {/* Label Mid (中间层) - Position: x:7, y:8 */}
      <path
        d={createLabelPath(7, 8)}
        fill="white"
        stroke="#D4D4D8"
        strokeWidth="1.5"
      />
      {/* Hole Mid - Center at (7 + 3 + 2, 8 + 6 + 2) = (12, 16) */}
      <circle cx="12" cy="16" r="2" fill="#D4D4D8" />

      {/* Label Front (最前层) - Position: x:0, y:0 */}
      <path
        d={createLabelPath(0, 0)}
        fill="white"
        stroke="#A1A1AA"
        strokeWidth="1.5"
      />
      {/* Hole Front - Center at (0 + 3 + 2, 0 + 6 + 2) = (5, 8) */}
      <circle cx="5" cy="8" r="2" fill="#A1A1AA" />
    </svg>
  );
};

export default TagEmptyIcon;
