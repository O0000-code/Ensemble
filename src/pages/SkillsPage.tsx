import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { FilteredEmptyState } from '../components/common/FilteredEmptyState';
import SkillItem from '../components/skills/SkillItem';
import { useSkillsStore } from '../stores/skillsStore';

// ============================================================================
// SkillsPage Component
// ============================================================================

export function SkillsPage() {
  const navigate = useNavigate();
  const {
    filter,
    setFilter,
    toggleSkill,
    getFilteredSkills,
    getEnabledCount,
    autoClassify,
    isClassifying,
    error,
    clearError,
  } = useSkillsStore();

  const filteredSkills = getFilteredSkills();
  const enabledCount = getEnabledCount();

  // Calculate empty state related variables
  const showEmptyState = filteredSkills.length === 0;
  const isFilteredByCategory = !!filter.category;
  const isFilteredByTag = filter.tags.length > 0;
  const shouldHideBadge = showEmptyState && (isFilteredByCategory || isFilteredByTag);

  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleSkillClick = (skillId: string) => {
    navigate(`/skills/${encodeURIComponent(skillId)}`);
  };

  const handleToggle = (skillId: string, _enabled: boolean) => {
    toggleSkill(skillId);
  };

  const handleAutoClassify = async () => {
    await autoClassify();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeader
        title="Skills"
        badge={
          !shouldHideBadge && enabledCount > 0 && (
            <Badge variant="status">
              {enabledCount} enabled
            </Badge>
          )
        }
        searchValue={filter.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search skills..."
        actions={
          <Button
            variant="secondary"
            size="small"
            icon={isClassifying ? <Loader2 className="animate-spin" /> : <Sparkles />}
            onClick={handleAutoClassify}
            disabled={isClassifying}
          >
            {isClassifying ? 'Classifying...' : 'Auto Classify'}
          </Button>
        }
      />

      {/* Error notification */}
      {error && (
        <div className="mx-7 mt-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={clearError}
            className="text-sm font-medium text-red-700 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {showEmptyState ? (
          isFilteredByCategory ? (
            <FilteredEmptyState type="category" />
          ) : isFilteredByTag ? (
            <FilteredEmptyState type="tag" />
          ) : filter.search ? (
            <EmptyState
              icon={<Sparkles className="h-12 w-12" />}
              title="No skills"
              description="No skills match your search. Try a different query."
            />
          ) : (
            <EmptyState
              icon={<Sparkles className="h-12 w-12" />}
              title="No skills"
              description="Add your first skill to get started"
            />
          )
        ) : (
          <div className="flex flex-col gap-3">
            {filteredSkills.map((skill) => (
              <SkillItem
                key={skill.id}
                skill={skill}
                variant="full"
                onClick={() => handleSkillClick(skill.id)}
                onToggle={(enabled) => handleToggle(skill.id, enabled)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SkillsPage;
