import React from 'react';

// ============================================================================
// ListDetailLayout Component
// ============================================================================
// Used for: Skill Detail, MCP Detail, Scene Detail, Projects pages
// Structure: List Panel (380px or 400px) | Detail Panel (fill)

export interface ListDetailLayoutProps {
  /** Width of the list panel in pixels (default: 380) */
  listWidth?: number;
  /** Content for the list panel header */
  listHeader: React.ReactNode;
  /** Content for the list panel body */
  listContent: React.ReactNode;
  /** Content for the detail panel header (optional) */
  detailHeader?: React.ReactNode;
  /** Content for the detail panel body (optional) */
  detailContent?: React.ReactNode;
  /** Content to show when no item is selected */
  emptyDetail?: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * ListDetailLayout provides a two-column layout with a list panel and detail panel.
 *
 * List Panel:
 * - Fixed width (380px default, 400px for Projects)
 * - Contains header (56px) and scrollable content area
 * - Right border separator
 *
 * Detail Panel:
 * - Fills remaining width
 * - Contains header (56px) and scrollable content area
 * - Shows emptyDetail when no item is selected
 */
export function ListDetailLayout({
  listWidth = 380,
  listHeader,
  listContent,
  detailHeader,
  detailContent,
  emptyDetail,
  className = '',
}: ListDetailLayoutProps) {
  const hasDetail = detailHeader || detailContent;

  return (
    <div className={`flex h-full w-full ${className}`}>
      {/* List Panel */}
      <div
        className="flex h-full flex-shrink-0 flex-col border-r border-[#E5E5E5]"
        style={{ width: `${listWidth}px` }}
      >
        {/* List Header */}
        <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E5E5E5] px-5">
          {listHeader}
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-3">
          {listContent}
        </div>
      </div>

      {/* Detail Panel */}
      <div className="flex h-full flex-1 flex-col">
        {hasDetail ? (
          <>
            {/* Detail Header */}
            {detailHeader && (
              <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-[#E5E5E5] px-7">
                {detailHeader}
              </div>
            )}

            {/* Detail Content */}
            <div className="flex-1 overflow-y-auto p-7">
              {detailContent}
            </div>
          </>
        ) : (
          // Empty state when no detail is selected
          <div className="flex h-full flex-1 items-center justify-center">
            {emptyDetail}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListDetailLayout;
