# Investigation Phase - SubAgent Execution Plan

## Purpose
This document defines the investigation tasks for understanding the current "Open with Ensemble" implementation before creating a fix plan.

## Investigation Areas

### Area 1: Rust Backend Investigation
**Focus**: All Rust code related to:
- Deep link / URL scheme handling
- File/folder open handlers
- Window visibility management (show/hide/focus)
- Project/Scene lookup when a path is received
- Tauri commands related to launching Claude Code

**Key Questions to Answer**:
1. How does the app receive the "Open with Ensemble" request?
2. What is the current flow when a folder path is received?
3. Where is the decision made about showing/hiding the window?
4. How does it check if a folder has an associated Scene?

**Output**: Write findings to `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-with-ensemble-fix/findings-rust-backend.md`

### Area 2: Frontend Investigation
**Focus**: All frontend code related to:
- Launch Claude Code modal component
- Window state management
- Event listeners for backend messages about folder opening
- Project creation/lookup when folder is opened

**Key Questions to Answer**:
1. How does the frontend receive notification that a folder was opened?
2. What controls the Launch Claude Code modal visibility?
3. How does the frontend communicate back to Rust about showing/hiding window?
4. What state determines if a project has a Scene?

**Output**: Write findings to `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-with-ensemble-fix/findings-frontend.md`

### Area 3: Tauri Configuration & Deep Link
**Focus**:
- tauri.conf.json configuration
- Info.plist or any macOS-specific configuration
- Deep link / URL scheme setup
- File association setup

**Key Questions to Answer**:
1. What URL scheme is registered for the app?
2. How is "Open with" configured for folders?
3. What entry point handles the deep link/file open?

**Output**: Write findings to `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-with-ensemble-fix/findings-config.md`

### Area 4: Git History Analysis
**Focus**:
- Recent commits that touched window visibility logic
- Changes to the launch/open functionality
- When did the regression likely occur

**Key Questions to Answer**:
1. What recent commits modified the open-with or window visibility logic?
2. Can we identify when the behavior changed?
3. What was the original working implementation?

**Output**: Write findings to `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-with-ensemble-fix/findings-git-history.md`

## SubAgent Instructions

Each SubAgent MUST:
1. First read this planning document to understand context
2. First read `/Users/bo/Documents/Development/Ensemble/Ensemble2/docs/open-with-ensemble-fix/01-task-understanding.md`
3. Thoroughly explore their assigned area
4. Write detailed findings to their designated output file
5. Include specific file paths and line numbers for all relevant code
6. Include code snippets of critical sections
7. Answer all the key questions in their area
8. Highlight any issues or concerns discovered

## Expected Deliverables

After all investigations complete, we should have:
1. Complete understanding of current implementation flow
2. Identified location of the bug
3. Clear picture of what needs to change
4. Enough context to design a precise fix
