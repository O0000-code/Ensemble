import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/layout/PageHeader';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import { IconPicker } from '@/components/common';
import SkillItem from '../components/skills/SkillItem';
import { useSkillsStore } from '../stores/skillsStore';

// ============================================================================
// SkillsPage Component
// ============================================================================

export function SkillsPage() {
  const navigate = useNavigate();
  const {
    skills,
    filter,
    setFilter,
    toggleSkill,
    updateSkillIcon,
    getFilteredSkills,
    getEnabledCount,
    autoClassify,
    isClassifying,
    error,
    clearError,
  } = useSkillsStore();

  const filteredSkills = getFilteredSkills();
  const enabledCount = getEnabledCount();

  // Icon Picker state
  const [iconPickerState, setIconPickerState] = useState<{
    isOpen: boolean;
    skillId: string | null;
    triggerRef: React.RefObject<HTMLDivElement> | null;
  }>({ isOpen: false, skillId: null, triggerRef: null });

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

  // Handle icon click
  const handleIconClick = (skillId: string, ref: React.RefObject<HTMLDivElement>) => {
    setIconPickerState({ isOpen: true, skillId, triggerRef: ref });
  };

  // Handle icon change
  const handleIconChange = (iconName: string) => {
    if (iconPickerState.skillId) {
      updateSkillIcon(iconPickerState.skillId, iconName);
    }
    setIconPickerState({ isOpen: false, skillId: null, triggerRef: null });
  };

  // Handle icon picker close
  const handleIconPickerClose = () => {
    setIconPickerState({ isOpen: false, skillId: null, triggerRef: null });
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
                onIconClick={(ref) => handleIconClick(skill.id, ref)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Icon Picker */}
      {iconPickerState.triggerRef && (
        <IconPicker
          value={skills.find((s) => s.id === iconPickerState.skillId)?.icon || 'sparkles'}
          onChange={handleIconChange}
          triggerRef={iconPickerState.triggerRef}
          isOpen={iconPickerState.isOpen}
          onClose={handleIconPickerClose}
        />
      )}
    </div>
  );
}

export default SkillsPage;
