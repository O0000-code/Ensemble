import { useState } from 'react';
import { Globe, FolderGit2, ChevronDown, Check, Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

export type Scope = 'global' | 'project';

export interface ScopeSelectorProps {
  value: Scope;
  onChange: (scope: Scope) => Promise<void>;
  disabled?: boolean;
  className?: string;
}

// ============================================================================
// Scope Configuration
// ============================================================================

const scopeConfig = {
  global: {
    label: 'Global',
    description: 'Available in all projects',
    icon: Globe,
    color: 'bg-purple-100 text-purple-700',
    hoverColor: 'hover:bg-purple-50',
  },
  project: {
    label: 'Project',
    description: 'Available via Scenes',
    icon: FolderGit2,
    color: 'bg-gray-100 text-gray-700',
    hoverColor: 'hover:bg-gray-50',
  },
};

// ============================================================================
// ScopeSelector Component
// ============================================================================

/**
 * ScopeSelector component for selecting the installation scope of Skills/MCPs.
 *
 * - Global: Symlinked to ~/.claude, available in all projects
 * - Project: Managed by Ensemble, available via Scenes
 */
export function ScopeSelector({
  value,
  onChange,
  disabled = false,
  className = '',
}: ScopeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const currentScope = scopeConfig[value];
  const CurrentIcon = currentScope.icon;

  const handleSelect = async (scope: Scope) => {
    if (scope === value || isUpdating) return;

    setIsUpdating(true);
    setIsOpen(false);

    try {
      await onChange(scope);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && !isUpdating && setIsOpen(!isOpen)}
        disabled={disabled || isUpdating}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-colors cursor-pointer
          ${currentScope.color}
          ${!disabled && !isUpdating ? currentScope.hoverColor : 'opacity-60 cursor-not-allowed'}
        `}
      >
        {isUpdating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <CurrentIcon className="w-4 h-4" />
        )}
        <span>{currentScope.label}</span>
        {!disabled && !isUpdating && (
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E5E5E5] z-20">
            <div className="py-1">
              {(Object.keys(scopeConfig) as Scope[]).map((scope) => {
                const config = scopeConfig[scope];
                const Icon = config.icon;
                const isSelected = scope === value;

                return (
                  <button
                    key={scope}
                    onClick={() => handleSelect(scope)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-2.5 text-left
                      transition-colors
                      ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className={`p-1.5 rounded-md ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {config.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {config.description}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Info footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-[#E5E5E5] rounded-b-lg">
              <p className="text-xs text-gray-500">
                <strong>Global:</strong> Symlinked to ~/.claude<br />
                <strong>Project:</strong> Managed by Ensemble
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// Export
// ============================================================================

export default ScopeSelector;
