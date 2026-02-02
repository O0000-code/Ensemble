import { useImportStore } from '@/stores/importStore';
import Modal from './Modal';
import Button from './Button';
import { Checkbox } from './Checkbox';
import { AlertTriangle, CheckCircle, Package, Server } from 'lucide-react';

/**
 * ImportDialog Component
 *
 * First-time startup dialog for importing existing Claude Code configurations.
 * Displays detected Skills and MCPs from ~/.claude/ directory with selection capability.
 *
 * Features:
 * - Shows warning about import behavior (copy, not move)
 * - Lists detected Skills and MCPs with checkboxes
 * - Select all / Deselect all functionality
 * - Import progress indicator
 * - Import result display with backup path
 */
export function ImportDialog() {
  const {
    showImportDialog,
    detectedConfig,
    selectedItems,
    isImporting,
    importResult,
    error,
    closeImportDialog,
    toggleItemSelection,
    selectAllItems,
    deselectAllItems,
    importConfig,
  } = useImportStore();

  // Don't render if dialog is closed or no config detected
  if (!showImportDialog || !detectedConfig) return null;

  // Show import result after completion
  if (importResult) {
    const totalImported = importResult.imported.skills + importResult.imported.mcps;
    const skippedCount = importResult.errors.filter(e => e.includes('already exists')).length;
    const otherErrors = importResult.errors.filter(e => !e.includes('already exists'));

    // Determine the title and message based on the result
    let title = 'Import Complete';
    let message = '';
    let isSuccess = true;

    if (totalImported > 0 && skippedCount > 0) {
      message = `Imported ${totalImported} item${totalImported > 1 ? 's' : ''}, skipped ${skippedCount} (already exist)`;
    } else if (totalImported > 0) {
      message = `Imported ${importResult.imported.skills} skill${importResult.imported.skills !== 1 ? 's' : ''} and ${importResult.imported.mcps} MCP${importResult.imported.mcps !== 1 ? 's' : ''}`;
    } else if (skippedCount > 0 && otherErrors.length === 0) {
      title = 'Already Up to Date';
      message = `All ${skippedCount} item${skippedCount > 1 ? 's' : ''} already exist in Ensemble`;
    } else {
      title = 'Import Failed';
      message = 'No items could be imported';
      isSuccess = false;
    }

    return (
      <Modal isOpen={true} onClose={closeImportDialog} title={title}>
        <div className="p-6">
          {/* Status indicator */}
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className={`w-8 h-8 flex-shrink-0 ${isSuccess ? 'text-green-500' : 'text-[#71717A]'}`} />
            <div>
              <h3 className="font-medium text-[#18181B]">
                {isSuccess ? (totalImported > 0 ? 'Import Successful' : 'No Changes Needed') : 'Import Failed'}
              </h3>
              <p className="text-sm text-[#71717A]">{message}</p>
            </div>
          </div>

          {/* Backup path information */}
          {importResult.backupPath && (
            <div className="bg-[#EFF6FF] p-4 rounded-lg mb-4">
              <p className="text-sm text-[#1E40AF]">
                <strong>Backup created at:</strong>
              </p>
              <code className="text-xs text-[#1E40AF] break-all">
                {importResult.backupPath}
              </code>
            </div>
          )}

          {/* Skipped items info */}
          {skippedCount > 0 && totalImported > 0 && (
            <div className="bg-[#F5F5F5] p-4 rounded-lg mb-4">
              <p className="text-sm text-[#71717A]">
                {skippedCount} item{skippedCount > 1 ? 's were' : ' was'} skipped because {skippedCount > 1 ? 'they' : 'it'} already exist{skippedCount === 1 ? 's' : ''} in Ensemble.
              </p>
            </div>
          )}

          {/* Other errors if any */}
          {otherErrors.length > 0 && (
            <div className="bg-[#FEF3C7] p-4 rounded-lg mb-4">
              <p className="text-sm font-medium text-[#92400E] mb-2">
                Some items could not be imported:
              </p>
              <ul className="text-sm text-[#B45309] list-disc list-inside">
                {otherErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <Button onClick={closeImportDialog} className="w-full">
            Continue
          </Button>
        </div>
      </Modal>
    );
  }

  // Build item lists for display
  const skillItems = detectedConfig.skills.map((s) => ({
    type: 'skill' as const,
    name: s.name,
    sourcePath: s.path,
  }));
  const mcpItems = detectedConfig.mcps.map((m) => ({
    type: 'mcp' as const,
    name: m.name,
    sourcePath: '',
  }));
  const allItems = [...skillItems, ...mcpItems];

  // Check if an item is selected
  const isItemSelected = (type: string, name: string) =>
    selectedItems.some((i) => i.type === type && i.name === name);

  // Main import dialog
  return (
    <Modal
      isOpen={true}
      onClose={closeImportDialog}
      title="Import Existing Configuration"
      maxWidth="560px"
    >
      <div className="p-6">
        {/* Warning message */}
        <div className="flex gap-3 p-4 bg-[#FFFBEB] rounded-lg mb-6">
          <AlertTriangle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[#92400E] font-medium mb-1">
              Existing Claude Code configuration detected
            </p>
            <p className="text-sm text-[#B45309]">
              Ensemble will <strong>copy</strong> (not move) your existing Skills
              and MCP configurations to its own directory. Your original{' '}
              <code className="bg-[#FEF3C7] px-1 rounded">~/.claude</code> folder
              will not be modified. A backup will be created before import.
            </p>
          </div>
        </div>

        {/* Selection controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-[#71717A]">
            {selectedItems.length} of {allItems.length} items selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={selectAllItems}
              className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Select All
            </button>
            <span className="text-[#D4D4D4]">|</span>
            <button
              onClick={deselectAllItems}
              className="text-sm text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>

        {/* Skills list */}
        {detectedConfig.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-[#18181B] mb-2 flex items-center gap-2">
              <Package className="w-4 h-4" />
              Skills ({detectedConfig.skills.length})
            </h4>
            <div className="border border-[#E5E5E5] rounded-lg divide-y divide-[#E5E5E5] max-h-40 overflow-y-auto">
              {detectedConfig.skills.map((skill) => (
                <label
                  key={skill.name}
                  className="flex items-center gap-3 p-3 hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={isItemSelected('skill', skill.name)}
                    onChange={() =>
                      toggleItemSelection({
                        type: 'skill',
                        name: skill.name,
                        sourcePath: skill.path,
                      })
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#18181B] truncate">
                      {skill.name}
                    </p>
                    {skill.description && (
                      <p className="text-xs text-[#71717A] truncate">
                        {skill.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* MCPs list */}
        {detectedConfig.mcps.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#18181B] mb-2 flex items-center gap-2">
              <Server className="w-4 h-4" />
              MCP Servers ({detectedConfig.mcps.length})
            </h4>
            <div className="border border-[#E5E5E5] rounded-lg divide-y divide-[#E5E5E5] max-h-40 overflow-y-auto">
              {detectedConfig.mcps.map((mcp) => (
                <label
                  key={mcp.name}
                  className="flex items-center gap-3 p-3 hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={isItemSelected('mcp', mcp.name)}
                    onChange={() =>
                      toggleItemSelection({
                        type: 'mcp',
                        name: mcp.name,
                        sourcePath: '',
                      })
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#18181B] truncate">
                      {mcp.name}
                    </p>
                    <p className="text-xs text-[#71717A] truncate font-mono">
                      {mcp.command}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div className="mb-4 p-3 bg-[#FEF2F2] text-[#DC2626] text-sm rounded-lg">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={closeImportDialog}
            className="flex-1"
            disabled={isImporting}
          >
            Skip
          </Button>
          <Button
            onClick={importConfig}
            className="flex-1"
            disabled={isImporting || selectedItems.length === 0}
            loading={isImporting}
          >
            {isImporting ? (
              'Importing...'
            ) : (
              `Import ${selectedItems.length} Items`
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ImportDialog;
