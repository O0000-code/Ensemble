import { useState, useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import ContextMenu from '../common/ContextMenu';
import { useAppStore } from '@/stores/appStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSkillsStore } from '@/stores/skillsStore';
import { useMcpsStore } from '@/stores/mcpsStore';
import { useScenesStore } from '@/stores/scenesStore';
import { useProjectsStore } from '@/stores/projectsStore';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { isTauri } from '@/utils/tauri';
import { ErrorBoundary } from '../common/ErrorBoundary';
import type { Category, Tag } from '@/types';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const {
    activeCategory,
    activeTags,
    categories,
    tags,
    setActiveCategory,
    toggleActiveTag,
    initApp,
    // Editing state
    editingCategoryId,
    isAddingCategory,
    editingTagId,
    isAddingTag,
    // Editing actions
    startEditingCategory,
    stopEditingCategory,
    startAddingCategory,
    stopAddingCategory,
    startEditingTag,
    stopEditingTag,
    startAddingTag,
    stopAddingTag,
    // CRUD actions
    addCategory,
    updateCategory,
    deleteCategory,
    addTag,
    updateTag,
    deleteTag,
    // Sidebar collapse state
    sidebarCollapsed,
    toggleSidebar,
  } = useAppStore();

  const { loadSettings } = useSettingsStore();
  const { skills, loadSkills, setFilter: setSkillsFilter } = useSkillsStore();
  const { mcpServers, loadMcps, setFilter: setMcpsFilter } = useMcpsStore();
  const { scenes, loadScenes } = useScenesStore();
  const { projects, loadProjects } = useProjectsStore();

  // Dynamically calculate navigation counts
  const navCounts = useMemo(() => ({
    skills: skills.length,
    mcpServers: mcpServers.length,
    scenes: scenes.length,
    projects: projects.length,
  }), [skills.length, mcpServers.length, scenes.length, projects.length]);

  // Dynamically calculate category counts from skills and mcps
  const categoriesWithCounts = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      count: skills.filter(s => s.category === cat.name).length +
             mcpServers.filter(m => m.category === cat.name).length
    }));
  }, [categories, skills, mcpServers]);

  // Dynamically calculate tag counts from skills and mcps
  const tagsWithCounts = useMemo(() => {
    return tags.map(tag => ({
      ...tag,
      count: skills.filter(s => s.tags?.includes(tag.name)).length +
             mcpServers.filter(m => m.tags?.includes(tag.name)).length
    }));
  }, [tags, skills, mcpServers]);

  // Initialize app data on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        // In browser mode, skip data loading but allow UI preview
        if (!isTauri()) {
          console.warn('Running in browser mode - Tauri API not available. Using empty data for UI preview.');
          setIsInitializing(false);
          return;
        }

        // Load settings first (needed by other stores)
        await loadSettings();

        // Initialize app data (categories, tags)
        await initApp();

        // Load all data in parallel
        await Promise.all([
          loadSkills(),
          loadMcps(),
          loadScenes(),
          loadProjects(),
        ]);

        setIsInitializing(false);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setInitError(String(error));
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  // Sync Category/Tag filter state from appStore to skillsStore and mcpsStore
  useEffect(() => {
    setSkillsFilter({ category: activeCategory, tags: activeTags });
    setMcpsFilter({ category: activeCategory, tags: activeTags });
  }, [activeCategory, activeTags, setSkillsFilter, setMcpsFilter]);

  // Context menu state - Category
  const [contextMenu, setContextMenu] = useState<{
    category: Category;
    position: { x: number; y: number };
  } | null>(null);

  // Context menu state - Tag
  const [tagContextMenu, setTagContextMenu] = useState<{
    tag: Tag;
    position: { x: number; y: number };
  } | null>(null);

  // Parse Category/Tag from URL path
  const categoryMatch = location.pathname.match(/^\/category\/(.+)$/);
  const tagMatch = location.pathname.match(/^\/tag\/(.+)$/);

  const currentCategoryId = categoryMatch ? decodeURIComponent(categoryMatch[1]) : null;
  const currentTagId = tagMatch ? decodeURIComponent(tagMatch[1]) : null;

  // Determine active nav from current route
  // Category/Tag pages don't highlight any main nav item (return null equivalent by using 'skills' but Sidebar won't highlight it)
  const getActiveNav = (): 'skills' | 'mcp-servers' | 'scenes' | 'projects' | 'settings' | null => {
    const path = location.pathname;
    // Category/Tag pages - don't highlight main nav
    if (path.startsWith('/category/') || path.startsWith('/tag/')) return null;
    if (path.startsWith('/skills')) return 'skills';
    if (path.startsWith('/mcp-servers')) return 'mcp-servers';
    if (path.startsWith('/scenes')) return 'scenes';
    if (path.startsWith('/projects')) return 'projects';
    if (path.startsWith('/settings')) return 'settings';
    return 'skills';
  };

  const handleNavChange = (nav: string) => {
    navigate(`/${nav}`);
  };

  const handleCategoryContextMenu = (category: Category, position: { x: number; y: number }) => {
    setContextMenu({ category, position });
  };

  // Category handlers
  const handleAddCategory = () => {
    startAddingCategory();
  };

  const handleCategoryDoubleClick = (categoryId: string) => {
    startEditingCategory(categoryId);
  };

  const handleCategorySave = async (id: string | null, name: string) => {
    try {
      if (id) {
        // Edit mode
        await updateCategory(id, name);
      } else {
        // Add mode - use default color
        await addCategory(name, '#A1A1AA');
      }
      stopEditingCategory();
      stopAddingCategory();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleCategoryEditCancel = () => {
    stopEditingCategory();
    stopAddingCategory();
  };

  const handleRenameCategory = () => {
    if (contextMenu?.category) {
      startEditingCategory(contextMenu.category.id);
    }
    setContextMenu(null);
  };

  const handleDeleteCategory = async () => {
    if (contextMenu?.category) {
      try {
        await deleteCategory(contextMenu.category.id);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
    setContextMenu(null);
  };

  // Tag handlers
  const handleAddTag = () => {
    startAddingTag();
  };

  const handleTagDoubleClick = (tagId: string) => {
    startEditingTag(tagId);
  };

  const handleTagContextMenu = (tag: Tag, position: { x: number; y: number }) => {
    setTagContextMenu({ tag, position });
  };

  const handleRenameTag = () => {
    if (tagContextMenu?.tag) {
      startEditingTag(tagContextMenu.tag.id);
    }
    setTagContextMenu(null);
  };

  const handleDeleteTag = async () => {
    if (tagContextMenu?.tag) {
      try {
        await deleteTag(tagContextMenu.tag.id);
      } catch (error) {
        console.error('Failed to delete tag:', error);
      }
    }
    setTagContextMenu(null);
  };

  const handleTagSave = async (id: string | null, name: string) => {
    try {
      if (id) {
        // Edit mode
        await updateTag(id, name);
      } else {
        // Add mode
        await addTag(name);
      }
      stopEditingTag();
      stopAddingTag();
    } catch (error) {
      console.error('Failed to save tag:', error);
    }
  };

  const handleTagEditCancel = () => {
    stopEditingTag();
    stopAddingTag();
  };

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
          <p className="text-sm text-zinc-500">Loading Ensemble...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900">Failed to Load</h2>
          <p className="text-sm text-zinc-500">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-white">
      {/* Browser Preview Mode Banner */}
      {!isTauri() && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center flex-shrink-0">
          <p className="text-xs text-amber-700">
            Browser Preview Mode — Run <code className="bg-amber-100 px-1 rounded">npm run tauri dev</code> for full functionality
          </p>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeNav={getActiveNav()}
          activeCategory={currentCategoryId || activeCategory}
          activeTags={currentTagId ? [currentTagId] : activeTags}
          categories={categoriesWithCounts}
          tags={tagsWithCounts}
          counts={navCounts}
          onNavChange={handleNavChange}
          onCategoryChange={setActiveCategory}
          onTagToggle={toggleActiveTag}
          onCategoryContextMenu={handleCategoryContextMenu}
          // Add/Edit handlers
          onAddCategory={handleAddCategory}
          onAddTag={handleAddTag}
          editingCategoryId={editingCategoryId}
          isAddingCategory={isAddingCategory}
          editingTagId={editingTagId}
          isAddingTag={isAddingTag}
          onCategoryDoubleClick={handleCategoryDoubleClick}
          onCategorySave={handleCategorySave}
          onCategoryEditCancel={handleCategoryEditCancel}
          onTagDoubleClick={handleTagDoubleClick}
          onTagContextMenu={handleTagContextMenu}
          onTagSave={handleTagSave}
          onTagEditCancel={handleTagEditCancel}
          // Collapse state
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden flex flex-col">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      {/* Category Context Menu */}
      {contextMenu && (
        <ContextMenu
          items={[
            {
              label: 'Rename',
              icon: <Pencil size={14} />,
              onClick: handleRenameCategory,
            },
            {
              label: 'Delete',
              icon: <Trash2 size={14} />,
              onClick: handleDeleteCategory,
              danger: true,
            },
          ]}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Tag Context Menu */}
      {tagContextMenu && (
        <ContextMenu
          items={[
            {
              label: 'Rename',
              icon: <Pencil size={14} />,
              onClick: handleRenameTag,
            },
            {
              label: 'Delete',
              icon: <Trash2 size={14} />,
              onClick: handleDeleteTag,
              danger: true,
            },
          ]}
          position={tagContextMenu.position}
          onClose={() => setTagContextMenu(null)}
        />
      )}
    </div>
  );
}
