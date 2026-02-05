# Ensemble

A macOS desktop application for managing Claude Code configurations - Skills, MCP Servers, CLAUDE.md files, and project-level settings.

## Overview

Ensemble helps Claude Code power users efficiently manage their growing collection of Skills, MCP Servers, and context files. Instead of manually editing configuration files, Ensemble provides a visual interface to:

- **Organize** - Categorize and tag your Skills and MCPs
- **Combine** - Create Scenes that bundle related configurations
- **Deploy** - Sync configurations to specific projects with one click
- **Discover** - Use AI to auto-classify new items

## Features

### Skills Management
- Import existing skills from `~/.claude/skills/`
- Support for plugin-installed skills
- Global or project-level scope control
- AI-powered auto-classification
- Usage statistics tracking

### MCP Servers Management
- Import MCP configurations from `~/.claude.json`
- Automatic tool discovery
- Environment variable management
- Scope control (global/project)

### Scenes
- Bundle multiple Skills, MCPs, and CLAUDE.md files
- One-click application to projects
- Reusable configuration templates

### Projects
- Associate local project folders with Scenes
- Automatic configuration sync via symlinks
- Easy configuration cleanup

### CLAUDE.md Management
- Scan and import existing CLAUDE.md files
- Set global or project-level context
- Distribute to multiple projects

## Installation

### Prerequisites
- macOS 12.0 or later
- [Claude Code](https://claude.ai/claude-code) installed

### Download
Download the latest release from the [Releases](https://github.com/O0000-code/Ensemble/releases) page.

### Build from Source

Requirements:
- Node.js 18+
- Rust 1.77+

```bash
# Clone the repository
git clone https://github.com/O0000-code/Ensemble.git
cd Ensemble

# Install dependencies
npm install

# Development mode
npm run tauri dev

# Production build
npm run tauri build
```

## Usage

### Quick Start

1. **Launch Ensemble** - Open the application
2. **Import existing configurations** - Ensemble will detect and offer to import your existing Skills and MCPs
3. **Organize** - Add categories and tags to your items
4. **Create a Scene** - Bundle related Skills and MCPs together
5. **Add a Project** - Select a project folder and assign a Scene
6. **Sync** - Click "Sync Configuration" to deploy

### Data Location

Ensemble stores its data in `~/.ensemble/`:
```
~/.ensemble/
├── data.json           # Application data
├── skills/             # Managed skills
├── mcps/               # MCP configurations
├── claude-md/          # CLAUDE.md files
└── trash/              # Deleted items (recoverable)
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS 4, Zustand
- **Backend**: Tauri 2, Rust
- **Build**: Vite

## Documentation

See the [docs](./docs) directory for detailed documentation:
- [Installation Guide](./docs/installation.md)
- [Usage Guide](./docs/usage.md)
- [Development Guide](./docs/development.md)

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
