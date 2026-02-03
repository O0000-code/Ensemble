import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Info, Puzzle, HardDrive, Store } from 'lucide-react';
import { useImportStore } from '@/stores/importStore';
import { usePluginsStore } from '@/stores/pluginsStore';
import { truncateToFirstSentence } from '@/utils/text';
import type { DetectedSkill } from '@/types';
import type { DetectedPluginSkill, PluginImportItem } from '@/types/plugin';

type TabType = 'claude' | 'plugin';

/**
 * ImportSkillsModal Component
 *
 * A modal dialog for importing detected Skills from ~/.claude/ directory.
 * Allows users to select which Skills to import with checkboxes.
 *
 * Design specs (updated):
 * - Modal: 520x580px, rounded-[16px], bg-white
 * - Overlay: bg-black/40
 * - Tab Row: justify-between, left tabs + right selection area
 * - Tab: padding 12px 16px, gap 8px, icon 14x14
 * - Active tab: #18181B, font-semibold, 2px bottom indicator
 * - Inactive tab: #71717A, font-normal, no indicator
 * - Local list item: Checkbox + Info(name + path), padding 10px 12px, gap 12px
 * - Plugin list item: Checkbox + Info(name row + description), padding 12px, gap 12px
 */
export function ImportSkillsModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportSkillsModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('claude');

  // Get detected skills from store (Claude Code)
  const {
    detectedSkills,
    isDetectingSkills,
    isImporting,
    importSkills,
    selectedItems,
    toggleItemSelection,
  } = useImportStore();

  // Get plugin skills from pluginsStore
  const {
    detectPluginSkillsForImport,
    importPluginSkills,
    isDetectingSkills: isDetectingPluginSkills,
    isImporting: isImportingPlugin,
    getUnimportedPluginSkills,
  } = usePluginsStore();

  // Track selected plugin skills
  const [selectedPluginSkills, setSelectedPluginSkills] = useState<Set<string>>(new Set());

  // Use directly from store (populated by openSkillsModal -> detectSkillsOnly)
  const isDetecting = isDetectingSkills;
  const totalSkills = detectedSkills.length;

  // Plugin skills
  const unimportedPluginSkills = getUnimportedPluginSkills();
  const totalPluginSkills = unimportedPluginSkills.length;
  const selectedPluginCount = selectedPluginSkills.size;
  const allPluginSelected = totalPluginSkills > 0 && selectedPluginCount === totalPluginSkills;

  // Track selected skill names for this modal
  const selectedSkillNames = new Set(
    selectedItems
      .filter((item) => item.type === 'skill')
      .map((item) => item.name)
  );
  const selectedCount = selectedSkillNames.size;

  // Determine if all skills are selected
  const allSelected = totalSkills > 0 && selectedCount === totalSkills;

  // Handle select all / deselect all for skills only (Claude Code tab)
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all skills
      selectedItems
        .filter((item) => item.type === 'skill')
        .forEach((item) => toggleItemSelection(item));
    } else {
      // Select all skills that aren't already selected
      detectedSkills.forEach((skill) => {
        if (!selectedSkillNames.has(skill.name)) {
          toggleItemSelection({
            type: 'skill',
            name: skill.name,
            sourcePath: skill.path,
          });
        }
      });
    }
  }, [allSelected, detectedSkills, selectedItems, selectedSkillNames, toggleItemSelection]);

  // Handle select all / deselect all for plugin skills
  const handleSelectAllPlugins = useCallback(() => {
    if (allPluginSelected) {
      setSelectedPluginSkills(new Set());
    } else {
      const allKeys = new Set(unimportedPluginSkills.map((s) => `${s.pluginId}|${s.skillName}`));
      setSelectedPluginSkills(allKeys);
    }
  }, [allPluginSelected, unimportedPluginSkills]);

  // Handle individual plugin skill toggle
  const handleTogglePluginSkill = useCallback((skill: DetectedPluginSkill) => {
    const key = `${skill.pluginId}|${skill.skillName}`;
    setSelectedPluginSkills((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Handle individual skill toggle
  const handleToggleSkill = useCallback(
    (skill: DetectedSkill) => {
      toggleItemSelection({
        type: 'skill',
        name: skill.name,
        sourcePath: skill.path,
      });
    },
    [toggleItemSelection]
  );

  // Handle import (Claude Code tab)
  const handleImport = useCallback(async () => {
    if (selectedCount === 0) return;

    // Build import items from selected skills
    const itemsToImport = selectedItems
      .filter((item) => item.type === 'skill')
      .map((item) => ({
        type: 'skill' as const,
        name: item.name,
        sourcePath: item.sourcePath,
      }));

    await importSkills(itemsToImport);
    onImportComplete?.();
    onClose();
  }, [selectedCount, selectedItems, importSkills, onImportComplete, onClose]);

  // Handle import plugin skills
  const handleImportPluginSkills = useCallback(async () => {
    if (selectedPluginCount === 0) return;

    // Build import items from selected plugin skills
    const itemsToImport: PluginImportItem[] = [];
    selectedPluginSkills.forEach((key) => {
      const [pluginId, skillName] = key.split('|');
      const skill = unimportedPluginSkills.find(
        (s) => s.pluginId === pluginId && s.skillName === skillName
      );
      if (skill) {
        itemsToImport.push({
          pluginId: skill.pluginId,
          pluginName: skill.pluginName,
          marketplace: skill.marketplace,
          itemName: skill.skillName,
          sourcePath: skill.path,
          version: skill.version,
        });
      }
    });

    await importPluginSkills(itemsToImport);
    setSelectedPluginSkills(new Set());
    onImportComplete?.();
    onClose();
  }, [selectedPluginCount, selectedPluginSkills, unimportedPluginSkills, importPluginSkills, onImportComplete, onClose]);

  // Handle Escape key press
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Detect plugin skills when modal opens (so tab count shows correct number)
  useEffect(() => {
    if (isOpen) {
      detectPluginSkillsForImport();
    }
  }, [isOpen, detectPluginSkillsForImport]);

  // Reset selected plugin skills when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPluginSkills(new Set());
      setActiveTab('claude');
    }
  }, [isOpen]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-[520px] h-[580px] bg-white rounded-[16px] flex flex-col overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.1)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between py-5 px-6 border-b border-[#E5E5E5]">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-[#18181B]">
              Import Skills
            </h2>
            <p className="text-[13px] font-normal text-[#71717A]">
              {activeTab === 'claude'
                ? `Found ${totalSkills} Skills on your system`
                : `Found ${totalPluginSkills} Plugin Skills available`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-[18px] h-[18px] text-[#A1A1AA]" />
          </button>
        </div>

        {/* Tab Row - justify-between with tabs left, selection right */}
        <div className="flex items-center justify-between px-6 border-b border-[#E5E5E5]">
          {/* Left side: Tabs */}
          <div className="flex items-center">
            <button
              onClick={() => setActiveTab('claude')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'claude'
                  ? 'border-[#18181B]'
                  : 'border-transparent'
              }`}
            >
              <HardDrive
                className={`w-3.5 h-3.5 ${
                  activeTab === 'claude' ? 'text-[#18181B]' : 'text-[#71717A]'
                }`}
              />
              <span
                className={`text-[13px] ${
                  activeTab === 'claude'
                    ? 'font-semibold text-[#18181B]'
                    : 'font-normal text-[#71717A]'
                }`}
              >
                Local
              </span>
              <span
                className={`rounded-[10px] px-2 py-0.5 text-[11px] font-medium ${
                  activeTab === 'claude'
                    ? 'bg-[#F4F4F5] text-[#52525B]'
                    : 'bg-[#F4F4F5] text-[#A1A1AA]'
                }`}
              >
                {totalSkills}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('plugin')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'plugin'
                  ? 'border-[#18181B]'
                  : 'border-transparent'
              }`}
            >
              <Puzzle
                className={`w-3.5 h-3.5 ${
                  activeTab === 'plugin' ? 'text-[#18181B]' : 'text-[#71717A]'
                }`}
              />
              <span
                className={`text-[13px] ${
                  activeTab === 'plugin'
                    ? 'font-semibold text-[#18181B]'
                    : 'font-normal text-[#71717A]'
                }`}
              >
                Plugins
              </span>
              <span
                className={`rounded-[10px] px-2 py-0.5 text-[11px] font-medium ${
                  activeTab === 'plugin'
                    ? 'bg-[#F4F4F5] text-[#52525B]'
                    : 'bg-[#F4F4F5] text-[#A1A1AA]'
                }`}
              >
                {totalPluginSkills}
              </span>
            </button>
          </div>

          {/* Right side: Divider + Count + Divider + All Checkbox */}
          <div className="flex items-center gap-3">
            {/* Divider */}
            <div className="w-px h-4 bg-[#E5E5E5]" />
            {/* Count */}
            <span className="text-[12px] font-normal text-[#A1A1AA]">
              {activeTab === 'claude' ? `${selectedCount}/${totalSkills}` : `${selectedPluginCount}/${totalPluginSkills}`}
            </span>
            {/* Divider */}
            <div className="w-px h-4 bg-[#E5E5E5]" />
            {/* All Checkbox */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={activeTab === 'claude' ? handleSelectAll : handleSelectAllPlugins}
            >
              {(activeTab === 'claude' ? allSelected : allPluginSelected) ? (
                <div className="w-4 h-4 rounded-[4px] bg-[#18181B] flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-[#D4D4D8] bg-transparent" />
              )}
              <span className="text-[13px] font-medium text-[#18181B]">
                All
              </span>
            </div>
          </div>
        </div>

        {/* Claude Code Tab Content */}
        {activeTab === 'claude' && (
          <>
            {/* Modal Body - Scrollable Skills List */}
            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
              {isDetecting ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    Detecting skills...
                  </span>
                </div>
              ) : detectedSkills.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    No skills found
                  </span>
                </div>
              ) : (
                detectedSkills.map((skill) => {
                  const isSelected = selectedSkillNames.has(skill.name);
                  return (
                    <div
                      key={skill.name}
                      onClick={() => handleToggleSkill(skill)}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-[6px] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                    >
                      {/* Checkbox - 16x16 */}
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-[4px] bg-[#18181B] flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-[#D4D4D8] bg-transparent flex-shrink-0" />
                      )}
                      {/* Skill Info - gap 2px */}
                      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-medium text-[#18181B] truncate">
                          {skill.name}
                        </span>
                        <span className="text-[11px] font-normal text-[#A1A1AA] truncate">
                          {skill.path}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between py-4 px-6 border-t border-[#E5E5E5]">
              {/* Info Button */}
              <button
                className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors"
                aria-label="More information"
              >
                <Info className="w-4 h-4 text-[#A1A1AA]" />
              </button>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedCount === 0 || isImporting}
                  className={`h-[36px] px-5 rounded-[6px] text-[13px] font-medium text-white transition-colors
                    ${
                      selectedCount === 0 || isImporting
                        ? 'bg-[#18181B]/50 cursor-not-allowed'
                        : 'bg-[#18181B] hover:bg-[#27272A]'
                    }
                  `}
                >
                  {isImporting ? 'Importing...' : 'Import Selected'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Plugin Tab Content */}
        {activeTab === 'plugin' && (
          <>
            {/* Modal Body - Scrollable Plugin Skills List */}
            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
              {isDetectingPluginSkills ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    Detecting plugin skills...
                  </span>
                </div>
              ) : unimportedPluginSkills.length === 0 ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <Puzzle className="w-8 h-8 text-[#D4D4D8]" />
                  <span className="text-[13px] text-[#71717A]">
                    No plugin skills available
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Install plugins with skills to import them here
                  </span>
                </div>
              ) : (
                unimportedPluginSkills.map((skill) => {
                  const key = `${skill.pluginId}|${skill.skillName}`;
                  const isSelected = selectedPluginSkills.has(key);
                  return (
                    <div
                      key={key}
                      onClick={() => handleTogglePluginSkill(skill)}
                      className="flex items-center gap-3 p-3 rounded-[6px] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                    >
                      {/* Checkbox - 16x16 */}
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-[4px] bg-[#18181B] flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-[#D4D4D8] bg-transparent flex-shrink-0" />
                      )}
                      {/* Plugin Skill Info - gap 4px */}
                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        {/* Name row with Marketplace label - gap 8px */}
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#18181B] truncate">
                            {skill.skillName}
                          </span>
                          {/* Marketplace indicator */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Store className="w-[9px] h-[9px] text-[#A1A1AA]" />
                            <span className="text-[11px] font-normal text-[#A1A1AA]">
                              {skill.marketplace}
                            </span>
                          </div>
                        </div>
                        {/* Description - 12px #71717A, truncated to first sentence */}
                        {skill.description && (
                          <span className="text-[12px] font-normal text-[#71717A] truncate">
                            {truncateToFirstSentence(skill.description, 100)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between py-4 px-6 border-t border-[#E5E5E5]">
              {/* Info Button */}
              <button
                className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors"
                aria-label="More information"
              >
                <Info className="w-4 h-4 text-[#A1A1AA]" />
              </button>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportPluginSkills}
                  disabled={selectedPluginCount === 0 || isImportingPlugin}
                  className={`h-[36px] px-5 rounded-[6px] text-[13px] font-medium text-white transition-colors
                    ${
                      selectedPluginCount === 0 || isImportingPlugin
                        ? 'bg-[#18181B]/50 cursor-not-allowed'
                        : 'bg-[#18181B] hover:bg-[#27272A]'
                    }
                  `}
                >
                  {isImportingPlugin ? 'Importing...' : 'Import Selected'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ImportSkillsModal;
