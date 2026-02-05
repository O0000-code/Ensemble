# Hacker News Show HN Content - Ensemble

## Document Info
- **Date**: 2026-02-05
- **Author**: SubAgent U
- **Platform**: Hacker News (Show HN)
- **Product**: Ensemble - Claude Code Configuration Manager

---

## 1. Title Candidates (5 Options)

### Option A (Recommended - Clear and Direct)
```
Show HN: Ensemble – Manage Claude Code Skills, MCPs, and CLAUDE.md in one app
```
- Character count: 68
- Strength: Lists all three core features clearly

### Option B (Problem-Focused)
```
Show HN: Ensemble – Scene-based config manager for Claude Code (macOS)
```
- Character count: 66
- Strength: Highlights the unique "Scenes" concept and platform

### Option C (Pain Point Focus)
```
Show HN: Ensemble – Stop wasting Claude Code context on unused MCPs and Skills
```
- Character count: 73
- Strength: Directly addresses the pain point, slightly long

### Option D (Minimalist)
```
Show HN: Ensemble – A unified config manager for Claude Code
```
- Character count: 54
- Strength: Short and punchy

### Option E (Technical)
```
Show HN: Ensemble – Tauri app to manage Claude Code context per-project
```
- Character count: 66
- Strength: Mentions tech stack (Tauri), appeals to technical users

### Title Selection Guide

| Scenario | Recommended Title |
|----------|-------------------|
| General audience | Option A or D |
| Emphasize innovation | Option B |
| Maximize clicks | Option C |
| Technical audience | Option E |

---

## 2. First Comment - Full Version

```
Hi HN, I built Ensemble because managing Claude Code configuration was driving me crazy.

**The Problem**

I use Claude Code daily for different projects: web dev, data analysis, writing, etc.
Each project needs different MCPs and Skills. But here's the thing - every MCP/Skill you
install consumes context space in *every* session, whether you use it or not.

I found myself constantly jumping between settings, enabling/disabling tools, copying
CLAUDE.md files between projects. It was tedious and error-prone.

**What Ensemble Does**

Ensemble lets you create "Scenes" - predefined configurations you can switch instantly:

- **Skills Management**: Scan, categorize, and organize your /skills folder with tags
  and AI-powered classification
- **MCP Servers**: Visual config editor with tool discovery
- **CLAUDE.md**: Manage global settings and distribute to projects
- **Scenes**: Bundle specific Skills, MCPs, and settings together
- **Projects**: Associate scenes with project folders, sync with one click
- **Finder Integration**: Right-click any folder to apply a scene

**Tech Notes**

Built with Tauri 2.0 (Rust backend + React frontend). Chose Tauri over Electron for
smaller bundle size and native performance. The app is ~15MB vs what would be 150MB+
with Electron.

**Open Source**

MIT licensed: [GitHub link]

**What I'd Love to Hear**

- How do you currently manage your Claude Code setup across projects?
- Are there features that would make this more useful for your workflow?
- Any concerns about the architecture or approach?

I'm around all day to answer questions. Thanks for checking it out!
```

---

## 3. First Comment - Concise Version

```
Hi HN, I built Ensemble to solve a personal annoyance with Claude Code.

Every MCP and Skill you install takes context space in every session. When working on
different projects, I was constantly toggling tools on/off and copying CLAUDE.md files.

Ensemble introduces "Scenes" - predefined configurations you can switch instantly.
Web dev scene, data analysis scene, writing scene - each with its own MCPs, Skills,
and CLAUDE.md settings.

Built with Tauri 2.0 (Rust + React), MIT licensed.

Would love to hear how others manage their Claude Code config, and what features
would be useful. Happy to answer questions!
```

---

## 4. Technical Details Comment

Use this as a follow-up comment or when responding to technical questions:

```
Some technical details for those interested:

**Architecture**
- Frontend: React + TypeScript + TailwindCSS
- Backend: Rust (via Tauri 2.0)
- Config parsing: Custom JSON/YAML handlers in Rust
- File watching: notify-rs for live config sync

**Why Tauri over Electron**
- Bundle size: ~15MB vs 150MB+
- Memory usage: Typically 50-80MB vs 200MB+
- Native webview (WKWebView on macOS) instead of bundled Chromium
- Rust backend for safe file operations

**How Scenes Work**
A Scene is essentially a snapshot of:
1. List of enabled Skills (by path/id)
2. MCP server configurations
3. CLAUDE.md template content

When you apply a scene to a project:
1. Generates project-specific `claude_desktop_config.json`
2. Creates/updates project CLAUDE.md
3. Symlinks or copies relevant skill files

**Current Limitations**
- macOS only (AppKit/SwiftUI integration for Finder extension)
- Requires Claude Code to be installed
- No cloud sync (local config only, by design)

Happy to dive deeper into any of these areas.
```

---

## 5. Criticism Response Templates

### Template A: "Why not just use config files directly?"

```
Fair point. You absolutely can manage claude_desktop_config.json manually, and many
people do.

Ensemble started because I was editing that JSON file 5-10 times a day switching
between projects. The GUI isn't the main value - it's the "Scenes" concept: defining
named configurations and applying them with one action.

Think of it like git branches for your Claude Code config. You could manage branches
with raw git commands, but a GUI like GitKraken or Fork makes certain workflows faster.

That said, if your workflow is simple (same config for everything), you probably
don't need this. Ensemble is for people juggling multiple project contexts.
```

### Template B: "Why macOS only?"

```
Two reasons:

1. **Finder Integration**: The right-click "Apply Scene" feature uses macOS-specific
   APIs (FinderSync extension). This is one of the more useful features for quick
   project switching.

2. **Development focus**: I use macOS daily, so I built what I could test properly.
   The core Tauri app could theoretically run on Windows/Linux, but the Finder
   integration would need platform-specific alternatives.

If there's enough interest, Windows Explorer extension or Linux file manager
integration could be added. PRs welcome for sure.

What platform are you on? Would be useful to know the demand.
```

### Template C: "This seems over-engineered / Why not a CLI tool?"

```
I considered a CLI approach first, actually. Ended up with a GUI for a few reasons:

1. **Discovery**: Browsing installed Skills and MCPs is easier visually than
   remembering file paths
2. **Config editing**: MCP server configs can get complex. Visual editor catches
   syntax errors before you hit save
3. **Non-developers**: Some Claude Code users aren't CLI-comfortable

That said, the underlying logic could definitely power a CLI tool. The Rust backend
handles all the actual work - the React frontend is just one interface to it.

Would you use a CLI version? Genuinely curious about the use case.
```

---

## 6. Praise Response Templates

### Template A: General Appreciation

```
Thanks! Really glad it resonates.

If you end up trying it, I'd love to hear how it fits your workflow - especially any
rough edges you hit. Still early days, so feedback directly shapes what I work on next.

GitHub issues or email (in my profile) both work for feedback.
```

### Template B: Technical Compliment (e.g., "Nice use of Tauri")

```
Thanks! Tauri has been great to work with. The Rust backend gives a lot of confidence
around file operations, and the bundle size difference vs Electron is dramatic.

One tricky part was the Finder extension - had to bridge between Tauri's webview and
a native AppKit component. If anyone's curious about that integration, happy to write
up the approach.
```

---

## 7. Posting Time Recommendations

### Primary Recommendation: Weekend Morning

| Day | Time (PT) | Time (Beijing) | Rationale |
|-----|-----------|----------------|-----------|
| **Saturday** | 8:00-10:00 AM | Sunday 0:00-2:00 AM | 2.5x higher chance of reaching front page |
| **Sunday** | 8:00-10:00 AM | Monday 0:00-2:00 AM | Lower competition, engaged weekend readers |

**Why weekend?**
- Competition is lower (fewer corporate launches)
- HN users have more time to try new tools
- Higher engagement per post on average

### Secondary Recommendation: Weekday Morning

| Day | Time (PT) | Time (Beijing) | Rationale |
|-----|-----------|----------------|-----------|
| **Tuesday** | 8:00-10:00 AM | Wednesday 0:00-2:00 AM | Peak activity, maximum exposure |
| **Wednesday** | 8:00-10:00 AM | Thursday 0:00-2:00 AM | Good balance of traffic and competition |

**Why Tuesday/Wednesday?**
- Highest user activity
- Developers actively looking for tools
- More votes possible if it gains traction

### Backup Option: Weekday Evening

| Day | Time (PT) | Time (Beijing) | Rationale |
|-----|-----------|----------------|-----------|
| **Monday-Thursday** | 5:00-6:00 PM | Tuesday-Friday 9:00-10:00 AM | Catches evening US readers + morning Asia/Europe |

### Practical Advice for Beijing Timezone

If posting at midnight is difficult:
- **Prepare everything in advance**: Title, first comment, technical comment
- **Use a scheduling tool or alarm**
- **Alternative**: Post during Beijing morning (PT evening) - less optimal but manageable

---

## 8. Pre-Launch Checklist

### Must Have Before Posting

- [ ] GitHub repository is public
- [ ] README is comprehensive (installation, screenshots, usage)
- [ ] App is downloadable (DMG or Homebrew)
- [ ] First comment is written and saved
- [ ] Technical comment is prepared
- [ ] HN account has some history (not brand new)

### Nice to Have

- [ ] GIF or video demo linked in README
- [ ] GitHub Releases with proper versioning
- [ ] Basic documentation or wiki
- [ ] Discord or discussion channel for follow-up

---

## 9. Post-Launch Engagement Strategy

### First 2 Hours (Critical)

1. Post the first comment **immediately** after submitting
2. Refresh every 5-10 minutes
3. Respond to every comment within 15 minutes if possible
4. Be genuine, technical, and avoid defensive responses

### Hours 2-6

1. Check every 30 minutes
2. Add technical details in responses
3. If reaching front page, be prepared for traffic spike
4. Thank constructive feedback, engage with criticism thoughtfully

### After 6 Hours

1. Check hourly
2. Late comments often have thoughtful feedback
3. Follow up on any promised features or explanations

### What NOT to Do

- Do not ask friends/colleagues to upvote or comment
- Do not post promotional replies to other HN threads
- Do not respond defensively to criticism
- Do not spam the same reply to multiple comments

---

## 10. Quick Reference Card

```
TITLE FORMAT:
Show HN: Ensemble – [clear description of what it does]

FIRST COMMENT STRUCTURE:
1. Brief intro (who you are)
2. Problem you faced
3. What you built
4. Technical highlights
5. Call for feedback

RESPONSE TONE:
- Acknowledge valid criticism
- Provide data/reasoning, not emotion
- Thank constructive feedback
- Stay curious, not defensive

TIMING:
- Best: Saturday/Sunday 8-10 AM PT
- Good: Tuesday/Wednesday 8-10 AM PT
- Avoid: Friday afternoon, holidays
```

---

## Appendix: Additional Response Scenarios

### Q: "How is this different from just having multiple config files?"

```
Ensemble adds three things on top of raw config files:

1. **Switching**: One click to swap between configs vs manually copying files
2. **Project binding**: Associate a scene with a folder, so the right config loads
   automatically
3. **Component management**: Browse/organize Skills and MCPs visually instead of
   remembering paths

If you're already happy with shell scripts or manual management, you might not need
this. But for me, the visual approach + one-click switching saves significant daily
friction.
```

### Q: "Any plans for Linux/Windows support?"

```
The core app (Tauri + React) can compile cross-platform. The main blocker is the
Finder extension, which uses macOS-specific APIs.

For Windows, an Explorer context menu extension would be the equivalent.
For Linux, it's more fragmented (Nautilus scripts, Dolphin service menus, etc.).

If there's demand, I'd prioritize Windows next since the shell extension APIs are
more standardized. PRs welcome if someone wants to tackle Linux file manager integration.

What platform are you on?
```

### Q: "Does this work with other AI coding tools?"

```
Currently Ensemble is built specifically around Claude Code's configuration format
(claude_desktop_config.json, CLAUDE.md, /skills folder).

The architecture could theoretically support other tools - the "Scene" concept is
generic. But each tool has different config formats and locations.

Are you thinking of a specific tool? Would be curious what the config management
pain points look like there.
```

---

*End of Hacker News Content Document*
