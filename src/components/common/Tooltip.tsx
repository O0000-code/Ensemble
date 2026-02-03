import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Trigger element */
  children: React.ReactElement;
  /** Position relative to trigger element */
  position?: 'top' | 'bottom';
  /** Additional CSS classes */
  className?: string;
}

/**
 * Lightweight Tooltip component for displaying contextual information.
 *
 * Style specifications:
 * - Background: #18181B (dark)
 * - Text: #FFFFFF (white), 11px
 * - Border radius: 6px
 * - Padding: 8px 12px
 * - Shadow: 0 4px 12px rgba(0,0,0,0.15)
 * - Animation: fade in/out, 150ms
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // Calculate horizontal center alignment
    const left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    // Calculate vertical position based on position prop
    let top: number;
    if (position === 'top') {
      top = triggerRect.top - tooltipRect.height - 8; // 8px gap
    } else {
      top = triggerRect.bottom + 8; // 8px gap
    }

    // Ensure tooltip stays within viewport horizontally
    const adjustedLeft = Math.max(
      8,
      Math.min(left, window.innerWidth - tooltipRect.width - 8)
    );

    setTooltipPosition({ top, left: adjustedLeft });
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [isVisible, updatePosition]);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  // Clone the child element and attach event handlers and ref
  const trigger = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      children.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      children.props.onMouseLeave?.(e);
    },
  });

  // Tooltip styles
  const tooltipStyles: React.CSSProperties = {
    position: 'fixed',
    top: tooltipPosition.top,
    left: tooltipPosition.left,
    backgroundColor: '#18181B',
    color: '#FFFFFF',
    fontSize: '11px',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '6px',
    padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 50,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translateY(0)'
      : position === 'top'
        ? 'translateY(4px)'
        : 'translateY(-4px)',
    transition: 'opacity 150ms ease-out, transform 150ms ease-out',
  };

  // Arrow styles
  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    ...(position === 'top'
      ? {
          bottom: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderTop: '5px solid #18181B',
        }
      : {
          top: '-5px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottom: '5px solid #18181B',
        }),
  };

  const tooltipElement = (
    <div
      ref={tooltipRef}
      style={tooltipStyles}
      className={className}
      role="tooltip"
      aria-hidden={!isVisible}
    >
      {content}
      <div style={arrowStyles} />
    </div>
  );

  return (
    <>
      {trigger}
      {createPortal(tooltipElement, document.body)}
    </>
  );
}

export default Tooltip;
