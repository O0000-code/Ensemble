import React, { useMemo, useState } from 'react';
import { Plus, Folder } from 'lucide-react';
import { PageHeader, SlidePanel } from '../components/layout';
import { Button, EmptyState, IconPicker } from '../components/common';
import { NewProjectItem, ProjectConfigPanel, ProjectCard } from '../components/projects';
import { useProjectsStore } from '../stores/projectsStore';
import { useScenesStore } from '../stores/scenesStore';
import type { Scene } from '../types';

// ============================================================================
// ProjectsPage Component
// ============================================================================
// Layout: Unified layout with SlidePanel for detail view
// - Empty state: PageHeader + Centered Empty State
// - List state: PageHeader + Project Cards with optional SlidePanel
// Design reference: design-spec-projects.md

/**
 * ProjectsPage displays the projects management interface.
 *
 * States and Layouts:
 * - Empty (projects.length === 0 && !isCreating): Two-column, empty state centered
 * - List/Detail (projects.length > 0 || isCreating): Project cards with SlidePanel for detail
 */
export function ProjectsPage() {
  const {
    projects,
    selectedProjectId,
    isCreating,
    filter,
    newProject,
    setFilter,
    selectProject,
    startCreating,
    cancelCreating,
    updateNewProject,
    createProject,
    updateProject,
    syncProject,
    clearProjectConfig,
    selectProjectFolder,
  } = useProjectsStore();

  // Get scenes from scenesStore
  const scenes = useScenesStore((state) => state.scenes);

  // Icon Picker state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    projectId: string | null;
    triggerRef: React.RefObject<HTMLDivElement> | null;
  }>({ isOpen: false, projectId: null, triggerRef: null });

  // Handle icon click
  const handleIconClick = (projectId: string, ref: React.RefObject<HTMLDivElement>) => {
    setIconPickerState({ isOpen: true, projectId, triggerRef: ref });
  };

  // Handle icon change
  const handleIconChange = (iconName: string) => {
    if (iconPickerState.projectId) {
      updateProject(iconPickerState.projectId, { icon: iconName });
    }
    setIconPickerState({ isOpen: false, projectId: null, triggerRef: null });
  };

  // Handle icon picker close
  const handleIconPickerClose = () => {
    setIconPickerState({ isOpen: false, projectId: null, triggerRef: null });
  };

  // Handle close detail panel
  const handleCloseDetail = () => {
    if (isCreating) {
      cancelCreating();
    } else {
      selectProject(null);
    }
  };

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    if (!filter.search) return projects;
    const query = filter.search.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.path.toLowerCase().includes(query)
    );
  }, [projects, filter.search]);

  // Get selected project
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  // Get scene for selected project
  const selectedScene = useMemo(
    (): Scene | undefined => scenes.find((s) => s.id === selectedProject?.sceneId),
    [selectedProject, scenes]
  );

  // Check if detail panel should be open
  const isDetailOpen = !!selectedProjectId || isCreating;

  // ============================================================================
  // State 1: Empty State Page
  // ============================================================================
  // Condition: No projects and not in creating mode
  // Layout: PageHeader + Centered Empty State

  if (projects.length === 0 && !isCreating) {
    return (
      <>
        {/* Header with "New Project" button */}
        <PageHeader
          title="Projects"
          actions={
            <Button
              variant="primary"
              size="small"
              icon={<Plus />}
              onClick={startCreating}
            >
              New Project
            </Button>
          }
        />

        {/* Empty State Content - Centered */}
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-5">
            {/* Folder Icon */}
            <Folder
              className="h-8 w-8 text-[#D4D4D8]"
              strokeWidth={1.5}
            />
            {/* Text Group */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-sm font-medium tracking-[-0.2px] text-[#A1A1AA]">
                No projects
              </span>
              <span className="text-[13px] text-[#D4D4D8] text-center">
                Add a project folder to get started
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ============================================================================
  // State 2 & 3: List State with Optional SlidePanel
  // ============================================================================
  // Condition: Has projects or in creating mode
  // Layout: PageHeader + Project Cards + SlidePanel (when detail is open)

  // Detail Header content
  const detailHeader = isCreating ? (
    <h2 className="text-[16px] font-semibold text-[#18181B]">
      New Project Configuration
    </h2>
  ) : selectedProject ? (
    <h2 className="text-[16px] font-semibold text-[#18181B]">
      Project Configuration
    </h2>
  ) : null;

  // Detail Header right content
  const detailHeaderRight = isCreating ? (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="small" onClick={cancelCreating}>
        Cancel
      </Button>
      <Button
        variant="primary"
        size="small"
        onClick={createProject}
        disabled={!newProject.name || !newProject.path}
      >
        Create Project
      </Button>
    </div>
  ) : selectedProject ? (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="small"
        icon={<Folder className="h-3.5 w-3.5" />}
        onClick={() => {
          // Open folder in system file manager
          console.log('Open folder:', selectedProject.path);
        }}
      >
        Open Folder
      </Button>
    </div>
  ) : null;

  // Detail Content
  const detailContent = isCreating ? (
    <ProjectConfigPanel
      project={null}
      scenes={scenes}
      isEditing
      formData={newProject}
      onFormChange={updateNewProject}
      onSave={createProject}
      onCancel={cancelCreating}
      onBrowse={selectProjectFolder}
    />
  ) : selectedProject ? (
    <ProjectConfigPanel
      project={selectedProject}
      scene={selectedScene}
      scenes={scenes}
      onOpenFolder={() => console.log('Open folder:', selectedProject.path)}
      onChangeScene={(sceneId) => updateProject(selectedProject.id, { sceneId })}
      onSync={() => syncProject(selectedProject.id)}
      onClearConfig={() => clearProjectConfig(selectedProject.id)}
      onIconClick={(ref) => handleIconClick(selectedProject.id, ref)}
    />
  ) : null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Header with Search and New Project button */}
      <PageHeader
        title="Projects"
        searchValue={filter.search}
        onSearchChange={(value) => setFilter({ search: value })}
        searchPlaceholder="Search projects..."
        actions={
          <Button
            variant="primary"
            size="small"
            icon={<Plus />}
            onClick={startCreating}
          >
            New Project
          </Button>
        }
      />

      {/* Main Content Area - with shrink animation */}
      <div
        className={`
          flex-1 overflow-y-auto px-7 py-6
          transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isDetailOpen ? 'mr-[800px]' : ''}
        `}
      >
        {/* Project Cards */}
        <div className="flex flex-col gap-3">
          {/* New Project Item (when creating) */}
          {isCreating && (
            <NewProjectItem
              name={newProject.name || 'New Project'}
              path={newProject.path || 'Click to configure path...'}
            />
          )}

          {/* Existing Project Cards */}
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => {
              const scene = scenes.find((s) => s.id === project.sceneId);
              return (
                <ProjectCard
                  key={project.id}
                  project={project}
                  scene={scene}
                  selected={selectedProjectId === project.id && !isCreating}
                  onClick={() => selectProject(project.id)}
                />
              );
            })
          ) : !isCreating ? (
            // No results from search
            <div className="flex h-full items-center justify-center py-20">
              <EmptyState
                icon={<Folder className="h-8 w-8" strokeWidth={1.5} />}
                title="No matching projects"
                description="Try adjusting your search query"
              />
            </div>
          ) : null}
        </div>
      </div>

      {/* Slide Panel for Detail View */}
      <SlidePanel
        isOpen={isDetailOpen}
        onClose={handleCloseDetail}
        width={800}
        header={detailHeader}
        headerRight={detailHeaderRight}
      >
        {detailContent}
      </SlidePanel>

      {/* Icon Picker */}
      {iconPickerState.triggerRef && (
        <IconPicker
          value={projects.find((p) => p.id === iconPickerState.projectId)?.icon || 'folder'}
          onChange={handleIconChange}
          triggerRef={iconPickerState.triggerRef}
          isOpen={iconPickerState.isOpen}
          onClose={handleIconPickerClose}
        />
      )}
    </div>
  );
}

export default ProjectsPage;
