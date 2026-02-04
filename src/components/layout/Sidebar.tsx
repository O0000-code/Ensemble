import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Plug, FileText, Layers, Folder, Plus, Settings, Repeat } from 'lucide-react';
import { Category, Tag } from '@/types';
import { CategoryInlineInput, TagInlineInput } from '@/components/sidebar';
import { ColorPicker } from '@/components/common';
import { getCurrentWindow } from '@tauri-apps/api/window';

// Helper to start window dragging
const startDrag = async (e: React.MouseEvent) => {
  if (e.button !== 0) return;

  const target = e.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  // Don't drag if clicking on interactive elements
  if (
    tagName === 'button' ||
    tagName === 'input' ||
    tagName === 'a' ||
    tagName === 'select' ||
    tagName === 'textarea' ||
    target.getAttribute('role') === 'button' ||
    target.getAttribute('role') === 'switch' ||
    target.closest('button, input, a, select, textarea, [role="button"], [role="switch"]')
  ) {
    return;
  }

  try {
    await getCurrentWindow().startDragging();
  } catch (err) {
    // Ignore errors in browser mode
  }
};

export interface SidebarProps {
  activeNav: 'skills' | 'mcp-servers' | 'claude-md' | 'scenes' | 'projects' | 'settings' | null;
  activeCategory?: string | null;
  activeTags?: string[];
  categories: Category[];
  tags: Tag[];
  counts: {
    skills: number;
    mcpServers: number;
    claudeMd: number;
    scenes: number;
    projects: number;
  };
  onNavChange: (nav: string) => void;
  onCategoryChange: (categoryId: string | null) => void;
  onTagToggle: (tagId: string) => void;
  onAddCategory?: () => void;
  onAddTag?: () => void;
  onCategoryContextMenu?: (category: Category, position: { x: number; y: number }) => void;
  onCategoryColorChange?: (categoryId: string, color: string) => void;

  // 编辑状态 props
  editingCategoryId?: string | null;
  isAddingCategory?: boolean;
  editingTagId?: string | null;
  isAddingTag?: boolean;

  // 编辑状态回调
  onCategoryDoubleClick?: (categoryId: string) => void;
  onCategorySave?: (id: string | null, name: string) => void;
  onCategoryEditCancel?: () => void;
  onTagDoubleClick?: (tagId: string) => void;
  onTagContextMenu?: (tag: Tag, position: { x: number; y: number }) => void;
  onTagSave?: (id: string | null, name: string) => void;
  onTagEditCancel?: () => void;

  // Refresh 相关 props
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

// Navigation items configuration
const navItems = [
  { id: 'skills', label: 'Skills', icon: Sparkles, countKey: 'skills' as const },
  { id: 'mcp-servers', label: 'MCP Servers', icon: Plug, countKey: 'mcpServers' as const },
  { id: 'claude-md', label: 'CLAUDE.md', icon: FileText, countKey: 'claudeMd' as const },
  { id: 'scenes', label: 'Scenes', icon: Layers, countKey: 'scenes' as const },
  { id: 'projects', label: 'Projects', icon: Folder, countKey: 'projects' as const },
];

// Maximum tags to display before showing "+N"
const MAX_VISIBLE_TAGS = 10;

export function Sidebar({
  activeNav,
  activeCategory,
  activeTags = [],
  categories,
  tags,
  counts,
  onNavChange,
  onCategoryChange: _onCategoryChange, // Kept for potential future use
  onTagToggle: _onTagToggle, // Kept for potential future use
  onAddCategory,
  onAddTag,
  onCategoryContextMenu,
  onCategoryColorChange,
  // 编辑状态 props
  editingCategoryId,
  isAddingCategory,
  editingTagId,
  isAddingTag,
  // 编辑状态回调
  onCategoryDoubleClick,
  onCategorySave,
  onCategoryEditCancel,
  onTagDoubleClick,
  onTagContextMenu,
  onTagSave,
  onTagEditCancel,
  // Refresh 相关 props
  onRefresh,
  isRefreshing = false,
}: SidebarProps) {
  const navigate = useNavigate();
  const [isClickAnimating, setIsClickAnimating] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Handle refresh button click with animation
  const handleRefreshClick = useCallback(() => {
    if (isRefreshing || isClickAnimating) return;

    // Start click animation
    setIsClickAnimating(true);

    // Call refresh after a tiny delay for visual feedback
    setTimeout(() => {
      onRefresh?.();
    }, 50);

    // Reset click animation after a longer cooldown to prevent rapid clicks
    setTimeout(() => {
      setIsClickAnimating(false);
    }, 1500);
  }, [isRefreshing, isClickAnimating, onRefresh]);

  // Handle navigation item click
  const handleNavClick = (navId: string) => {
    onNavChange(navId);
    if (navId === 'settings') {
      navigate('/settings');
    } else {
      navigate(`/${navId}`);
    }
  };

  // Handle settings button click
  const handleSettingsClick = () => {
    onNavChange('settings');
    navigate('/settings');
  };

  // Handle category context menu
  const handleCategoryContextMenu = (
    e: React.MouseEvent,
    category: Category
  ) => {
    e.preventDefault();
    if (onCategoryContextMenu) {
      onCategoryContextMenu(category, { x: e.clientX, y: e.clientY });
    }
  };

  // Calculate visible tags and remaining count
  const visibleTags = showAllTags ? tags : tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingTagsCount = tags.length - MAX_VISIBLE_TAGS;

  return (
    <aside className="w-[260px] h-screen bg-white border-r border-[#E5E5E5] flex flex-col flex-shrink-0">
      {/* Sidebar Header - Traffic Lights 占位 + Collapse Button */}
      <header
        className="h-14 flex items-center justify-between pl-5 pr-3 border-b border-[#E5E5E5] flex-shrink-0"
        onMouseDown={startDrag}
      >
        {/* Traffic Lights 占位区 - 为系统原生红绿灯预留空间，不绘制任何内容 */}
        <div className="w-[52px]" aria-hidden="true" />

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-[#F4F4F5] transition-colors active:scale-95"
          aria-label="Refresh data"
        >
          <Repeat
            size={14}
            className={`text-[#D4D4D8] transition-transform ${
              isRefreshing ? 'refresh-spinning' : ''
            } ${isClickAnimating && !isRefreshing ? 'refresh-click' : ''}`}
          />
        </button>
      </header>

      {/* Sidebar Content */}
      <div className="flex-1 flex flex-col p-4 pb-2 overflow-hidden">
        {/* Navigation Section - 固定，不滚动 */}
        <nav className="flex flex-col gap-0.5 flex-shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const count = counts[item.countKey];

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    h-9 px-2.5 flex items-center gap-2.5 rounded-[6px] cursor-pointer
                    transition-colors duration-150 border
                    ${isActive
                      ? 'bg-white border-[#E5E5E5]'
                      : 'border-transparent hover:bg-[#F4F4F5]'
                    }
                  `}
                >
                  <Icon
                    size={16}
                    className={isActive ? 'text-[#18181B]' : 'text-[#71717A]'}
                  />
                  <span
                    className={`
                      text-[13px] flex-1 text-left
                      ${isActive
                        ? 'font-medium text-[#18181B]'
                        : 'font-normal text-[#71717A]'
                      }
                    `}
                  >
                    {item.label}
                  </span>
                  <span className="text-[11px] font-medium text-[#A1A1AA]">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>

        {/* Divider - 固定，不参与滚动 */}
        <div className="h-px bg-[#E4E4E7] my-4 flex-shrink-0" />

        {/* Categories Section Header - 固定，不参与滚动 */}
        <div className="flex items-center justify-between flex-shrink-0 mb-3">
          <h3 className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.8px]">
            Categories
          </h3>
          {onAddCategory && (
            <button
              onClick={onAddCategory}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F4F4F5] transition-colors"
              aria-label="Add category"
            >
              <Plus size={12} className="text-[#A1A1AA]" />
            </button>
          )}
        </div>

        {/* Scrollable Area - Categories列表 + Tags 自适应高度，整体滚动 */}
        <div className="flex-1 overflow-y-auto sidebar-scroll min-h-0">
          {/* Categories List */}
            {categories.length > 0 ? (
              <div className="flex flex-col gap-0.5">
                {categories.map((category) => {
                  const isActive = activeCategory === category.id;
                  const isEditing = editingCategoryId === category.id;

                  // 编辑模式
                  if (isEditing) {
                    return (
                      <CategoryInlineInput
                        key={category.id}
                        mode="edit"
                        category={category}
                        onSave={(name) => onCategorySave?.(category.id, name)}
                        onCancel={() => onCategoryEditCancel?.()}
                      />
                    );
                  }

                  // 普通模式
                  return (
                    <div
                      key={category.id}
                      className={`
                        h-8 px-2.5 flex items-center gap-2.5 rounded-[6px] cursor-pointer
                        transition-colors duration-150
                        ${isActive ? 'bg-[#F4F4F5]' : 'hover:bg-[#F4F4F5]'}
                      `}
                      onClick={() => {
                        if (isActive) {
                          navigate('/skills'); // 取消选择时回到 Skills 页面
                        } else {
                          navigate(`/category/${category.id}`);
                        }
                      }}
                      onDoubleClick={() => onCategoryDoubleClick?.(category.id)}
                      onContextMenu={(e) => handleCategoryContextMenu(e, category)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (isActive) {
                            navigate('/skills');
                          } else {
                            navigate(`/category/${category.id}`);
                          }
                        }
                      }}
                    >
                      {/* Category Dot - ColorPicker 触发器 */}
                      <ColorPicker
                        value={category.color}
                        onChange={(color) => {
                          onCategoryColorChange?.(category.id, color);
                        }}
                      />
                      {/* Category Name */}
                      <span
                        className={`
                          text-[13px] flex-1 text-left truncate
                          ${isActive
                            ? 'font-medium text-[#18181B]'
                            : 'font-normal text-[#52525B]'
                          }
                        `}
                      >
                        {category.name}
                      </span>
                      {/* Category Count */}
                      <span className="text-[11px] font-medium text-[#A1A1AA]">
                        {category.count}
                      </span>
                    </div>
                  );
                })}

                {/* 新增模式 - 在列表末尾 */}
                {isAddingCategory && (
                  <CategoryInlineInput
                    mode="add"
                    onSave={(name) => onCategorySave?.(null, name)}
                    onCancel={() => onCategoryEditCancel?.()}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {isAddingCategory ? (
                  <CategoryInlineInput
                    mode="add"
                    onSave={(name) => onCategorySave?.(null, name)}
                    onCancel={() => onCategoryEditCancel?.()}
                  />
                ) : (
                  <p className="text-xs text-[#A1A1AA] px-2.5">No categories</p>
                )}
              </div>
            )}

          {/* Tags Section */}
          <section className="flex flex-col gap-3 pt-4 border-t border-[#E4E4E7] mt-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold text-[#A1A1AA] uppercase tracking-[0.8px]">
                Tags
              </h3>
              {onAddTag && (
                <button
                  onClick={onAddTag}
                  className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F4F4F5] transition-colors"
                  aria-label="Add tag"
                >
                  <Plus size={12} className="text-[#A1A1AA]" />
                </button>
              )}
            </div>

            {/* Tags Grid */}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {visibleTags.map((tag) => {
                  const isActive = activeTags.includes(tag.id);
                  const isEditing = editingTagId === tag.id;

                  // 编辑模式
                  if (isEditing) {
                    return (
                      <TagInlineInput
                        key={tag.id}
                        mode="edit"
                        tag={tag}
                        onSave={(name) => onTagSave?.(tag.id, name)}
                        onCancel={() => onTagEditCancel?.()}
                      />
                    );
                  }

                  // 普通模式
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        if (isActive) {
                          navigate('/skills'); // 取消选择时回到 Skills 页面
                        } else {
                          navigate(`/tag/${tag.id}`);
                        }
                      }}
                      onDoubleClick={() => onTagDoubleClick?.(tag.id)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        onTagContextMenu?.(tag, { x: e.clientX, y: e.clientY });
                      }}
                      className={`
                        px-2.5 py-[5px] rounded text-[11px] font-medium
                        transition-colors duration-150
                        ${isActive
                          ? 'bg-[#18181B] text-white border-transparent'
                          : 'bg-transparent text-[#52525B] border border-[#E5E5E5] hover:bg-[#F4F4F5]'
                        }
                      `}
                    >
                      {tag.name}
                    </button>
                  );
                })}

                {/* Show "+N" button if there are more tags, or "Collapse" when expanded */}
                {remainingTagsCount > 0 && (
                  <button
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="px-2.5 py-[5px] rounded text-[11px] font-medium text-[#A1A1AA] border border-[#E5E5E5] hover:bg-[#F4F4F5] transition-colors"
                    aria-label={showAllTags ? 'Show less tags' : `Show ${remainingTagsCount} more tags`}
                  >
                    {showAllTags ? 'Less' : `+${remainingTagsCount}`}
                  </button>
                )}

                {/* 新增模式 - 在标签末尾 */}
                {isAddingTag && (
                  <TagInlineInput
                    mode="add"
                    onSave={(name) => onTagSave?.(null, name)}
                    onCancel={() => onTagEditCancel?.()}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {isAddingTag ? (
                  <TagInlineInput
                    mode="add"
                    onSave={(name) => onTagSave?.(null, name)}
                    onCancel={() => onTagEditCancel?.()}
                  />
                ) : (
                  <p className="text-xs text-[#A1A1AA] px-2.5">No tags</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar Footer - 固定 */}
        <footer className="pt-4 -ml-1.5 flex-shrink-0">
          <button
            onClick={handleSettingsClick}
            className={`
              w-8 h-8 flex items-center justify-center rounded-[6px]
              transition-colors duration-150
              ${activeNav === 'settings'
                ? 'bg-[#F4F4F5]'
                : 'hover:bg-[#F4F4F5]'
              }
            `}
            aria-label="Settings"
          >
            <Settings size={18} className="text-[#71717A]" />
          </button>
        </footer>
      </div>
    </aside>
  );
}

export default Sidebar;
