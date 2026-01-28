import { useMemo } from 'react';
import { Plus, Folder, ArrowLeft } from 'lucide-react';
import { ListDetailLayout } from '../components/layout/ListDetailLayout';
import { SearchInput, Button, EmptyState } from '../components/common';
import { ProjectItem, NewProjectItem, ProjectConfigPanel } from '../components/projects';
import { useProjectsStore, mockScenes } from '../stores/projectsStore';

// ============================================================================
// ProjectsPage Component
// ============================================================================
// Layout: ListDetailLayout with listWidth=400
// Design reference: 06-projects-design.md

/**
 * ProjectsPage displays the projects management interface.
 *
 * Structure:
 * - List Panel (400px): Projects list with search and add functionality
 * - Detail Panel (fill): Project configuration view or edit form
 *
 * States:
 * - Normal: List + selected project details
 * - Creating: List with new project item + create form
 * - Empty: Empty states for both panels
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
  } = useProjectsStore();

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
    () => mockScenes.find((s) => s.id === selectedProject?.sceneId),
    [selectedProject]
  );

  // ============================================================================
  // List Header
  // ============================================================================

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

  // ============================================================================
  // List Content
  // ============================================================================

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
          const scene = mockScenes.find((s) => s.id === project.sceneId);
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

  // ============================================================================
  // Detail Header
  // ============================================================================

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

  // ============================================================================
  // Detail Content
  // ============================================================================

  const detailContent = isCreating ? (
    <ProjectConfigPanel
      project={null}
      scenes={mockScenes}
      isEditing
      formData={newProject}
      onFormChange={updateNewProject}
      onSave={createProject}
      onCancel={cancelCreating}
      onBrowse={() => {
        // In Electron: would open file dialog
        console.log('Browse for folder');
      }}
    />
  ) : selectedProject ? (
    <ProjectConfigPanel
      project={selectedProject}
      scene={selectedScene}
      scenes={mockScenes}
      onOpenFolder={() => console.log('Open folder:', selectedProject.path)}
      onChangeScene={(sceneId) => updateProject(selectedProject.id, { sceneId })}
      onSync={() => syncProject(selectedProject.id)}
      onClearConfig={() => clearProjectConfig(selectedProject.id)}
    />
  ) : null;

  // ============================================================================
  // Empty Detail State
  // ============================================================================

  const emptyDetail = (
    <div className="flex flex-col items-center justify-center gap-3.5">
      <ArrowLeft className="h-6 w-4 text-[#D4D4D8]" strokeWidth={1.5} />
      <span className="text-[13px] font-medium tracking-[-0.2px] text-[#A1A1AA]">
        Select a project
      </span>
    </div>
  );

  // ============================================================================
  // Render
  // ============================================================================

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
