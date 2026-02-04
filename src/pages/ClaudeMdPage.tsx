// src/pages/ClaudeMdPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { FileText, Scan, Plus, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { ClaudeMdCard } from '@/components/claude-md/ClaudeMdCard';
import { ClaudeMdDetailPanel } from '@/components/claude-md/ClaudeMdDetailPanel';
import { ImportClaudeMdModal } from '@/components/modals/ImportClaudeMdModal';
import { ScanClaudeMdModal } from '@/components/modals/ScanClaudeMdModal';
import { useClaudeMdStore } from '@/stores/claudeMdStore';

// ============================================================================
// Empty State Component (Custom for CLAUDE.md page)
// ============================================================================

interface ClaudeMdEmptyStateProps {
  onScan: () => void;
  onImport: () => void;
  isScanning: boolean;
}

/**
 * ClaudeMdEmptyState Component
 *
 * Shows when there are no CLAUDE.md files.
 *
 * Design specs:
 * - Icon container: 80x80, bg #F4F4F5, border-radius 20px
 * - Icon: file-text, 40x40, #A1A1AA
 * - Title: 16px, 600, #18181B
 * - Description: 14px, normal, #71717A, line-height 1.5
 * - Buttons: same as header buttons
 */
const ClaudeMdEmptyState: React.FC<ClaudeMdEmptyStateProps> = ({
  onScan,
  onImport,
  isScanning,
}) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      {/* Icon Container - 80x80 */}
      <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[#F4F4F5]">
        <FileText className="h-10 w-10 text-[#A1A1AA]" />
      </div>

      {/* Text Area */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-base font-semibold text-[#18181B]">
          No CLAUDE.md files yet
        </h3>
        <p className="max-w-[320px] text-sm font-normal leading-relaxed text-[#71717A]">
          Import your first CLAUDE.md file or scan your system to get started
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        {/* Scan System Button - Secondary style */}
        <button
          onClick={onScan}
          disabled={isScanning}
          className="
            flex items-center gap-2
            rounded-md border border-[#E5E5E5]
            bg-transparent
            px-3.5 py-2
            text-sm font-normal text-[#18181B]
            hover:bg-[#F4F4F5]
            disabled:opacity-50
            transition-colors
          "
        >
          {isScanning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scan className="h-4 w-4" />
          )}
          {isScanning ? 'Scanning...' : 'Scan System'}
        </button>

        {/* Import Button - Primary style */}
        <button
          onClick={onImport}
          className="
            flex items-center gap-2
            rounded-md
            bg-[#18181B]
            px-3.5 py-2
            text-sm font-medium text-white
            hover:bg-[#27272A]
            transition-colors
          "
        >
          <Plus className="h-4 w-4" />
          Import
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// ClaudeMdPage Component
// ============================================================================

/**
 * ClaudeMdPage Component
 *
 * Main page for managing CLAUDE.md files.
 *
 * Features:
 * - Header with title, Scan System and Import buttons
 * - Empty state when no files
 * - File list with ClaudeMdCard components
 * - Slide panel for detail view
 *
 * Design specs:
 * - Header height: 56px
 * - Header padding: 0 28px
 * - Content padding: 24px 28px
 * - Card gap: 12px
 */
export function ClaudeMdPage() {
  // Store
  const {
    files,
    filter,
    setFilter,
    selectedFileId,
    selectFile,
    deleteFile,
    loadFiles,
    isLoading,
    isScanning,
    error,
    clearError,
  } = useClaudeMdStore();

  // Local state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  // Get filtered files - compute in component to ensure reactivity
  const filteredFiles = useMemo(() => {
    let filtered = [...files];

    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.description.toLowerCase().includes(searchLower) ||
          file.content.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filter.categoryId) {
      filtered = filtered.filter((file) => file.categoryId === filter.categoryId);
    }

    // Tags filter
    if (filter.tagIds && filter.tagIds.length > 0) {
      filtered = filtered.filter((file) =>
        filter.tagIds.some((tag) => file.tagIds.includes(tag))
      );
    }

    // Global only filter
    if (filter.showGlobalOnly) {
      filtered = filtered.filter((file) => file.isGlobal);
    }

    // Sort: global first, then by name
    filtered.sort((a, b) => {
      if (a.isGlobal !== b.isGlobal) {
        return a.isGlobal ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    return filtered;
  }, [files, filter]);

  // Get selected file
  const selectedFile = useMemo(
    () => files.find((f) => f.id === selectedFileId) || null,
    [files, selectedFileId]
  );

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Handlers
  const handleSearchChange = (value: string) => {
    setFilter({ search: value });
  };

  const handleFileClick = (id: string) => {
    selectFile(id);
  };

  const handleCloseDetail = () => {
    selectFile(null);
  };

  const handleDelete = (id: string) => {
    deleteFile(id);
  };

  const handleScan = () => {
    setIsScanModalOpen(true);
  };

  const handleImport = () => {
    setIsImportModalOpen(true);
  };

  const handleImportComplete = () => {
    loadFiles();
  };

  // ============================================================================
  // Header Buttons
  // ============================================================================

  const headerActions = (
    <div className="flex items-center gap-2">
      {/* Scan System Button - Secondary */}
      <button
        onClick={handleScan}
        disabled={isScanning}
        className="
          flex items-center gap-2
          rounded-md border border-[#E5E5E5]
          bg-transparent
          px-3.5 py-2
          text-sm font-normal text-[#18181B]
          hover:bg-[#F4F4F5]
          disabled:opacity-50
          transition-colors
        "
      >
        {isScanning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Scan className="h-4 w-4" />
        )}
        {isScanning ? 'Scanning...' : 'Scan System'}
      </button>

      {/* Import Button - Primary */}
      <button
        onClick={handleImport}
        className="
          flex items-center gap-2
          rounded-md
          bg-[#18181B]
          px-3.5 py-2
          text-sm font-medium text-white
          hover:bg-[#27272A]
          transition-colors
        "
      >
        <Plus className="h-4 w-4" />
        Import
      </button>
    </div>
  );

  // ============================================================================
  // Render
  // ============================================================================

  // Empty state (no files and no search filter)
  if (filteredFiles.length === 0 && !filter.search && !isLoading) {
    return (
      <div className="relative flex h-full flex-col overflow-hidden">
        {/* Header */}
        <PageHeader
          title="CLAUDE.md Files"
          searchValue={filter.search}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search files..."
          actions={headerActions}
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

        {/* Empty State */}
        <ClaudeMdEmptyState
          onScan={handleScan}
          onImport={handleImport}
          isScanning={isScanning}
        />

        {/* Import Modal */}
        <ImportClaudeMdModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImportComplete={handleImportComplete}
        />

        {/* Scan Modal */}
        <ScanClaudeMdModal
          isOpen={isScanModalOpen}
          onClose={() => setIsScanModalOpen(false)}
          onImportComplete={handleImportComplete}
        />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Header */}
      <PageHeader
        title="CLAUDE.md Files"
        searchValue={filter.search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search files..."
        actions={headerActions}
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

      {/* Main Content - with shrink animation */}
      <div
        className={`
          flex-1 overflow-y-auto px-7 py-6
          transition-[margin-right] duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]
          ${selectedFileId ? 'mr-[800px]' : ''}
        `}
      >
        {/* Loading state */}
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#71717A]" />
          </div>
        ) : filteredFiles.length === 0 ? (
          /* No results for search */
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F4F4F5]">
              <FileText className="h-8 w-8 text-[#A1A1AA]" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-medium text-[#71717A]">
                No files found
              </h3>
              <p className="mt-1 text-[13px] text-[#A1A1AA]">
                No files match "{filter.search}"
              </p>
            </div>
          </div>
        ) : (
          /* File List */
          <div className="flex flex-col gap-3">
            {filteredFiles.map((file) => (
              <ClaudeMdCard
                key={file.id}
                file={file}
                compact={!!selectedFileId}
                selected={file.id === selectedFileId}
                onClick={() => handleFileClick(file.id)}
                onDelete={() => handleDelete(file.id)}
                onView={() => handleFileClick(file.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel with SlidePanel */}
      <ClaudeMdDetailPanel
        file={selectedFile}
        isOpen={!!selectedFileId}
        onClose={handleCloseDetail}
      />

      {/* Import Modal */}
      <ImportClaudeMdModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Scan Modal */}
      <ScanClaudeMdModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
}

export default ClaudeMdPage;
