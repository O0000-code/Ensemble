import { useMemo } from 'react';
import { Plus, Folder, ArrowLeft } from 'lucide-react';
import { ListDetailLayout } from '../components/layout/ListDetailLayout';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchInput, Button, EmptyState } from '../components/common';
import { ProjectItem, NewProjectItem, ProjectConfigPanel, ProjectCard } from '../components/projects';
import { useProjectsStore } from '../stores/projectsStore';
import { useScenesStore } from '../stores/scenesStore';
import type { Scene } from '../types';

// ============================================================================
// ProjectsPage Component
// ============================================================================
// Layout: Depends on state
// - Empty state: Two-column layout (Sidebar + Main Content)
// - List state: Two-column layout (Sidebar + Main Content with cards)
// - Detail/Create state: Three-column layout (ListDetailLayout)
// Design reference: design-spec-projects.md

/**
 * ProjectsPage displays the projects management interface.
 *
 * States and Layouts:
 * - Empty (projects.length === 0 && !isCreating): Two-column, empty state centered
 * - List (projects.length > 0 && !selectedProjectId && !isCreating): Two-column, project cards
 * - Detail/Create (selectedProjectId || isCreating): Three-column ListDetailLayout
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

  // ============================================================================
  // State 1: Empty State Page (Two-Column Layout)
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
  // State 2: List Page (Two-Column Layout)
  // ============================================================================
  // Condition: Has projects, no selection, not creating
  // Layout: PageHeader with Search + Project Cards Grid

  if (projects.length > 0 && !selectedProjectId && !isCreating) {
    return (
      <>
        {/* Header with Search */}
        <PageHeader
          title="Projects"
          searchValue={filter.search}
          onSearchChange={(value) => setFilter({ search: value })}
          searchPlaceholder="Search projects..."
        />

        {/* Content Area with Project Cards */}
        <div className="flex-1 overflow-y-auto py-6 px-7">
          {filteredProjects.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredProjects.map((project) => {
                const scene = scenes.find((s) => s.id === project.sceneId);
                return (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    scene={scene}
                    onClick={() => selectProject(project.id)}
                  />
                );
              })}
            </div>
          ) : (
            // No results from search
            <div className="flex h-full items-center justify-center">
              <EmptyState
                icon={<Folder className="h-8 w-8" strokeWidth={1.5} />}
                title="No matching projects"
                description="Try adjusting your search query"
              />
            </div>
          )}
        </div>
      </>
    );
  }

  // ============================================================================
  // State 3: Detail/Create Page (Three-Column Layout)
  // ============================================================================
  // Condition: Has selected project or in creating mode
  // Layout: ListDetailLayout (existing implementation)

  // List Header
  const listHeader = (
    <>
      <h2 className="text-[16px] font-semibold text-[#18181B]">Projects</h2>
      <div className="flex items-center gap-2">
        {isCreating ? (
          // In creating mode: show Add button
          <Button
            variant="primary"
            size="small"
            iconOnly
            icon={<Plus />}
            disabled
          />
        ) : (
          // Normal mode: show Search + Add button
          <>
            <SearchInput
              value={filter.search}
              onChange={(value) => setFilter({ search: value })}
              placeholder="Search projects..."
              className="!w-[160px]"
            />
            <Button
              variant="primary"
              size="small"
              iconOnly
              icon={<Plus />}
              onClick={startCreating}
            />
          </>
        )}
      </div>
    </>
  );

  // List Content
  const listContent = (
    <div className="flex flex-col gap-1">
      {/* New Project Item (when creating) */}
      {isCreating && (
        <NewProjectItem
          name={newProject.name || 'New Project'}
          path={newProject.path || 'Click to configure path...'}
        />
      )}

      {/* Project Items */}
      {filteredProjects.length > 0 ? (
        filteredProjects.map((project) => {
          const scene = scenes.find((s) => s.id === project.sceneId);
          return (
            <ProjectItem
              key={project.id}
              project={project}
              scene={scene}
              selected={selectedProjectId === project.id && !isCreating}
              onClick={() => selectProject(project.id)}
            />
          );
        })
      ) : !isCreating ? (
        // Empty state for list
        <div className="flex h-full items-center justify-center py-20">
          <EmptyState
            icon={<Folder className="h-8 w-8" strokeWidth={1.5} />}
            title="No projects"
            description="Open a folder to start"
          />
        </div>
      ) : null}
    </div>
  );

  // Detail Header
  const detailHeader = isCreating ? (
    <>
      <h2 className="text-[16px] font-semibold text-[#18181B]">
        New Project Configuration
      </h2>
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
    </>
  ) : selectedProject ? (
    <>
      <h2 className="text-[16px] font-semibold text-[#18181B]">
        Project Configuration
      </h2>
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
    </>
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
    />
  ) : null;

  // Empty Detail State
  const emptyDetail = (
    <div className="flex flex-col items-center justify-center gap-3.5">
      <ArrowLeft className="h-6 w-4 text-[#D4D4D8]" strokeWidth={1.5} />
      <span className="text-[13px] font-medium tracking-[-0.2px] text-[#A1A1AA]">
        Select a project
      </span>
    </div>
  );

  // Render Three-Column Layout
  return (
    <ListDetailLayout
      listWidth={400}
      listHeader={listHeader}
      listContent={listContent}
      detailHeader={detailHeader}
      detailContent={detailContent}
      emptyDetail={emptyDetail}
    />
  );
}

export default ProjectsPage;
