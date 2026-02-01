# Detail Panel Design Specification Analysis

This document provides a comprehensive analysis of the design specifications extracted from the Pencil design file `/Users/bo/Downloads/MCP 管理.pen`.

## Table of Contents

1. [Overall Page Layout](#overall-page-layout)
2. [MCP Detail Page](#mcp-detail-page)
3. [Scene Detail Page](#scene-detail-page)
4. [Projects Detail Page](#projects-detail-page)
5. [Skill Detail Page](#skill-detail-page)
6. [Item Card Styles](#item-card-styles)
7. [Color System](#color-system)
8. [Typography](#typography)
9. [Spacing System](#spacing-system)

---

## Overall Page Layout

All Detail pages share a consistent three-column layout structure:

### Window Dimensions
- **Total Width**: 1440px
- **Total Height**: 900px
- **Background**: `#FFFFFF`

### Column Structure

| Column | Component | Width | Notes |
|--------|-----------|-------|-------|
| 1 | Sidebar | 260px | Fixed width, left border |
| 2 | List Panel | 380px (MCP/Scene/Skill) / 400px (Projects) | Contains item list |
| 3 | Detail Panel | 800px (MCP/Scene/Skill) / fill_container (Projects) | Main content area |

### Sidebar Structure
- **Width**: 260px
- **Height**: 900px (full height)
- **Background**: `#FFFFFF`
- **Border**: Right border `#E5E5E5`, 1px

#### Sidebar Header
- **Height**: 56px
- **Padding**: `[0, 12, 0, 20]` (top, right, bottom, left)
- **Border**: Bottom border `#E5E5E5`, 1px
- **Layout**: Horizontal, space-between

##### Traffic Lights
- **Size**: 12px diameter each
- **Gap**: 8px
- **Colors**:
  - Close: `#FF5F57`
  - Minimize: `#FEBC2E`
  - Maximize: `#28C840`

##### Collapse Button
- **Size**: 24px x 24px
- **Corner Radius**: 6px
- **Icon**: `chevron-left`, 16px, `#D4D4D8`

#### Sidebar Content
- **Padding**: `[16, 16, 8, 16]`
- **Gap**: 24px
- **Layout**: Vertical, space-between

---

## MCP Detail Page

**Node ID**: `ltFNv`

### List Panel (`yfrKH`)
- **Width**: 380px
- **Height**: 900px
- **Border**: Right border `#E5E5E5`, 1px
- **Layout**: Vertical

#### List Header (`XHJsB`)
- **Height**: 56px
- **Padding**: `[0, 20]`
- **Border**: Bottom border `#E5E5E5`, 1px
- **Layout**: Horizontal, space-between

##### Title Section
- **Title**: "MCP Servers"
- **Font**: Inter, 16px, weight 600, `#18181B`
- **Badge**: Active count badge
  - Corner Radius: 4px
  - Background: `#DCFCE7`
  - Text: `#16A34A`, Inter 10px, weight 600

##### Search Box (`9yhPD`)
- **Width**: 140px
- **Height**: 32px
- **Corner Radius**: 6px
- **Padding**: `[0, 10]`
- **Border**: `#E5E5E5`, 1px
- **Gap**: 6px
- **Icon**: `search`, 14px, `#A1A1AA`
- **Placeholder**: "Search servers...", Inter 12px, `#A1A1AA`

#### List Content (`yd1ny`)
- **Padding**: 12px
- **Gap**: 12px
- **Layout**: Vertical

### Detail Panel (`ZDGvA`)
- **Width**: 800px
- **Height**: 900px
- **Layout**: Vertical

#### Detail Header (`NHemh`)
- **Height**: 56px
- **Padding**: `[0, 28]`
- **Border**: Bottom border `#E5E5E5`, 1px
- **Layout**: Horizontal, space-between

##### Left Section
- **Icon Container** (`nFvA2`):
  - Size: 36px x 36px
  - Corner Radius: 8px
  - Background: `#F4F4F5`
  - Icon: 20px, `#52525B`
- **Title Wrap** (`P6kwX`):
  - Gap: 2px
  - Layout: Vertical

##### Right Section
- **Close Button** (`YIIM8`):
  - Size: 32px x 32px
  - Corner Radius: 6px
  - Border: `#E5E5E5`, 1px

#### Detail Content (`NLwU9`)
- **Padding**: 28px
- **Gap**: 28px
- **Layout**: Vertical

---

## Scene Detail Page

**Node ID**: `LlxKB`

### List Panel (`jrYgx`)
- **Width**: 380px
- **Height**: 900px
- **Border**: Right border `#E5E5E5`, 1px
- **Layout**: Vertical

#### List Header (`5YI21`)
- **Height**: 56px
- **Padding**: `[0, 20]`
- **Border**: Bottom border `#E5E5E5`, 1px

##### Title Section
- **Title**: "Scenes"
- **Font**: Inter, 14px, weight 600, `#18181B`
- **Count Badge** (`SjHhf`):
  - Corner Radius: 10px
  - Background: `#F4F4F5`
  - Padding: `[2, 8]`

##### Add Button (`SIG29`)
- **Size**: 32px x 32px
- **Corner Radius**: 6px
- **Background**: `#18181B`

#### List Content (`5vRa7`)
- **Padding**: 12px
- **Gap**: 12px
- **Layout**: Vertical

### Detail Panel (`Rfl4k`)
- **Width**: 800px
- **Height**: 900px
- **Layout**: Vertical

#### Detail Header (`YYjyD`)
- **Height**: 56px
- **Padding**: `[0, 28]`
- **Border**: Bottom border `#E5E5E5`, 1px

##### Action Buttons
- **Edit Button** (`fVQux`):
  - Height: 32px
  - Corner Radius: 6px
  - Padding: `[0, 12]`
  - Border: `#E5E5E5`, 1px
  - Gap: 6px
- **Delete Button** (`BFaC7`):
  - Height: 32px
  - Corner Radius: 6px
  - Padding: `[0, 12]`
  - Border: `#FEE2E2`, 1px (red tint)
  - Gap: 6px
- **Close Button** (`sO8t6`):
  - Size: 32px x 32px
  - Corner Radius: 6px
  - Border: `#E5E5E5`, 1px

#### Detail Content (`3LaLp`)
- **Padding**: 28px
- **Gap**: 28px
- **Layout**: Vertical

---

## Projects Detail Page

**Node ID**: `y0Mt4`

### List Panel (`1UHI4`)
- **Width**: 400px (slightly wider than other pages)
- **Height**: fill_container
- **Border**: Right border `#E5E5E5`, 1px
- **Layout**: Vertical

#### List Header (`FL4vZ`)
- **Height**: 56px
- **Padding**: `[0, 20]`
- **Border**: Bottom border `#E5E5E5`, 1px

##### Title
- **Text**: "Projects"
- **Font**: Inter, 16px, weight 600, `#18181B`

##### Search Box (`1RMCJ`)
- **Width**: 160px
- **Height**: 32px
- **Corner Radius**: 6px
- **Padding**: `[0, 10]`
- **Border**: `#E5E5E5`, 1px
- **Gap**: 8px
- **Icon**: `search`, 14px, `#A1A1AA`
- **Placeholder**: "Search...", Inter 12px, `#A1A1AA`

#### List Content (`nt6tB`)
- **Padding**: 12px
- **Gap**: 12px
- **Layout**: Vertical

### Detail Panel (`jPr4K`)
- **Width**: fill_container
- **Height**: fill_container
- **Layout**: Vertical

#### Detail Header (`49Gfm`)
- **Height**: 56px
- **Padding**: `[0, 28]`
- **Border**: Bottom border `#E5E5E5`, 1px

##### Title
- **Text**: "Project Configuration"
- **Font**: Inter, 16px, weight 600, `#18181B`

##### Action Buttons
- **Open Folder Button** (`UxQSq`):
  - Height: 32px
  - Corner Radius: 6px
  - Padding: `[0, 12]`
  - Border: `#E5E5E5`, 1px
  - Gap: 6px
- **Close Button** (`bQ374`):
  - Size: 32px x 32px
  - Corner Radius: 6px
  - Border: `#E5E5E5`, 1px

#### Detail Content (`i4vWo`)
- **Padding**: 28px
- **Gap**: 28px
- **Layout**: Vertical

---

## Skill Detail Page

**Node ID**: `nNy4r`

The Skill Detail page follows the same structure as the MCP Detail page but is currently empty in the design file. The structure would be:

- **Sidebar**: 260px
- **List Panel**: 380px
- **Detail Panel**: 800px

---

## Item Card Styles

### MCP Detail - Item Card (`EkCYJ`)

**Normal State**
- **Corner Radius**: 8px
- **Padding**: `[16, 20]` (vertical, horizontal)
- **Gap**: 14px
- **Border**: `#E5E5E5`, 1px, inside
- **Background**: transparent (no fill)
- **Width**: fill_container
- **Layout**: Horizontal, align-items: center

**Selected State** (`ohcRu`)
- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Gap**: 14px
- **Border**: `#E5E5E5`, 1px, inside
- **Background**: `#FAFAFA`
- **Width**: fill_container

#### Icon Container (`ObT8L`)
- **Size**: 40px x 40px
- **Corner Radius**: 8px
- **Background**: `#FAFAFA` (normal) / `#F4F4F5` (selected)
- **Layout**: Center justified

##### Icon Inner
- **Size**: 20px x 20px
- **Color**: `#52525B` (normal) / `#18181B` (selected)
- **Font Family**: lucide

#### Info Section (`ZuGoV`)
- **Gap**: 4px
- **Layout**: Vertical
- **Width**: fill_container

##### Name
- **Font**: Inter, 14px, weight 500 (normal) / weight 600 (selected)
- **Color**: `#18181B`

##### Description
- **Font**: Inter, 12px, weight normal
- **Color**: `#71717A`

#### Toggle (`HQGCN`)
- **Size**: 36px x 20px
- **Corner Radius**: 10px
- **Background (On)**: `#18181B`
- **Background (Off)**: `#E5E5E5`
- **Padding**: 2px
- **Justify Content**: end

##### Knob
- **Size**: 16px x 16px
- **Corner Radius**: 8px
- **Background**: `#FFFFFF`

---

### Scene Detail - Item Card (`Fs7Ov`)

**Normal State**
- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Gap**: 14px
- **Border**: `#E5E5E5`, 1px, inside
- **Background**: transparent
- **Width**: fill_container
- **Layout**: Horizontal, align-items: center

**Selected State** (`9GGlC`)
- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Gap**: 14px
- **Border**: `#E5E5E5`, 1px, inside
- **Background**: `#FAFAFA`
- **Width**: fill_container

#### Icon Container (`U2S97`)
- **Size**: 40px x 40px
- **Corner Radius**: 8px
- **Background**: `#F4F4F5` (normal) / `#FFFFFF` (selected)
- **Layout**: Center justified

##### Icon Inner
- **Size**: 20px x 20px
- **Color**: `#52525B` (normal) / `#18181B` (selected)
- **Font Family**: lucide

#### Info Section (`2zsTs`)
- **Gap**: 4px
- **Layout**: Vertical
- **Width**: fill_container

##### Name
- **Font**: Inter, 14px, weight 500
- **Color**: `#18181B`

##### Meta
- **Font**: Inter, 12px, weight normal
- **Color**: `#71717A`
- **Format**: "X Skills · Y MCPs"

---

### Projects Detail - Item Card (`w3JFC`)

**Normal/Selected State** (Selected state has `#FAFAFA` background)
- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Gap**: 14px
- **Border**: `#E5E5E5`, 1px, inside
- **Background**: `#FAFAFA` (selected)
- **Width**: fill_container
- **Layout**: Horizontal, align-items: center, justify-content: space-between

#### Icon Container (`Vr1qE`)
- **Size**: 40px x 40px
- **Corner Radius**: 8px
- **Background**: `#F4F4F5`
- **Layout**: Center justified

##### Icon Inner
- **Size**: 20px x 20px
- **Icon**: `folder`
- **Color**: `#18181B`
- **Font Family**: lucide

#### Info Section (`8nzIo`)
- **Gap**: 4px
- **Layout**: Vertical
- **Width**: fill_container

##### Project Name
- **Font**: Inter, 14px, weight 600
- **Color**: `#18181B`

##### Project Path
- **Font**: Inter, 12px, weight normal
- **Color**: `#71717A`

#### Badge (`os0qa`)
- **Corner Radius**: 3px
- **Padding**: `[3, 8]`
- **Background**: `#F4F4F5`

##### Badge Text
- **Font**: Inter, 10px, weight 500
- **Color**: `#18181B`

---

## Main Page Item Cards (For Reference)

### MCP Servers Main - Server Item (`VT3Kp`)

- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Border**: `#E5E5E5`, 1px, inside
- **Width**: fill_container
- **Layout**: Horizontal, justify-content: space-between, align-items: center

#### Left Section
- **Gap**: 14px
- Icon Container: 40px x 40px, corner radius 8px, background `#FAFAFA`
- Info section: vertical layout, gap 4px

#### Right Section
- **Gap**: 16px
- Stats section: gap 20px
- Status badge: corner radius 4px, padding `[4, 10]`
- Toggle: 40px x 22px, corner radius 11px

---

### Scenes Main - Scene Card (`6K9II`)

- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Border**: `#E5E5E5`, 1px, inside
- **Width**: fill_container
- **Layout**: Horizontal, justify-content: space-between, align-items: center

#### Left Section
- **Gap**: 14px
- Icon Container: 40px x 40px, corner radius 8px, background `#FAFAFA`
- Info section: vertical layout, gap 4px

#### Right Section
- **Gap**: 24px
- Meta section: gap 20px, label-value pairs
- Status badge: corner radius 4px
- Action button: 28px x 28px, corner radius 4px

---

### Projects Main - Project Card (`LHy3P`)

- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Border**: `#E5E5E5`, 1px, inside
- **Width**: fill_container
- **Layout**: Horizontal, justify-content: space-between, align-items: center

#### Left Section
- **Gap**: 14px
- Icon Container: 40px x 40px, corner radius 8px, background `#FAFAFA`
- Info section: vertical layout, gap 4px

#### Right Section
- **Gap**: 24px
- Meta section: gap 20px (Scene, Skills, MCPs info)
- Status badge
- Action button

---

### Skills Main - Skill Item (`hBtGo`)

- **Corner Radius**: 8px
- **Padding**: `[16, 20]`
- **Background**: `#FFFFFF`
- **Border**: `#E5E5E5`, 1px, inside
- **Width**: fill_container
- **Gap**: 14px
- **Layout**: Horizontal, align-items: center

#### Components
- Icon Container: 40px x 40px, corner radius 8px, background `#FAFAFA`
- Info section: vertical layout, gap 3px, width fill_container
- Tags section: gap 6px
- Toggle: 40px x 22px

---

## Color System

### Background Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| White | `#FFFFFF` | Page background, detail panel, selected icon bg |
| Gray 50 | `#FAFAFA` | Selected item background, icon container default |
| Gray 100 | `#F4F4F5` | Icon container (some states), badge background |
| Gray 200 | `#E4E4E7` | Divider |
| Gray 300 | `#E5E5E5` | Borders |

### Text Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Gray 900 | `#18181B` | Primary text, titles, names |
| Gray 600 | `#52525B` | Icons (normal state), secondary values |
| Gray 500 | `#71717A` | Descriptions, meta text, footer icons |
| Gray 400 | `#A1A1AA` | Placeholders, labels, stat icons |
| Gray 300 | `#D4D4D8` | Collapse icon |

### Status Colors

| Name | Hex Code | Usage |
|------|----------|-------|
| Green 100 | `#DCFCE7` | Active badge background |
| Green 600 | `#16A34A` | Active badge text |
| Red 100 | `#FEE2E2` | Delete button border |

### macOS Traffic Light Colors

| Name | Hex Code |
|------|----------|
| Close (Red) | `#FF5F57` |
| Minimize (Yellow) | `#FEBC2E` |
| Maximize (Green) | `#28C840` |

---

## Typography

### Font Family
- **Primary**: Inter

### Font Sizes & Weights

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 16px | 600 | `#18181B` |
| Section Title | 14px | 600 | `#18181B` |
| Item Name | 14px | 500/600 | `#18181B` |
| Item Description | 12px | normal | `#71717A` |
| Meta Label | 11px | 500 | `#A1A1AA` |
| Meta Value | 11px | 600 | `#52525B` |
| Badge Text | 10px | 500/600 | Varies |
| Section Label (Uppercase) | 10px | 600 | `#A1A1AA` |
| Search Placeholder | 12px | normal | `#A1A1AA` |

### Letter Spacing
- **Uppercase Labels**: 0.8px (e.g., "ASSIGNED SCENE", "CONFIGURATION STATUS")

---

## Spacing System

### Padding Values

| Element | Padding |
|---------|---------|
| Sidebar Content | `[16, 16, 8, 16]` |
| Sidebar Header | `[0, 12, 0, 20]` |
| List Header | `[0, 20]` |
| List Content | 12px |
| Detail Header | `[0, 28]` |
| Detail Content | 28px |
| Item Card | `[16, 20]` |
| Button (with icon) | `[0, 12]` |
| Badge (small) | `[3, 8]` |
| Badge (status) | `[4, 10]` |
| Count Badge | `[2, 8]` |
| Search Box | `[0, 10]` |
| Toggle | 2px |

### Gap Values

| Element | Gap |
|---------|-----|
| Sidebar Sections | 24px |
| Detail Content Sections | 28px |
| List Items | 12px |
| Item Card Elements | 14px |
| Info Section (name/desc) | 4px |
| Skill Info Section | 3px |
| Traffic Lights | 8px |
| Nav Items | 2px |
| Tags | 6px |
| Meta Items | 20px |
| Right Section (Scene Card) | 24px |
| Stats Section | 20px |
| Search Box Icon/Text | 6px/8px |
| Action Buttons | 8px |

### Corner Radius Values

| Element | Radius |
|---------|--------|
| Item Card | 8px |
| Icon Container | 8px |
| Button | 6px |
| Badge (small) | 3px |
| Badge (status) | 4px |
| Count Badge | 10px |
| Toggle | 10px/11px |
| Toggle Knob | 8px/9px |
| Search Box | 6px |
| Nav Item | 6px |

### Fixed Dimensions

| Element | Dimensions |
|---------|------------|
| Sidebar Width | 260px |
| List Panel Width | 380px (400px for Projects) |
| Detail Panel Width | 800px |
| Header Height | 56px |
| Icon Container | 40px x 40px |
| Header Icon Container | 36px x 36px |
| Icon Inner | 20px x 20px |
| Toggle (List) | 36px x 20px |
| Toggle (Main) | 40px x 22px |
| Toggle Knob (List) | 16px x 16px |
| Toggle Knob (Main) | 18px x 18px |
| Search Box Height | 32px |
| Search Box Width | 140px/160px |
| Action Button | 32px x 32px |
| Small Action Button | 28px x 28px |
| Collapse Button | 24px x 24px |
| Traffic Light | 12px x 12px |

---

## Summary of Key Differences Between Pages

| Aspect | MCP Detail | Scene Detail | Projects Detail | Skill Detail |
|--------|------------|--------------|-----------------|--------------|
| List Panel Width | 380px | 380px | 400px | 380px |
| List Title Font Size | 16px | 14px | 16px | 16px |
| Has Add Button | No | Yes | No | No |
| Search Box Width | 140px | N/A | 160px | Similar to MCP |
| Item Has Toggle | Yes | No | No | Yes |
| Item Has Badge | No | No | Yes (Scene) | No |
| Header Actions | Close only | Edit, Delete, Close | Open Folder, Close | Close only |
| Delete Button | No | Yes (red border) | No | No |

---

## Implementation Notes

1. **Consistency**: The item cards in Detail pages are simplified versions of the main page cards, removing stats and action buttons to focus on selection.

2. **Selected State**: The selected state is indicated by:
   - Background color change to `#FAFAFA`
   - Icon color change from `#52525B` to `#18181B`
   - Font weight increase for name (500 to 600 in some cases)
   - Icon container background may change

3. **Layout Pattern**: All pages follow the same three-column layout with consistent header heights (56px) and padding patterns.

4. **Border Style**: All borders use inside alignment with 1px thickness and `#E5E5E5` color.

5. **Responsive Behavior**: The `fill_container` property is used extensively for flexible widths within fixed column structures.
