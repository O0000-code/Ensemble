import { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

export interface ContextMenuProps {
  items: ContextMenuItem[];
  position: { x: number; y: number };
  onClose: () => void;
}

/**
 * ContextMenu 右键菜单组件
 *
 * 设计规范：
 * - Container: width 140px, radius 6px, border 1px #E5E5E5, shadow 0 2px 8px rgba(0,0,0,0.08)
 * - Item: padding 6px 10px, radius 4px, gap 8px
 * - Normal: Icon 14x14 #52525B, Text 13px #18181B
 * - Danger: Icon/Text #DC2626, hover bg #FEF2F2
 */
export default function ContextMenu({ items, position, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // 计算菜单位置，避免超出视口
  const getAdjustedPosition = useCallback(() => {
    if (!menuRef.current) return position;

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let { x, y } = position;

    // 如果菜单超出右边界，向左移动
    if (x + menuRect.width > viewportWidth) {
      x = viewportWidth - menuRect.width - 8;
    }

    // 如果菜单超出下边界，向上移动
    if (y + menuRect.height > viewportHeight) {
      y = viewportHeight - menuRect.height - 8;
    }

    // 确保不会超出左边界
    if (x < 8) {
      x = 8;
    }

    // 确保不会超出上边界
    if (y < 8) {
      y = 8;
    }

    return { x, y };
  }, [position]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 使用 mousedown 而不是 click，响应更快
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // 按 Escape 键关闭菜单
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // 处理菜单项点击
  const handleItemClick = (item: ContextMenuItem) => {
    if (item.disabled) return;
    item.onClick();
    onClose();
  };

  // 动态调整位置
  useEffect(() => {
    if (menuRef.current) {
      const adjusted = getAdjustedPosition();
      menuRef.current.style.left = `${adjusted.x}px`;
      menuRef.current.style.top = `${adjusted.y}px`;
    }
  }, [getAdjustedPosition]);

  const menuContent = (
    <div
      ref={menuRef}
      className="fixed z-50 w-[140px] bg-white rounded-md border border-[#E5E5E5] p-1"
      style={{
        left: position.x,
        top: position.y,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
      role="menu"
      aria-orientation="vertical"
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => handleItemClick(item)}
          disabled={item.disabled}
          className={`
            w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-left
            transition-colors duration-150
            ${item.disabled
              ? 'opacity-50 cursor-not-allowed'
              : item.danger
                ? 'text-[#DC2626] hover:bg-[#FEF2F2] cursor-pointer'
                : 'text-[#18181B] hover:bg-[#F4F4F5] cursor-pointer'
            }
          `}
          role="menuitem"
          aria-disabled={item.disabled}
        >
          {item.icon && (
            <span
              className={`flex-shrink-0 w-3.5 h-3.5 flex items-center justify-center ${
                item.danger ? 'text-[#DC2626]' : 'text-[#52525B]'
              }`}
            >
              {item.icon}
            </span>
          )}
          <span className="text-[13px] font-normal">{item.label}</span>
        </button>
      ))}
    </div>
  );

  return createPortal(menuContent, document.body);
}
