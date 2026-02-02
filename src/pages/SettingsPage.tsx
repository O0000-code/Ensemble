import { useState } from 'react';
import { ShieldCheck, Github, BookOpen, FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import Toggle from '@/components/common/Toggle';
import Modal from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import Button from '@/components/common/Button';
import { useSettingsStore, useImportStore } from '@/stores';
import { safeInvoke } from '@/utils/tauri';

// ============================================================================
// Settings Page
// ============================================================================
// Central configuration hub for Ensemble application.
// Includes Storage, Auto Classify, and About sections.

// ============================================================================
// Reusable Components
// ============================================================================

interface SectionHeaderProps {
  title: string;
  description?: string;
}

function SectionHeader({ title, description }: SectionHeaderProps) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-semibold text-[#18181B]">{title}</h2>
      {description && (
        <p className="text-xs text-[#71717A] mt-1">{description}</p>
      )}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`border border-[#E5E5E5] rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

interface RowProps {
  children: React.ReactNode;
  noBorder?: boolean;
}

function Row({ children, noBorder = false }: RowProps) {
  return (
    <div
      className={`flex items-center justify-between px-5 py-4 ${
        noBorder ? '' : 'border-b border-[#E5E5E5]'
      } last:border-b-0`}
    >
      {children}
    </div>
  );
}

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
}

function ActionButton({ onClick, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
    >
      {children}
    </button>
  );
}

// ============================================================================
// API Key Modal Component
// ============================================================================

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKey: string;
  onSave: (key: string) => void;
}

function ApiKeyModal({ isOpen, onClose, currentKey, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState(currentKey);

  const handleSave = () => {
    onSave(apiKey);
    onClose();
  };

  const handleClear = () => {
    setApiKey('');
    onSave('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure API Key"
      subtitle="Enter your Anthropic API key for auto-classification"
      maxWidth="480px"
    >
      <div className="p-6 flex flex-col gap-5">
        <Input
          label="Anthropic API Key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-api03-..."
          type="password"
        />

        <div className="flex items-center gap-2 text-[11px] text-[#A1A1AA]">
          <ShieldCheck size={14} className="text-[#A1A1AA] flex-shrink-0" />
          <span className="italic">
            Your API key is stored locally and never shared with any external services.
          </span>
        </div>

        <div className="flex items-center justify-between pt-2">
          {currentKey && (
            <Button variant="danger" size="small" onClick={handleClear}>
              Clear Key
            </Button>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <Button variant="secondary" size="small" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="small" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ============================================================================
// Main Settings Page Component
// ============================================================================

export function SettingsPage() {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [quickActionStatus, setQuickActionStatus] = useState<'idle' | 'installing' | 'success' | 'error'>('idle');
  const [quickActionMessage, setQuickActionMessage] = useState('');

  const {
    skillSourceDir,
    mcpSourceDir,
    claudeConfigDir,
    anthropicApiKey,
    autoClassifyNewItems,
    terminalApp,
    claudeCommand,
    warpOpenMode,
    stats,
    setAnthropicApiKey,
    setAutoClassifyNewItems,
    setTerminalApp,
    setClaudeCommand,
    setWarpOpenMode,
    getMaskedApiKey,
    hasApiKey,
    selectDirectory,
  } = useSettingsStore();

  const { detectExistingConfig, isDetecting } = useImportStore();

  const handleChangeDir = (type: 'skills' | 'mcp' | 'claude') => {
    // Map from page type names to store type names
    const typeMap: Record<string, 'skill' | 'mcp' | 'claude'> = {
      skills: 'skill',
      mcp: 'mcp',
      claude: 'claude',
    };
    selectDirectory(typeMap[type]);
  };

  const handleInstallQuickAction = async () => {
    setQuickActionStatus('installing');
    setQuickActionMessage('');

    try {
      const result = await safeInvoke<string>('install_quick_action');

      if (result === null) {
        // safeInvoke returns null when not in Tauri environment
        setQuickActionStatus('error');
        setQuickActionMessage('Please run this app using "npm run tauri dev" for full functionality');
        return;
      }

      setQuickActionStatus('success');
      setQuickActionMessage(`Installed at: ${result}`);

      // Reset after 5 seconds
      setTimeout(() => {
        setQuickActionStatus('idle');
        setQuickActionMessage('');
      }, 5000);
    } catch (error) {
      setQuickActionStatus('error');
      setQuickActionMessage(typeof error === 'string' ? error : String(error));
      console.error('Failed to install Quick Action:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <PageHeader title="Settings" />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[600px] mx-auto px-7 py-8 flex flex-col gap-8">
          {/* Storage Section */}
          <section>
            <SectionHeader
              title="Storage"
              description="Configure where Ensemble stores Skills and MCP configurations"
            />
            <Card>
              {/* Skills Source Directory */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Skills Source Directory
                  </span>
                  <span className="text-xs text-[#71717A]">{skillSourceDir}</span>
                </div>
                <ActionButton onClick={() => handleChangeDir('skills')}>
                  Change
                </ActionButton>
              </Row>

              {/* MCP Servers Source Directory */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    MCP Servers Source Directory
                  </span>
                  <span className="text-xs text-[#71717A]">{mcpSourceDir}</span>
                </div>
                <ActionButton onClick={() => handleChangeDir('mcp')}>
                  Change
                </ActionButton>
              </Row>

              {/* Claude Code Config Directory */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Claude Code Config Directory
                  </span>
                  <span className="text-xs text-[#71717A]">{claudeConfigDir}</span>
                </div>
                <ActionButton onClick={() => handleChangeDir('claude')}>
                  Change
                </ActionButton>
              </Row>

              {/* Stats Row */}
              <Row>
                <div className="flex items-center gap-2 text-[11px] text-[#71717A]">
                  <span>Skills {stats.skillsCount}</span>
                  <span className="text-[#A1A1AA]">·</span>
                  <span>MCPs {stats.mcpsCount}</span>
                  <span className="text-[#A1A1AA]">·</span>
                  <span>Scenes {stats.scenesCount}</span>
                  <span className="text-[#A1A1AA]">·</span>
                  <span>Size {stats.totalSize}</span>
                </div>
              </Row>

              {/* Sync Configurations */}
              <Row noBorder>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Sync Configurations
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Import new Skills and MCPs from Claude Code
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => detectExistingConfig()}
                  disabled={isDetecting}
                >
                  {isDetecting ? 'Detecting...' : 'Detect & Import'}
                </Button>
              </Row>
            </Card>
          </section>

          {/* Auto Classify Section */}
          <section>
            <SectionHeader
              title="Auto Classify"
              description="Use Claude to automatically categorize and tag Skills and MCPs"
            />
            <Card>
              {/* Anthropic API Key */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Anthropic API Key
                  </span>
                  <span className="text-xs text-[#71717A]">
                    {hasApiKey() ? getMaskedApiKey() : 'Not configured'}
                  </span>
                </div>
                <ActionButton onClick={() => setIsApiKeyModalOpen(true)}>
                  Configure
                </ActionButton>
              </Row>

              {/* Auto-classify Toggle */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Auto-classify new items
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Automatically classify newly added Skills and MCPs
                  </span>
                </div>
                <Toggle
                  checked={autoClassifyNewItems}
                  onChange={setAutoClassifyNewItems}
                  size="medium"
                />
              </Row>

              {/* Security Hint */}
              <div className="flex items-center gap-1.5 px-5 py-3">
                <ShieldCheck size={12} className="text-[#A1A1AA] flex-shrink-0" />
                <span className="text-[11px] text-[#A1A1AA] italic">
                  Your API key is stored locally and never shared.
                </span>
              </div>
            </Card>
          </section>

          {/* Launch Configuration Section */}
          <section>
            <SectionHeader
              title="Launch Configuration"
              description="Configure how Claude Code is launched from Finder"
            />
            <Card>
              {/* Terminal App */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Terminal Application
                  </span>
                  <span className="text-xs text-[#71717A]">
                    The terminal app to use when launching Claude Code
                  </span>
                </div>
                <select
                  value={terminalApp}
                  onChange={(e) => setTerminalApp(e.target.value)}
                  className="rounded-md border border-[#E5E5E5] px-3 py-1.5 text-sm text-[#18181B] focus:border-[#18181B] focus:outline-none"
                >
                  <option value="Terminal">Terminal</option>
                  <option value="iTerm">iTerm</option>
                  <option value="Warp">Warp</option>
                  <option value="Alacritty">Alacritty</option>
                </select>
              </Row>

              {/* Warp Open Mode - Only shown when Warp is selected */}
              {terminalApp === 'Warp' && (
                <Row>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium text-[#18181B]">
                      Open Mode
                    </span>
                    <span className="text-xs text-[#71717A]">
                      How Warp opens when launching Claude Code
                    </span>
                  </div>
                  <select
                    value={warpOpenMode}
                    onChange={(e) => setWarpOpenMode(e.target.value as 'tab' | 'window')}
                    className="rounded-md border border-[#E5E5E5] px-3 py-1.5 text-sm text-[#18181B] focus:border-[#18181B] focus:outline-none"
                  >
                    <option value="tab">New Tab</option>
                    <option value="window">New Window</option>
                  </select>
                </Row>
              )}

              {/* Claude Command */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Launch Command
                  </span>
                  <span className="text-xs text-[#71717A]">
                    The command to run when launching Claude Code
                  </span>
                </div>
                <input
                  type="text"
                  value={claudeCommand}
                  onChange={(e) => setClaudeCommand(e.target.value)}
                  placeholder="claude"
                  className="w-48 rounded-md border border-[#E5E5E5] px-3 py-1.5 text-sm text-[#18181B] focus:border-[#18181B] focus:outline-none"
                />
              </Row>

              {/* Quick Action Install */}
              <Row noBorder>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Finder Integration
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Install Quick Action for right-click menu in Finder
                  </span>
                  {quickActionStatus === 'success' && (
                    <span className="text-xs text-green-600 mt-1">
                      ✓ {quickActionMessage}
                    </span>
                  )}
                  {quickActionStatus === 'error' && (
                    <span className="text-xs text-red-600 mt-1">
                      ✗ {quickActionMessage}
                    </span>
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="small"
                  onClick={handleInstallQuickAction}
                  disabled={quickActionStatus === 'installing'}
                  loading={quickActionStatus === 'installing'}
                >
                  {quickActionStatus === 'installing' ? 'Installing...' : 'Install Quick Action'}
                </Button>
              </Row>
            </Card>
          </section>

          {/* About Section */}
          <section>
            <SectionHeader title="About" />
            <Card className="p-5">
              {/* App Info */}
              <div className="flex items-center gap-3.5">
                {/* App Icon */}
                <div className="w-12 h-12 bg-[#18181B] rounded-[10px] flex items-center justify-center flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 3L7 7L3 11M7 3L11 7L7 11"
                      stroke="white"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {/* Info Text */}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-[#18181B]">
                    Ensemble
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Version 0.0.1 (Build 1)
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-[#E4E4E7] my-4" />

              {/* Links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/anthropics/ensemble"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
                >
                  <Github size={14} className="text-[#71717A]" />
                  GitHub
                </a>
                <a
                  href="https://docs.ensemble.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
                >
                  <BookOpen size={14} className="text-[#71717A]" />
                  Documentation
                </a>
                <a
                  href="https://opensource.org/licenses/MIT"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#18181B] transition-colors"
                >
                  <FileText size={14} className="text-[#71717A]" />
                  MIT License
                </a>
              </div>
            </Card>
          </section>
        </div>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={anthropicApiKey}
        onSave={setAnthropicApiKey}
      />
    </div>
  );
}

export default SettingsPage;
