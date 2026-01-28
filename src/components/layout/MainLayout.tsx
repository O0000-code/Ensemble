import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import ContextMenu from '../common/ContextMenu';
import { useAppStore } from '@/stores/appStore';
import { Pencil, Trash2 } from 'lucide-react';
import type { Category } from '@/types';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    activeCategory,
    activeTags,
    categories,
    tags,
    counts,
    setActiveCategory,
    toggleActiveTag,
  } = useAppStore();

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
