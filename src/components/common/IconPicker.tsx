import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Search, LucideIcon } from 'lucide-react';
import {
  Globe,
  Code,
  Database,
  Server,
  Folder,
  File,
  Smartphone,
  Monitor,
  Terminal,
  Palette,
  BookOpen,
  PenTool,
  BarChart,
  Sparkles,
  Zap,
  Plug,
  Cpu,
  Cloud,
  GitBranch,
  Settings,
  Layers,
  Box,
  LayoutGrid,
  Compass,
} from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export interface IconPickerProps {
  /** 当前选中的图标名称 */
  value: string;
  /** 图标变更回调 */
  onChange: (iconName: string) => void;
  /** 触发元素引用，用于定位弹出层 */
  triggerRef: React.RefObject<HTMLElement | null>;
  /** 是否打开 */
  isOpen: boolean;
  /** 关闭回调 */
  onClose: () => void;
  /** 禁用状态 */
  disabled?: boolean;
}

interface IconOption {
  name: string;
  icon: LucideIcon;
}

// ============================================================================
// Constants
// ============================================================================

const PRESET_ICONS: IconOption[] = [
  { name: 'globe', icon: Globe },
  { name: 'code', icon: Code },
  { name: 'database', icon: Database },
  { name: 'server', icon: Server },
  { name: 'folder', icon: Folder },
  { name: 'file', icon: File },
  { name: 'smartphone', icon: Smartphone },
  { name: 'monitor', icon: Monitor },
  { name: 'terminal', icon: Terminal },
  { name: 'palette', icon: Palette },
  { name: 'book-open', icon: BookOpen },
  { name: 'pen-tool', icon: PenTool },
  { name: 'bar-chart', icon: BarChart },
  { name: 'sparkles', icon: Sparkles },
  { name: 'zap', icon: Zap },
  { name: 'plug', icon: Plug },
  { name: 'cpu', icon: Cpu },
  { name: 'cloud', icon: Cloud },
  { name: 'git-branch', icon: GitBranch },
  { name: 'settings', icon: Settings },
  { name: 'layers', icon: Layers },
  { name: 'box', icon: Box },
  { name: 'layout-grid', icon: LayoutGrid },
  { name: 'compass', icon: Compass },
];

// 导出图标映射，供其他组件使用
export const ICON_MAP: Record<string, LucideIcon> = PRESET_ICONS.reduce(
  (acc, { name, icon }) => {
    acc[name] = icon;
    return acc;
  },
  {} as Record<string, LucideIcon>
);

// ============================================================================
// IconPicker Component
// ============================================================================

/**
 * IconPicker Component
 *
 * 弹出式图标选择器，允许用户从预设列表中选择图标。
 *
 * Design specs:
 * - 容器宽度: 260px
 * - 圆角: 8px (--radius-lg)
 * - 背景: #FFFFFF
 * - 边框: 1px solid #E5E5E5
 * - 阴影: 0 4px 12px rgba(0,0,0,0.0625)
 * - 图标网格: 6 列，每项 36x36px
 */
export function IconPicker({
  value,
  onChange,
  triggerRef,
  isOpen,
  onClose,
  disabled = false,
}: IconPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const popupRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ========== Position Calculation ==========
  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const pickerWidth = 260;
    const pickerHeight = 300;

    let top = rect.bottom + 4;
    let left = rect.left;

    // 右边界检测
    if (left + pickerWidth > viewportWidth - 8) {
      left = viewportWidth - pickerWidth - 8;
    }

    // 底部边界检测 - 如果放不下，改为向上弹出
    if (top + pickerHeight > viewportHeight - 8) {
      top = rect.top - pickerHeight - 4;
    }

    // 确保不超出左边界
    if (left < 8) {
      left = 8;
    }

    setPosition({ top, left });
  }, [triggerRef]);

  // ========== Filtering ==========
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return PRESET_ICONS;
    }
    const query = searchQuery.toLowerCase().trim();
    return PRESET_ICONS.filter((icon) => icon.name.toLowerCase().includes(query));
  }, [searchQuery]);

  // ========== Effects ==========

  // 打开时更新位置和重置状态
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      setSearchQuery('');
      setFocusedIndex(-1);
      // 聚焦搜索框
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [isOpen, updatePosition]);

  // 监听滚动和窗口大小变化
  useEffect(() => {
    if (isOpen) {
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, updatePosition]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isOutsidePopup = popupRef.current && !popupRef.current.contains(target);
      const isOutsideTrigger = triggerRef.current && !triggerRef.current.contains(target);

      if (isOutsidePopup && isOutsideTrigger) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, triggerRef]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          triggerRef.current?.focus();
          break;
        case 'ArrowRight':
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev < filteredIcons.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowLeft':
          event.preventDefault();
          setFocusedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex((prev) =>
            prev + 6 < filteredIcons.length ? prev + 6 : prev
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex((prev) => (prev - 6 >= 0 ? prev - 6 : prev));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < filteredIcons.length) {
            handleIconSelect(filteredIcons[focusedIndex].name);
          }
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, focusedIndex, filteredIcons, onClose, triggerRef]);

  // ========== Handlers ==========
  const handleIconSelect = (iconName: string) => {
    onChange(iconName);
    onClose();
  };

  // ========== Render ==========
  if (!isOpen || disabled) return null;

  const popupContent = createPortal(
    <div
      ref={popupRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: 260,
        zIndex: 9999,
      }}
      className="bg-white border border-[#E5E5E5] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.0625)]"
      role="listbox"
      aria-label="Icon picker"
    >
      {/* Search Box */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#E5E5E5]">
        <Search className="w-3.5 h-3.5 text-[#A1A1AA] flex-shrink-0" />
        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search icons..."
          className="flex-1 text-[13px] text-[#18181B] placeholder:text-[#A1A1AA] outline-none bg-transparent"
        />
      </div>

      {/* Icon Grid */}
      <div className="p-2 max-h-[240px] overflow-y-auto icon-picker-scroll">
        {filteredIcons.length === 0 ? (
          <div className="px-3 py-4 text-[13px] text-[#A1A1AA] text-center">
            No icons found
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-1">
            {filteredIcons.map((iconOption, index) => {
              const IconComponent = iconOption.icon;
              const isSelected = value === iconOption.name;
              const isFocused = focusedIndex === index;

              return (
                <button
                  key={iconOption.name}
                  type="button"
                  onClick={() => handleIconSelect(iconOption.name)}
                  className={`
                    flex items-center justify-center
                    w-9 h-9 rounded-md
                    transition-colors
                    ${isSelected ? 'bg-[#F4F4F5]' : 'hover:bg-[#F4F4F5]'}
                    ${isFocused ? 'ring-2 ring-[#18181B]/20' : ''}
                  `}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={iconOption.name}
                >
                  <IconComponent className="w-[18px] h-[18px] text-[#52525B]" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );

  return popupContent;
}

// ============================================================================
// Export
// ============================================================================

export default IconPicker;
