import { useEffect, useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Info, Puzzle, HardDrive, Store } from 'lucide-react';
import { useImportStore } from '@/stores/importStore';
import { usePluginsStore } from '@/stores/pluginsStore';
import { truncateToFirstSentence } from '@/utils/text';
import type { DetectedMcp } from '@/types';
import type { DetectedPluginMcp, PluginImportItem } from '@/types/plugin';

type TabType = 'claude' | 'plugin';

/**
 * ImportMcpModal Component
 *
 * A modal dialog for importing detected MCP servers from ~/.claude/ directory.
 * Allows users to select which MCP servers to import with checkboxes.
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
  const [activeTab, setActiveTab] = useState<TabType>('claude');

  // Get detected MCPs from store (Claude Code)
  const {
    detectedMcps,
    isDetectingMcps,
    isImporting,
    importMcps,
    selectedItems,
    toggleItemSelection,
  } = useImportStore();

  // Get plugin MCPs from pluginsStore
  const {
    detectPluginMcpsForImport,
    importPluginMcps,
    isDetectingMcps: isDetectingPluginMcps,
    isImporting: isImportingPlugin,
    getUnimportedPluginMcps,
  } = usePluginsStore();

  // Track selected plugin MCPs
  const [selectedPluginMcps, setSelectedPluginMcps] = useState<Set<string>>(new Set());

  // Use directly from store (populated by openMcpsModal -> detectMcpsOnly)
  const isDetecting = isDetectingMcps;
  const totalMcps = detectedMcps.length;

  // Plugin MCPs
  const unimportedPluginMcps = getUnimportedPluginMcps();
  const totalPluginMcps = unimportedPluginMcps.length;
  const selectedPluginCount = selectedPluginMcps.size;
  const allPluginSelected = totalPluginMcps > 0 && selectedPluginCount === totalPluginMcps;

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

  // Handle select all / deselect all for MCPs only (Claude Code tab)
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

  // Handle select all / deselect all for plugin MCPs
  const handleSelectAllPlugins = useCallback(() => {
    if (allPluginSelected) {
      setSelectedPluginMcps(new Set());
    } else {
      const allKeys = new Set(unimportedPluginMcps.map((m) => `${m.pluginId}|${m.mcpName}`));
      setSelectedPluginMcps(allKeys);
    }
  }, [allPluginSelected, unimportedPluginMcps]);

  // Handle individual plugin MCP toggle
  const handleTogglePluginMcp = useCallback((mcp: DetectedPluginMcp) => {
    const key = `${mcp.pluginId}|${mcp.mcpName}`;
    setSelectedPluginMcps((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

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

  // Handle import (Claude Code tab)
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

  // Handle import plugin MCPs
  const handleImportPluginMcps = useCallback(async () => {
    if (selectedPluginCount === 0) return;

    // Build import items from selected plugin MCPs
    const itemsToImport: PluginImportItem[] = [];
    selectedPluginMcps.forEach((key) => {
      const [pluginId, mcpName] = key.split('|');
      const mcp = unimportedPluginMcps.find(
        (m) => m.pluginId === pluginId && m.mcpName === mcpName
      );
      if (mcp) {
        itemsToImport.push({
          pluginId: mcp.pluginId,
          pluginName: mcp.pluginName,
          marketplace: mcp.marketplace,
          itemName: mcp.mcpName,
          sourcePath: mcp.path,
          version: mcp.version,
        });
      }
    });

    await importPluginMcps(itemsToImport);
    setSelectedPluginMcps(new Set());
    onImportComplete?.();
    onClose();
  }, [selectedPluginCount, selectedPluginMcps, unimportedPluginMcps, importPluginMcps, onImportComplete, onClose]);

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

  // Detect plugin MCPs when modal opens (so tab count shows correct number)
  useEffect(() => {
    if (isOpen) {
      detectPluginMcpsForImport();
    }
  }, [isOpen, detectPluginMcpsForImport]);

  // Reset selected plugin MCPs when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPluginMcps(new Set());
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
        {/* Modal Header - 80px height */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#E5E5E5]">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold text-[#18181B]">
              Import MCP Servers
            </h2>
            <p className="text-[13px] font-normal text-[#71717A]">
              {activeTab === 'claude'
                ? `Found ${totalMcps} MCP servers on your system`
                : `Found ${totalPluginMcps} Plugin MCPs available`}
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
                {totalMcps}
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
                {totalPluginMcps}
              </span>
            </button>
          </div>

          {/* Right side: Divider + Count + Divider + All Checkbox */}
          <div className="flex items-center gap-3">
            {/* Divider */}
            <div className="w-px h-4 bg-[#E5E5E5]" />
            {/* Count */}
            <span className="text-[12px] font-normal text-[#A1A1AA]">
              {activeTab === 'claude' ? `${selectedCount}/${totalMcps}` : `${selectedPluginCount}/${totalPluginMcps}`}
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
          </>
        )}

        {/* Plugin Tab Content */}
        {activeTab === 'plugin' && (
          <>
            {/* Modal Body - Scrollable Plugin MCPs List */}
            <div className="flex-1 overflow-y-auto py-4 px-6 flex flex-col gap-0.5">
              {isDetectingPluginMcps ? (
                <div className="flex items-center justify-center h-full">
                  <span className="text-[13px] text-[#71717A]">
                    Detecting plugin MCPs...
                  </span>
                </div>
              ) : unimportedPluginMcps.length === 0 ? (
                <div className="flex items-center justify-center h-full flex-col gap-2">
                  <Puzzle className="w-8 h-8 text-[#D4D4D8]" />
                  <span className="text-[13px] text-[#71717A]">
                    No plugin MCPs available
                  </span>
                  <span className="text-[11px] text-[#A1A1AA]">
                    Install plugins with MCPs to import them here
                  </span>
                </div>
              ) : (
                unimportedPluginMcps.map((mcp) => {
                  const key = `${mcp.pluginId}|${mcp.mcpName}`;
                  const isSelected = selectedPluginMcps.has(key);
                  return (
                    <div
                      key={key}
                      onClick={() => handleTogglePluginMcp(mcp)}
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
                      {/* Plugin MCP Info - gap 4px */}
                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        {/* Name row with Marketplace label - gap 8px */}
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-[#18181B] truncate">
                            {mcp.mcpName}
                          </span>
                          {/* Marketplace indicator */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Store className="w-[9px] h-[9px] text-[#A1A1AA]" />
                            <span className="text-[11px] font-normal text-[#A1A1AA]">
                              {mcp.marketplace}
                            </span>
                          </div>
                        </div>
                        {/* Description - 12px #71717A */}
                        <span className="text-[12px] font-normal text-[#71717A] truncate">
                          {mcp.command} {mcp.args?.join(' ')}
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
                  onClick={handleImportPluginMcps}
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

export default ImportMcpModal;
