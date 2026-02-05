# Development Guide

## Architecture Overview

Ensemble is built with [Tauri 2](https://tauri.app/), combining a Rust backend with a React frontend.

```
Ensemble/
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript types
│   └── lib/                # Utility functions
├── src-tauri/              # Rust backend
│   └── src/
│       ├── main.rs         # Application entry
│       ├── lib.rs          # Tauri commands
│       └── commands/       # Command implementations
└── docs/                   # Documentation
```

## Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript 5** - Type safety
- **Vite 6** - Build tool with HMR
- **Tailwind CSS 4** - Utility-first styling
- **Zustand 5** - State management
- **React Router 7** - Client-side routing
- **Lucide React** - Icon library

### Backend
- **Tauri 2** - Desktop app framework
- **Rust** - Systems programming language
- **serde** - Serialization/deserialization
- **tokio** - Async runtime
- **reqwest** - HTTP client (for Anthropic API)

## Development Setup

### Prerequisites

```bash
# Install Node.js (18+)
brew install node

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Xcode CLI tools
xcode-select --install
```

### Getting Started

```bash
# Clone repository
git clone https://github.com/O0000-code/Ensemble.git
cd Ensemble

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server only |
| `npm run build` | Build frontend for production |
| `npm run tauri dev` | Start full Tauri development |
| `npm run tauri build` | Build production application |

## Project Structure

### Frontend (`src/`)

```
src/
├── components/
│   ├── common/          # Shared components (Button, Input, Modal)
│   ├── layout/          # Layout components (Sidebar, MainContent)
│   └── skills/          # Feature-specific components
├── pages/
│   ├── SkillsPage.tsx
│   ├── McpServersPage.tsx
│   ├── ScenesPage.tsx
│   ├── ProjectsPage.tsx
│   └── SettingsPage.tsx
├── stores/
│   ├── skillsStore.ts   # Skills state management
│   ├── mcpStore.ts      # MCP state management
│   └── ...
└── types/
    └── index.ts         # TypeScript interfaces
```

### Backend (`src-tauri/`)

```
src-tauri/
├── src/
│   ├── main.rs          # Tauri app initialization
│   ├── lib.rs           # Command exports
│   └── commands/
│       ├── skills.rs    # Skill operations
│       ├── mcp.rs       # MCP operations
│       └── ...
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration
```

## Key Concepts

### Tauri Commands

Backend functions are exposed to the frontend via `#[tauri::command]`:

```rust
#[tauri::command]
fn get_skills() -> Result<Vec<Skill>, String> {
    // Implementation
}
```

Called from frontend:

```typescript
import { invoke } from '@tauri-apps/api/core';

const skills = await invoke<Skill[]>('get_skills');
```

### State Management

Zustand stores manage frontend state:

```typescript
// stores/skillsStore.ts
export const useSkillsStore = create<SkillsState>((set, get) => ({
  skills: [],
  loadSkills: async () => {
    const skills = await invoke<Skill[]>('get_skills');
    set({ skills });
  },
}));
```

### Styling

Tailwind CSS with custom configuration:

```tsx
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
  Click me
</button>
```

## Building

### Development Build

```bash
npm run tauri dev
```

Features:
- Hot Module Replacement for frontend
- Automatic Rust recompilation
- DevTools enabled

### Production Build

```bash
npm run tauri build
```

Outputs:
- `src-tauri/target/release/Ensemble` - Binary
- `src-tauri/target/release/bundle/dmg/` - macOS DMG
- `src-tauri/target/release/bundle/macos/` - macOS App

## Contributing

### Code Style

- **TypeScript**: Follow existing patterns, use strict types
- **Rust**: Run `cargo fmt` before committing
- **Commits**: Use conventional commit messages

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a PR with clear description

### Reporting Issues

When reporting bugs, please include:
- macOS version
- Ensemble version
- Steps to reproduce
- Expected vs actual behavior
