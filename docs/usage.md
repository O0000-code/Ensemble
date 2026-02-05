# Usage Guide

## First-Time Setup

When you first launch Ensemble, it will:

1. Create the data directory at `~/.ensemble/`
2. Detect existing Skills and MCPs from your Claude Code installation
3. Offer to import detected configurations

We recommend importing your existing configurations to get started quickly.

## Core Concepts

### Skills

Skills are Claude Code's skill modules - markdown files that provide Claude with specialized capabilities. In Ensemble:

- **Location**: Managed in `~/.ensemble/skills/`
- **Scope**:
  - `Global` - Active for all Claude Code sessions (symlinked to `~/.claude/skills/`)
  - `Project` - Only active when deployed to specific projects
- **Import Sources**:
  - Local Skills from `~/.claude/skills/`
  - Plugin-installed Skills

**Managing Skills:**
1. Navigate to the **Skills** section in the sidebar
2. Use the search bar to find specific skills
3. Click on a skill to view/edit details
4. Toggle the scope switch to change between Global/Project
5. Click "Auto Classify" to use AI for categorization

### MCP Servers

MCP (Model Context Protocol) Servers extend Claude Code with additional tools and data sources.

- **Location**: Configurations stored in `~/.ensemble/mcps/`
- **Scope**:
  - `Global` - Added to `~/.claude.json`
  - `Project` - Only in project's `.mcp.json`

**Managing MCPs:**
1. Navigate to **MCP Servers** in the sidebar
2. View provided tools for each MCP
3. Edit environment variables as needed
4. Toggle scope between Global/Project

### Scenes

Scenes are configuration bundles that combine multiple Skills, MCPs, and CLAUDE.md files.

**Creating a Scene:**
1. Navigate to **Scenes** in the sidebar
2. Click "New Scene"
3. Enter a name and description
4. Select Skills to include
5. Select MCPs to include
6. Optionally select a CLAUDE.md file
7. Click "Create"

**Use Cases:**
- "Web Development" scene with frontend skills and relevant MCPs
- "Data Analysis" scene with Python skills and database MCPs
- "Documentation" scene with writing-focused configurations

### Projects

Projects link Scenes to specific local directories, enabling configuration deployment.

**Adding a Project:**
1. Navigate to **Projects** in the sidebar
2. Click "Add Project"
3. Select a local folder
4. Choose a Scene to associate
5. Click "Sync Configuration"

**Sync Process:**
- Creates `项目/.claude/skills/` with symlinks to selected Skills
- Creates `项目/.mcp.json` with MCP configurations
- Distributes CLAUDE.md if included in the Scene

### CLAUDE.md

CLAUDE.md files provide context and instructions to Claude Code at different levels.

**Managing CLAUDE.md:**
1. Navigate to **CLAUDE.md** in the sidebar
2. Scan for existing files or create new ones
3. Set one as Global (synced to `~/.claude/CLAUDE.md`)
4. Include in Scenes for project-level deployment

## Auto-Classification

Ensemble can automatically categorize your Skills, MCPs, and CLAUDE.md files using AI.

**Setup:**
1. Go to **Settings**
2. Enter your Anthropic API key
3. Enable "Auto-classify new items"

**Manual Classification:**
- Click the "Auto Classify" button in any module
- AI will assign appropriate categories, tags, and icons

## Finder Integration

Install the Quick Action to open project folders with Claude Code directly from Finder:

1. Go to **Settings**
2. Click "Install Finder Integration"
3. Right-click any folder in Finder
4. Select "Open with Ensemble"

## Terminal Support

Ensemble supports multiple terminal applications:

- **Terminal.app** (default)
- **iTerm2**
- **Warp**
- **Alacritty**

Configure in **Settings** > Terminal Application.

## Trash & Recovery

Deleted items are moved to trash and can be recovered:

1. Go to **Settings**
2. Scroll to "Trash" section
3. View deleted items
4. Click "Recover" to restore

## Tips

1. **Use Scenes for context switching** - Create different Scenes for different types of work
2. **Keep Global scope minimal** - Only set frequently-used items as Global
3. **Organize with categories** - Use consistent category names across Skills and MCPs
4. **Regular cleanup** - Review and remove unused configurations periodically
