import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShieldCheck, Github, BookOpen, FileText, ChevronDown, Check } from 'lucide-react';
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
    <div className="flex flex-col gap-1 mb-4">
      <h2 className="text-sm font-semibold text-[#18181B]">{title}</h2>
      {description && (
        <p className="text-xs text-[#71717A]">{description}</p>
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
// Custom Select Component (ScopeSelector style)
// ============================================================================

interface CustomSelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  options: CustomSelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

function CustomSelect({ value, options, onChange, className = '' }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 h-9 px-3 min-w-[140px] rounded-md border border-[#E5E5E5] hover:bg-[#FAFAFA] transition-colors cursor-pointer"
      >
        <span className="text-[13px] text-[#18181B]">{selectedOption?.label || value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#A1A1AA] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div
            className="fixed bg-white rounded-lg border border-[#E5E5E5] shadow-[0_4px_12px_rgba(0,0,0,0.06)] z-[101]"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              minWidth: dropdownPosition.width,
            }}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value;
              const isFirst = index === 0;
              const isLast = index === options.length - 1;

              const roundedClass = isFirst
                ? 'rounded-t-md'
                : isLast
                ? 'rounded-b-md'
                : '';

              return (
                <button
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between gap-2.5 py-2.5 px-3 text-left
                    transition-colors cursor-pointer
                    ${roundedClass}
                    ${isSelected ? 'bg-[#F4F4F5]' : 'hover:bg-[#FAFAFA]'}
                  `}
                >
                  <span className={`text-[13px] text-[#18181B] ${isSelected ? 'font-semibold' : 'font-medium'}`}>
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#18181B]" />
                  )}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}
    </div>
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
  const [_quickActionMessage, setQuickActionMessage] = useState('');

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
              {/* Terminal Application */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Terminal Application
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Select your preferred terminal app
                  </span>
                </div>
                <CustomSelect
                  value={terminalApp}
                  onChange={setTerminalApp}
                  options={[
                    { value: 'Terminal', label: 'Terminal.app' },
                    { value: 'iTerm', label: 'iTerm2' },
                    { value: 'Warp', label: 'Warp' },
                    { value: 'Alacritty', label: 'Alacritty' },
                  ]}
                />
              </Row>

              {/* Warp Open Mode - Only shown when Warp is selected */}
              {terminalApp === 'Warp' && (
                <Row>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-medium text-[#18181B]">
                      Warp Open Mode
                    </span>
                    <span className="text-xs text-[#71717A]">
                      How to open new sessions in Warp
                    </span>
                  </div>
                  <CustomSelect
                    value={warpOpenMode}
                    onChange={(value) => setWarpOpenMode(value as 'tab' | 'window')}
                    options={[
                      { value: 'window', label: 'New Window' },
                      { value: 'tab', label: 'New Tab' },
                    ]}
                  />
                </Row>
              )}

              {/* Launch Command */}
              <Row>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Launch Command
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Command to execute in the terminal
                  </span>
                </div>
                <input
                  type="text"
                  value={claudeCommand}
                  onChange={(e) => setClaudeCommand(e.target.value)}
                  placeholder="claude"
                  className="h-9 w-[180px] px-3 rounded-md border border-[#E5E5E5] text-[13px] font-mono text-[#18181B] focus:outline-none focus:ring-1 focus:ring-[#18181B]"
                />
              </Row>

              {/* Finder Integration */}
              <Row noBorder>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-medium text-[#18181B]">
                    Finder Integration
                  </span>
                  <span className="text-xs text-[#71717A]">
                    Right-click 'Open with Ensemble' in Finder
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  {/* Status Badge */}
                  {quickActionStatus === 'success' || quickActionStatus === 'idle' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#DCFCE7]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
                      <span className="text-[11px] font-semibold text-[#16A34A]">Installed</span>
                    </div>
                  ) : quickActionStatus === 'error' ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FEE2E2]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#DC2626]" />
                      <span className="text-[11px] font-semibold text-[#DC2626]">Error</span>
                    </div>
                  ) : null}
                  {/* Reinstall Button */}
                  <button
                    onClick={handleInstallQuickAction}
                    disabled={quickActionStatus === 'installing'}
                    className="text-xs font-medium text-[#71717A] hover:text-[#18181B] transition-colors disabled:opacity-50"
                  >
                    {quickActionStatus === 'installing' ? 'Installing...' : 'Reinstall'}
                  </button>
                </div>
              </Row>
            </Card>
          </section>

          {/* About Section */}
          <section>
            <SectionHeader title="About" />
            <Card className="p-5">
              {/* App Info */}
              <div className="flex items-center gap-3.5">
                {/* App Icon - Deep Shadow 3D Style */}
                <div
                  className="w-12 h-12 rounded-[10px] flex-shrink-0 relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(145deg, #27272A 0%, #18181B 40%, #09090B 100%)',
                    boxShadow: '0 4.8px 14.4px -2.4px rgba(0,0,0,0.38), 0 1.2px 2.4px rgba(0,0,0,0.19), inset 0 0.6px 0 rgba(255,255,255,0.06)'
                  }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    className="absolute inset-0"
                  >
                    <defs>
                      {/* 连接线描边渐变 - 180度 (从上到下) */}
                      <linearGradient id="iconStrokeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#A1A1AA" />
                      </linearGradient>
                      {/* 图形填充渐变 - 135度 (从左上到右下) */}
                      <linearGradient id="iconFillGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#D4D4D8" />
                      </linearGradient>
                      {/* 图形阴影滤镜 */}
                      <filter id="iconShapeShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="1.8" stdDeviation="1.8" floodColor="#000000" floodOpacity="0.25" />
                      </filter>
                    </defs>

                    {/* 三角形连接线 - 位置(14, 15), 尺寸(20 x 17.32) */}
                    <path
                      d="M24 15 L14 32.32 L34 32.32 Z"
                      fill="none"
                      stroke="url(#iconStrokeGradient)"
                      strokeWidth="0.9"
                    />

                    {/* 六边形 - 位置(19.5, 10.5), 尺寸(9 x 9) */}
                    <polygon
                      points="24,10.5 28.5,12.75 28.5,17.25 24,19.5 19.5,17.25 19.5,12.75"
                      fill="url(#iconFillGradient)"
                      filter="url(#iconShapeShadow)"
                    />

                    {/* 圆形 - 位置(10, 28.32), 尺寸(8 x 8) */}
                    <circle
                      cx="14"
                      cy="32.32"
                      r="4"
                      fill="url(#iconFillGradient)"
                      filter="url(#iconShapeShadow)"
                    />

                    {/* 圆角矩形 - 位置(30.2, 28.52), 尺寸(7.6 x 7.6), 圆角 1.6 */}
                    <rect
                      x="30.2"
                      y="28.52"
                      width="7.6"
                      height="7.6"
                      rx="1.6"
                      fill="url(#iconFillGradient)"
                      filter="url(#iconShapeShadow)"
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
