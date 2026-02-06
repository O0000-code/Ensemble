# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2026-02-06

### Added

#### Core Management
- **Skills Management**: Import, organize, and deploy Claude Code skill files
  - Scan and import from `~/.claude/skills/`
  - Support for plugin-installed skills
  - Category and tag organization with custom icons
  - AI-powered auto-classification via Claude CLI
  - Global or project-level scope control
  - Usage statistics tracking

- **MCP Servers Management**: Manage Model Context Protocol server configurations
  - Import MCP configurations from `~/.claude.json`
  - Automatic tool discovery via MCP protocol
  - Category and tag organization
  - AI-powered auto-classification
  - Environment variable management
  - Scope control (global/project) with `~/.claude.json` sync

- **CLAUDE.md Management**: Manage Claude Code instruction files
  - Filesystem scanning for existing CLAUDE.md, CLAUDE.local.md, and `.claude/CLAUDE.md` files
  - Import and centrally manage CLAUDE.md files
  - Set a file as global context (`~/.claude/CLAUDE.md`)
  - Distribute to project directories with configurable paths

#### Organization
- **Categories**: Create and manage categories with custom colors
- **Tags**: Flexible tagging system with multi-item support
- **Category View**: Aggregate view of Skills, MCPs, and CLAUDE.md by category
- **Tag View**: Aggregate view of Skills, MCPs, and CLAUDE.md by tag

#### Scenes & Projects
- **Scenes**: Bundle Skills, MCPs, and CLAUDE.md files into reusable configuration presets
- **Projects**: Associate local project folders with Scenes
  - One-click configuration sync via symlinks (Skills) and `.mcp.json` (MCPs)
  - Configuration status tracking
  - Clear and re-sync as needed

#### System Integration
- **Finder Quick Action**: Right-click "Open with Ensemble" for folders in Finder
- **Terminal Selection**: Support for Terminal.app, iTerm2, Warp, and Alacritty
- **Configuration Sync**: Symlink-based Skills deployment and MCP config generation

#### User Experience
- Slide-in detail panel for all items
- Search and filter with category/tag sidebar
- Empty state guidance for new users
- Trash and recovery system for deleted items
- Import existing Claude Code configurations on first launch
- Plugin-installed Skills and MCPs detection

#### Technical Foundation
- Built with Tauri 2 (Rust backend + React frontend)
- React 18 + TypeScript + Tailwind CSS 4
- Zustand state management
- Native macOS window with custom titlebar

[Unreleased]: https://github.com/O0000-code/Ensemble/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/O0000-code/Ensemble/releases/tag/v1.0.0
