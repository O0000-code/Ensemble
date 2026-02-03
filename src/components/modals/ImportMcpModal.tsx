import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Info } from 'lucide-react';
import { useImportStore } from '@/stores/importStore';
import type { DetectedMcp } from '@/types';

interface ImportMcpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

/**
 * ImportMcpModal Component
 *
 * A modal dialog for importing detected MCP servers from ~/.claude/ directory.
 * Allows users to select which MCP servers to import with checkboxes.
 *
 * Design specs (from subagent-execution-spec.md):
 * - Modal: 500x540px, rounded-[16px], bg-white
 * - Overlay: bg-black/40
 * - Header: py-5 px-6, border-b border-[#E5E5E5]
 * - List Header: py-3 px-6, border-b border-[#E5E5E5]
 * - Body: py-4 px-6, flex-1, overflow-y-auto
 * - Footer: py-4 px-6, border-t border-[#E5E5E5]
 * - Checkbox checked: w-4 h-4, rounded-[4px], bg-[#18181B]
 * - Checkbox unchecked: w-4 h-4, rounded-[4px], border-[1.5px] border-[#D4D4D8]
 *
 * MCP-specific scope styling:
 * - User scope: text-[11px] font-medium text-[#8B5CF6] (purple)
 * - Local path: text-[11px] font-normal text-[#71717A] (gray)
 */
export function ImportMcpModal({
  isOpen,
  onClose,
  onImportComplete,
}: ImportMcpModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Get detected MCPs from store
  const {
    detectedMcps,
    isDetectingMcps,
    isImporting,
    importMcps,
    selectedItems,
    toggleItemSelection,
  } = useImportStore();

  // Use directly from store (populated by openMcpsModal -> detectMcpsOnly)
  const isDetecting = isDetectingMcps;
  const totalMcps = detectedMcps.length;

  // Create unique key for MCP (name + scope + projectPath)
  const getMcpKey = (mcp: DetectedMcp) =>
    `${mcp.name}|${mcp.scope || 'user'}|${mcp.projectPath || ''}`;

  // Track selected MCP keys for this modal (using unique identifier)
  const selectedMcpKeys = new Set(
    selectedItems
      .filter((item) => item.type === 'mcp')
      .map((item) => item.sourcePath) // sourcePath now stores the unique key
  );
  const selectedCount = selectedMcpKeys.size;

  // Determine if all MCPs are selected
  const allSelected = totalMcps > 0 && selectedCount === totalMcps;

  // Handle select all / deselect all for MCPs only
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      // Deselect all MCPs
      selectedItems
        .filter((item) => item.type === 'mcp')
        .forEach((item) => toggleItemSelection(item));
    } else {
      // Select all MCPs that aren't already selected
      detectedMcps.forEach((mcp) => {
        const mcpKey = getMcpKey(mcp);
        if (!selectedMcpKeys.has(mcpKey)) {
          toggleItemSelection({
            type: 'mcp',
            name: mcp.name,
            sourcePath: mcpKey, // Use unique key as sourcePath
          });
        }
      });
    }
  }, [allSelected, detectedMcps, selectedItems, selectedMcpKeys, toggleItemSelection]);

  // Handle individual MCP toggle
  const handleToggleMcp = useCallback(
    (mcp: DetectedMcp) => {
      toggleItemSelection({
        type: 'mcp',
        name: mcp.name,
        sourcePath: getMcpKey(mcp), // Use unique key as sourcePath
      });
    },
    [toggleItemSelection]
  );

  // Handle import
  const handleImport = useCallback(async () => {
    if (selectedCount === 0) return;

    // Build import items from selected MCPs
    const itemsToImport = selectedItems
      .filter((item) => item.type === 'mcp')
      .map((item) => ({
        type: 'mcp' as const,
        name: item.name,
        sourcePath: item.sourcePath,
      }));

    await importMcps(itemsToImport);
    onImportComplete?.();
    onClose();
  }, [selectedCount, selectedItems, importMcps, onImportComplete, onClose]);

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
      <div className="w-[500px] h-[540px] bg-white rounded-[16px] flex flex-col overflow-hidden shadow-[0_25px_50px_rgba(0,0,0,0.1)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between py-5 px-6 border-b border-[#E5E5E5]">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-[#18181B]">
              Import MCP Servers
            </h2>
            <p className="text-[13px] font-normal text-[#71717A]">
              Found {totalMcps} MCP servers on your system
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

        {/* List Header */}
        <div className="flex items-center justify-between py-3 px-6 border-b border-[#E5E5E5]">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={handleSelectAll}
          >
            {/* Select All Checkbox */}
            {allSelected ? (
              <div className="w-4 h-4 rounded-[4px] bg-[#18181B] flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-[#D4D4D8] bg-transparent" />
            )}
            <span className="text-[13px] font-medium text-[#18181B]">
              Select All
            </span>
          </div>
          <span className="text-[12px] font-normal text-[#A1A1AA]">
            {selectedCount} of {totalMcps} selected
          </span>
        </div>

        {/* Modal Body - Scrollable MCP List */}
        <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
          {isDetecting ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[13px] text-[#71717A]">
                Detecting MCP servers...
              </span>
            </div>
          ) : detectedMcps.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[13px] text-[#71717A]">
                No MCP servers found
              </span>
            </div>
          ) : (
            detectedMcps.map((mcp) => {
              const mcpKey = getMcpKey(mcp);
              const isSelected = selectedMcpKeys.has(mcpKey);
              // Determine scope display - User scope or Local with path
              const isUserScope = mcp.scope === 'user' || !mcp.scope;
              const scopeLabel = isUserScope
                ? 'User scope'
                : `Local · ${mcp.projectPath || ''}`;

              return (
                <div
                  key={mcpKey}
                  onClick={() => handleToggleMcp(mcp)}
                  className="flex items-center gap-3 py-2.5 px-3 rounded-[6px] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                >
                  {/* Checkbox */}
                  {isSelected ? (
                    <div className="w-4 h-4 rounded-[4px] bg-[#18181B] flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-4 h-4 rounded-[4px] border-[1.5px] border-[#D4D4D8] bg-transparent flex-shrink-0" />
                  )}
                  {/* MCP Info */}
                  <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                    <span className="text-[13px] font-medium text-[#18181B] truncate">
                      {mcp.name}
                    </span>
                    <span
                      className={`text-[11px] truncate ${
                        isUserScope
                          ? 'font-medium text-[#8B5CF6]'
                          : 'font-normal text-[#71717A]'
                      }`}
                    >
                      {scopeLabel}
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ImportMcpModal;
