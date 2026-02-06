import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Info, Wand2, Server, FileText } from 'lucide-react';
import { useTrashStore } from '@/stores/trashStore';
import { Tooltip } from '@/components/common/Tooltip';
import type { TrashedSkill, TrashedMcp, TrashedClaudeMd } from '@/types';

type TabType = 'skills' | 'mcps' | 'claudemd';

interface TrashRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreComplete?: () => void;
}

/**
 * Format deleted time to human-readable string
 */
function formatDeletedTime(deletedAt: string): string {
  const deleted = new Date(deletedAt);
  const now = new Date();
  const diffMs = now.getTime() - deleted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Deleted today';
  } else if (diffDays === 1) {
    return 'Deleted yesterday';
  } else if (diffDays < 7) {
    return `Deleted ${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Deleted ${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    return deleted.toLocaleDateString();
  }
}

/**
 * TrashRecoveryModal Component
 *
 * A modal dialog for recovering deleted Skills, MCPs, and CLAUDE.md files.
 * Follows the same design specs as ImportSkillsModal for consistency.
 *
 * Design specs:
 * - Modal: 520x580px, rounded-[16px], bg-white
 * - Overlay: bg-black/40
 * - Three tabs: Skills, MCPs, CLAUDE.md
 * - Tab badges show count of deleted items
 * - List items with checkboxes for multi-select recovery
 */
export function TrashRecoveryModal({
  isOpen,
  onClose,
  onRestoreComplete,
}: TrashRecoveryModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('skills');

  // Track selected items per tab
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedMcps, setSelectedMcps] = useState<Set<string>>(new Set());
  const [selectedClaudeMd, setSelectedClaudeMd] = useState<Set<string>>(new Set());

  // Get trash store state
  const {
    trashedItems,
    isLoading,
    isRestoring,
    loadTrashedItems,
    restoreSkill,
    restoreMcp,
    restoreClaudeMd,
    clearError,
  } = useTrashStore();

  // Local error state for showing restore errors
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Counts
  const skillsCount = trashedItems?.skills.length || 0;
  const mcpsCount = trashedItems?.mcps.length || 0;
  const claudeMdCount = trashedItems?.claudeMdFiles.length || 0;
  const totalCount = skillsCount + mcpsCount + claudeMdCount;

  // Current tab counts
  const currentSelected = activeTab === 'skills'
    ? selectedSkills.size
    : activeTab === 'mcps'
    ? selectedMcps.size
    : selectedClaudeMd.size;

  const currentTotal = activeTab === 'skills'
    ? skillsCount
    : activeTab === 'mcps'
    ? mcpsCount
    : claudeMdCount;

  const allSelected = currentTotal > 0 && currentSelected === currentTotal;

  // Handle select all / deselect all for current tab
  const handleSelectAll = useCallback(() => {
    if (activeTab === 'skills') {
      if (allSelected) {
        setSelectedSkills(new Set());
      } else {
        setSelectedSkills(new Set(trashedItems?.skills.map((s) => s.path) || []));
      }
    } else if (activeTab === 'mcps') {
      if (allSelected) {
        setSelectedMcps(new Set());
      } else {
        setSelectedMcps(new Set(trashedItems?.mcps.map((m) => m.path) || []));
      }
    } else {
      if (allSelected) {
        setSelectedClaudeMd(new Set());
      } else {
        setSelectedClaudeMd(new Set(trashedItems?.claudeMdFiles.map((c) => c.path) || []));
      }
    }
  }, [activeTab, allSelected, trashedItems]);

  // Handle individual item toggle
  const handleToggleSkill = useCallback((skill: TrashedSkill) => {
    setSelectedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill.path)) {
        next.delete(skill.path);
      } else {
        next.add(skill.path);
      }
      return next;
    });
  }, []);

  const handleToggleMcp = useCallback((mcp: TrashedMcp) => {
    setSelectedMcps((prev) => {
      const next = new Set(prev);
      if (next.has(mcp.path)) {
        next.delete(mcp.path);
      } else {
        next.add(mcp.path);
      }
      return next;
    });
  }, []);

  const handleToggleClaudeMd = useCallback((claudeMd: TrashedClaudeMd) => {
    setSelectedClaudeMd((prev) => {
      const next = new Set(prev);
      if (next.has(claudeMd.path)) {
        next.delete(claudeMd.path);
      } else {
        next.add(claudeMd.path);
      }
      return next;
    });
  }, []);

  // Handle restore
  const handleRestore = useCallback(async () => {
    const totalSelected = selectedSkills.size + selectedMcps.size + selectedClaudeMd.size;
    if (totalSelected === 0) return;

    // Clear any previous error
    setRestoreError(null);
    clearError();

    let successCount = 0;
    let failCount = 0;
    let lastError = '';

    // Restore skills
    for (const path of selectedSkills) {
      const result = await restoreSkill(path);
      if (result) {
        successCount++;
      } else {
        failCount++;
        lastError = useTrashStore.getState().error || 'Failed to restore skill';
      }
    }

    // Restore MCPs
    for (const path of selectedMcps) {
      const result = await restoreMcp(path);
      if (result) {
        successCount++;
      } else {
        failCount++;
        lastError = useTrashStore.getState().error || 'Failed to restore MCP';
      }
    }

    // Restore CLAUDE.md files
    for (const path of selectedClaudeMd) {
      const result = await restoreClaudeMd(path);
      if (result) {
        successCount++;
      } else {
        failCount++;
        lastError = useTrashStore.getState().error || 'Failed to restore CLAUDE.md';
      }
    }

    // Clear selections for successfully restored items
    setSelectedSkills(new Set());
    setSelectedMcps(new Set());
    setSelectedClaudeMd(new Set());

    // Show error if any failed
    if (failCount > 0) {
      if (failCount === 1) {
        setRestoreError(lastError);
      } else {
        setRestoreError(`${failCount} items could not be restored. ${lastError}`);
      }
    }

    if (successCount > 0) {
      onRestoreComplete?.();
    }
  }, [selectedSkills, selectedMcps, selectedClaudeMd, restoreSkill, restoreMcp, restoreClaudeMd, clearError, onRestoreComplete]);

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

  // Load trashed items when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTrashedItems();
    }
  }, [isOpen, loadTrashedItems]);

  // Reset selections and errors when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedSkills(new Set());
      setSelectedMcps(new Set());
      setSelectedClaudeMd(new Set());
      setActiveTab('skills');
      setRestoreError(null);
      clearError();
    }
  }, [isOpen, clearError]);

  // Handle overlay click
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  // Total selected across all tabs
  const totalSelectedCount = selectedSkills.size + selectedMcps.size + selectedClaudeMd.size;

  const modalContent = (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div className="w-[520px] h-[580px] bg-white rounded-[16px] flex flex-col overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.1)]">
        {/* Modal Header - 80px height */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#E5E5E5]">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-[#18181B]">
              Recover Deleted Items
            </h2>
            <p className="text-[13px] font-normal text-[#71717A]">
              Found {totalCount} {totalCount === 1 ? 'item' : 'items'} in trash
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
            {/* Skills Tab */}
            <button
              onClick={() => setActiveTab('skills')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'skills'
                  ? 'border-[#18181B]'
                  : 'border-transparent'
              }`}
            >
              <Wand2
                className={`w-3.5 h-3.5 ${
                  activeTab === 'skills' ? 'text-[#18181B]' : 'text-[#71717A]'
                }`}
              />
              <span
                className={`text-[13px] ${
                  activeTab === 'skills'
                    ? 'font-semibold text-[#18181B]'
                    : 'font-normal text-[#71717A]'
                }`}
              >
                Skills
              </span>
            </button>

            {/* MCPs Tab */}
            <button
              onClick={() => setActiveTab('mcps')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'mcps'
                  ? 'border-[#18181B]'
                  : 'border-transparent'
              }`}
            >
              <Server
                className={`w-3.5 h-3.5 ${
                  activeTab === 'mcps' ? 'text-[#18181B]' : 'text-[#71717A]'
                }`}
              />
              <span
                className={`text-[13px] ${
                  activeTab === 'mcps'
                    ? 'font-semibold text-[#18181B]'
                    : 'font-normal text-[#71717A]'
                }`}
              >
                MCPs
              </span>
            </button>

            {/* CLAUDE.md Tab */}
            <button
              onClick={() => setActiveTab('claudemd')}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors ${
                activeTab === 'claudemd'
                  ? 'border-[#18181B]'
                  : 'border-transparent'
              }`}
            >
              <FileText
                className={`w-3.5 h-3.5 ${
                  activeTab === 'claudemd' ? 'text-[#18181B]' : 'text-[#71717A]'
                }`}
              />
              <span
                className={`text-[13px] ${
                  activeTab === 'claudemd'
                    ? 'font-semibold text-[#18181B]'
                    : 'font-normal text-[#71717A]'
                }`}
              >
                CLAUDE.md
              </span>
            </button>
          </div>

          {/* Right side: Divider + Count + Divider + All Checkbox */}
          <div className="flex items-center gap-3">
            {/* Divider */}
            <div className="w-px h-4 bg-[#E5E5E5]" />
            {/* Count */}
            <span className="text-[12px] font-normal text-[#A1A1AA]">
              {currentSelected}/{currentTotal}
            </span>
            {/* Divider */}
            <div className="w-px h-4 bg-[#E5E5E5]" />
            {/* All Checkbox */}
            <div
              className="flex items-center gap-2.5 cursor-pointer"
              onClick={handleSelectAll}
            >
              {allSelected ? (
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

        {/* Content wrapper with relative positioning for error banner */}
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Error Banner - Absolute positioned overlay */}
          {restoreError && (
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-2.5 bg-[#FEE2E2]">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626] flex-shrink-0" />
                <span className="text-[12px] text-[#DC2626]">{restoreError}</span>
              </div>
              <button
                onClick={() => setRestoreError(null)}
                className="text-[11px] font-medium text-[#DC2626] hover:text-[#B91C1C] transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Skills Tab Content */}
        {activeTab === 'skills' && (
          <>
            {/* Modal Body - Scrollable Skills List */}
            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    Loading...
                  </span>
                </div>
              ) : skillsCount === 0 ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <Wand2 className="w-8 h-8 text-[#D4D4D8]" />
                  <span className="text-[13px] text-[#71717A]">
                    No deleted Skills
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Items you delete will appear here
                  </span>
                </div>
              ) : (
                trashedItems?.skills.map((skill) => {
                  const isSelected = selectedSkills.has(skill.path);
                  return (
                    <div
                      key={skill.path}
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
                          {formatDeletedTime(skill.deletedAt)}
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
              <Tooltip content="Recover previously deleted items from trash" position="top">
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors"
                  aria-label="More information"
                >
                  <Info className="w-4 h-4 text-[#A1A1AA]" />
                </button>
              </Tooltip>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={totalSelectedCount === 0 || isRestoring}
                  className={`h-[36px] px-5 rounded-[6px] text-[13px] font-medium text-white transition-colors
                    ${
                      totalSelectedCount === 0 || isRestoring
                        ? 'bg-[#18181B]/50 cursor-not-allowed'
                        : 'bg-[#18181B] hover:bg-[#27272A]'
                    }
                  `}
                >
                  {isRestoring ? 'Restoring...' : 'Recover Selected'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* MCPs Tab Content */}
        {activeTab === 'mcps' && (
          <>
            {/* Modal Body - Scrollable MCPs List */}
            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    Loading...
                  </span>
                </div>
              ) : mcpsCount === 0 ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <Server className="w-8 h-8 text-[#D4D4D8]" />
                  <span className="text-[13px] text-[#71717A]">
                    No deleted MCPs
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Items you delete will appear here
                  </span>
                </div>
              ) : (
                trashedItems?.mcps.map((mcp) => {
                  const isSelected = selectedMcps.has(mcp.path);
                  return (
                    <div
                      key={mcp.path}
                      onClick={() => handleToggleMcp(mcp)}
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
                      {/* MCP Info - gap 2px */}
                      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-medium text-[#18181B] truncate">
                          {mcp.name}
                        </span>
                        <span className="text-[11px] font-normal text-[#A1A1AA] truncate">
                          {formatDeletedTime(mcp.deletedAt)}
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
              <Tooltip content="Recover previously deleted items from trash" position="top">
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors"
                  aria-label="More information"
                >
                  <Info className="w-4 h-4 text-[#A1A1AA]" />
                </button>
              </Tooltip>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={totalSelectedCount === 0 || isRestoring}
                  className={`h-[36px] px-5 rounded-[6px] text-[13px] font-medium text-white transition-colors
                    ${
                      totalSelectedCount === 0 || isRestoring
                        ? 'bg-[#18181B]/50 cursor-not-allowed'
                        : 'bg-[#18181B] hover:bg-[#27272A]'
                    }
                  `}
                >
                  {isRestoring ? 'Restoring...' : 'Recover Selected'}
                </button>
              </div>
            </div>
          </>
        )}

        {/* CLAUDE.md Tab Content */}
        {activeTab === 'claudemd' && (
          <>
            {/* Modal Body - Scrollable CLAUDE.md List */}
            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    Loading...
                  </span>
                </div>
              ) : claudeMdCount === 0 ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <FileText className="w-8 h-8 text-[#D4D4D8]" />
                  <span className="text-[13px] text-[#71717A]">
                    No deleted CLAUDE.md
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Items you delete will appear here
                  </span>
                </div>
              ) : (
                trashedItems?.claudeMdFiles.map((claudeMd) => {
                  const isSelected = selectedClaudeMd.has(claudeMd.path);
                  return (
                    <div
                      key={claudeMd.path}
                      onClick={() => handleToggleClaudeMd(claudeMd)}
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
                      {/* CLAUDE.md Info - gap 2px */}
                      <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                        <span className="text-[13px] font-medium text-[#18181B] truncate">
                          {claudeMd.name}
                        </span>
                        <span className="text-[11px] font-normal text-[#A1A1AA] truncate">
                          {formatDeletedTime(claudeMd.deletedAt)}
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
              <Tooltip content="Recover previously deleted items from trash" position="top">
                <button
                  className="w-7 h-7 flex items-center justify-center rounded-[6px] hover:bg-[#FAFAFA] transition-colors"
                  aria-label="More information"
                >
                  <Info className="w-4 h-4 text-[#A1A1AA]" />
                </button>
              </Tooltip>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={onClose}
                  className="h-[36px] px-4 rounded-[6px] border border-[#E5E5E5] text-[13px] font-medium text-[#71717A] hover:bg-[#FAFAFA] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestore}
                  disabled={totalSelectedCount === 0 || isRestoring}
                  className={`h-[36px] px-5 rounded-[6px] text-[13px] font-medium text-white transition-colors
                    ${
                      totalSelectedCount === 0 || isRestoring
                        ? 'bg-[#18181B]/50 cursor-not-allowed'
                        : 'bg-[#18181B] hover:bg-[#27272A]'
                    }
                  `}
                >
                  {isRestoring ? 'Restoring...' : 'Recover Selected'}
                </button>
              </div>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default TrashRecoveryModal;
