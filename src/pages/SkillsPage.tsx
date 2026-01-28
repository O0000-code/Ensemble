import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
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
  } = useSkillsStore();

  const filteredSkills = getFilteredSkills();
  const enabledCount = getEnabledCount();

  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleSkillClick = (skillId: string) => {
    navigate(`/skills/${skillId}`);
  };

  const handleToggle = (skillId: string, _enabled: boolean) => {
    toggleSkill(skillId);
  };

  const handleAutoClassify = () => {
    // TODO: Implement auto-classify functionality
    console.log('Auto classify triggered');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <PageHeader
        title="Skills"
        badge={
          enabledCount > 0 && (
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
            icon={<Sparkles />}
            onClick={handleAutoClassify}
          >
            Auto Classify
          </Button>
        }
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {filteredSkills.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-12 w-12" />}
            title="No skills"
            description={
              filter.search
                ? 'No skills match your search. Try a different query.'
                : 'Add your first skill to get started'
            }
          />
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
