import { useState, useEffect } from 'react';
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
import type { Category } from '@/types';

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
    counts,
    setActiveCategory,
    toggleActiveTag,
    initApp,
  } = useAppStore();

  const { loadSettings } = useSettingsStore();
  const { loadSkills } = useSkillsStore();
  const { loadMcps } = useMcpsStore();
  const { loadScenes } = useScenesStore();
  const { loadProjects } = useProjectsStore();

  // Initialize app data on mount
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

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

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    category: Category;
    position: { x: number; y: number };
  } | null>(null);

  // Determine active nav from current route
  const getActiveNav = (): 'skills' | 'mcp-servers' | 'scenes' | 'projects' | 'settings' => {
    const path = location.pathname;
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

  const handleRenameCategory = () => {
    // TODO: Implement rename modal
    console.log('Rename category:', contextMenu?.category);
    setContextMenu(null);
  };

  const handleDeleteCategory = () => {
    // TODO: Implement delete confirmation
    console.log('Delete category:', contextMenu?.category);
    setContextMenu(null);
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
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      <Sidebar
        activeNav={getActiveNav()}
        activeCategory={activeCategory}
        activeTags={activeTags}
        categories={categories}
        tags={tags}
        counts={counts}
        onNavChange={handleNavChange}
        onCategoryChange={setActiveCategory}
        onTagToggle={toggleActiveTag}
        onCategoryContextMenu={handleCategoryContextMenu}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>

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
    </div>
  );
}
