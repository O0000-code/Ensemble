# Installation Guide

## System Requirements

- **Operating System**: macOS 12.0 (Monterey) or later
- **Architecture**: Apple Silicon (M1/M2/M3) or Intel
- **Disk Space**: ~100MB
- **Claude Code**: Must be installed and configured

## Download

### Pre-built Release

1. Go to the [Releases](https://github.com/O0000-code/Ensemble/releases) page
2. Download the latest `.dmg` file for your architecture
3. Open the DMG and drag Ensemble to your Applications folder
4. Launch Ensemble from Applications

### First Launch

On first launch, macOS may show a security warning because Ensemble is not notarized. To open it:

1. Right-click (or Control-click) the Ensemble app
2. Select "Open" from the context menu
3. Click "Open" in the dialog that appears

This only needs to be done once.

## Build from Source

### Prerequisites

1. **Node.js 18+**
   ```bash
   # Using Homebrew
   brew install node

   # Or using nvm
   nvm install 18
   nvm use 18
   ```

2. **Rust 1.77+**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source ~/.cargo/env
   ```

3. **Xcode Command Line Tools**
   ```bash
   xcode-select --install
   ```

### Build Steps

```bash
# Clone the repository
git clone https://github.com/O0000-code/Ensemble.git
cd Ensemble

# Install Node.js dependencies
npm install

# Build for production
npm run tauri build
```

The built application will be in `src-tauri/target/release/bundle/`.

### Development Mode

For development with hot-reload:

```bash
npm run tauri dev
```

## Verification

After installation, verify Ensemble is working:

1. Launch the application
2. You should see the main interface with sidebar navigation
3. Check Settings to configure your preferences

## Uninstallation

To completely remove Ensemble:

1. Quit the application
2. Delete from Applications folder
3. Optionally remove data: `rm -rf ~/.ensemble`

Note: Removing `~/.ensemble` will delete all your managed configurations.
