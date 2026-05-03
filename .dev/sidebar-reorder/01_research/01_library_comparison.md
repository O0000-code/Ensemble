# Sidebar Reorder — DnD Library Comparison

> Comprehensive evaluation of 8 candidate libraries for implementing manual reorder of the Ensemble app's Categories (1D vertical) and Tags (2D flex-wrap) sidebar sections. All data verified against npm registry, GitHub API, bundlephobia, and official documentation as of **2026-05-03**.

## 0. Sources & Methodology

- **Versions / publish dates / peers / unpacked size** — fetched directly from `https://registry.npmjs.org/<pkg>` (ground-truth)
- **Weekly downloads** — fetched from `https://api.npmjs.org/downloads/point/last-week/<pkg>` (week of 2026-04-26 → 2026-05-02)
- **Bundle min+gzip** — fetched from `https://bundlephobia.com/api/size?package=<pkg>` (Rollup-flavoured ESM)
- **Stars / open issues / last push / archived flag** — `https://api.github.com/repos/<owner>/<name>`
- **Capability claims** — official docs (dndkit.com, motion.dev, atlassian.design, react-aria.adobe.com, swapy.tahazsh.com) cross-checked with GitHub issues and at least one third-party comparison article

Where a data point could not be confirmed, this is explicitly stated.

---

## 1. Per-library evaluation

### 1.1 `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` (legacy v6/v9/v10)

| Field | Value |
|---|---|
| Latest stable versions | core **6.3.1** (2024-12-05), sortable **10.0.0** (2024-12-04), utilities **3.2.2** (older) |
| New experimental rewrite | `@dnd-kit/react` **0.4.0** (April 2025) — still 0.x, marked "Stable release" on npm but maintainer guidance is unclear; legacy v6 is what production projects use today |
| Weekly downloads | core **14.21M**, sortable **14.12M**, utilities **14.16M** |
| GitHub | clauderic/dnd-kit, 17,053★, 86 open issues, last commit 2026-04-30 |
| Bundle (min+gzip) | core **14.2 KB**, sortable **3.7 KB**, utilities **1.6 KB**, modifiers **~1 KB** → **~20 KB total** for the legacy stack |
| License | MIT |
| Peer | `react: >=16.8.0`, `react-dom: >=16.8.0` (works with React 18.3.1) |
| StrictMode / React 18 | Works. Issue [#775](https://github.com/clauderic/dnd-kit/issues/775) reports a *fast-multi-container* edge bug in StrictMode dev, but vertical/flex-wrap reorder is unaffected. The library's own examples run under React 18 + StrictMode. |
| 1D vertical list support | First-class — `verticalListSortingStrategy` |
| 2D flex-wrap support | **Yes, via `rectSortingStrategy`** (the default). Confirmed by official docs: *"This is the default value, and is suitable for most use cases."* The `rectSwappingStrategy` is also available for true swap behavior. Issue [#115 ("Sortable items jump in flexbox container")](https://github.com/clauderic/dnd-kit/issues/115) and [#1378 ("Sortable with flex wrap")](https://github.com/clauderic/dnd-kit/issues/1378) flag historical glitches when items change rows during drag — fixed in current v6.3 by using `closestCenter` collision detection rather than `rectIntersection`. |
| Spring / settle physics | Built-in **drop-animation** is a CSS transition (`250ms` default ease, customizable). For true spring physics on layout shifts, the `useSortable` hook exposes `transform/transition` strings — you supply the easing. Maintainer-blessed pattern: integrate `framer-motion` for layout animation while dnd-kit handles input ([Issue #605](https://github.com/clauderic/dnd-kit/issues/605)). |
| Drag preview lift | First-class via `<DragOverlay>` — render any element, automatic teleport, drop-back animation customizable per render. |
| Activation gesture | **Highly configurable** via `activationConstraint` on `PointerSensor`/`MouseSensor`/`TouchSensor`. Two modes (mutually exclusive): `{distance: N}` (require N px movement) or `{delay: N, tolerance: M}` (long-press). Distance is the *recommended* default for click coexistence — confirmed by Stack Overflow [#77415442](https://stackoverflow.com/questions/77415442). Drag handle support via `listeners` spread on a sub-element. |
| Keyboard a11y | First-class — `KeyboardSensor` with `sortableKeyboardCoordinates`, screen-reader announcements via `accessibility.announcements` prop, focus management built-in. |
| Conflict isolation | Each draggable owns its `listeners`; you spread them onto whichever child you want as the handle, leaving the rest of the row free for clicks/right-click/dbl-click. Setting `disabled: true` on a `useSortable` instance temporarily turns off DnD (perfect for inline-edit rows). |
| Touch / pointer | All three (Mouse / Touch / Pointer) sensors first-class. |
| Known performance traps | StrictMode dev flicker in multi-container scenarios (#775). With many hundreds of items, `rectSortingStrategy` is O(n) on `onMove` — the maintainers offer `verticalListSortingStrategy` and `horizontalListSortingStrategy` as O(1) alternatives. **For our 9 categories + 10 tags, this is irrelevant.** |
| Maintenance signal | GitHub issues [#1194](https://github.com/clauderic/dnd-kit/issues/1194) (May 2024) and [#1830](https://github.com/clauderic/dnd-kit/issues/1830) (recent) flag concerns that v6 commit cadence has slowed. **However**: (a) the maintainer is actively working on a full rewrite (`@dnd-kit/react` v0.4 / changelog dated April 2025); (b) v6.3.1 received its last patch Dec 2024; (c) it's still cited as the *de facto* default by Puck (April 2026), Apache Superset SIP-184, and Robin Wieruch's React libraries 2025 list. |
| Learning curve | Moderate. Concepts (DndContext / SortableContext / strategy / collision / sensors / modifiers / DragOverlay) require ~1 day to internalize. |
| Documentation | Excellent — `dndkit.com` covers Legacy and Latest separately, with full API tables and runnable examples. |

**Score**: 5/5 on every axis except spring physics (3/5 — needs custom integration) and "active development cadence concern" (3/5 — still maintained but slower than 2022).

---

### 1.2 `motion` / `framer-motion` (`Reorder` component + `motion` core)

> Note: `framer-motion` and `motion` are now **the same package** at the same version (12.38.0, both published 2026-03-17). `motion` is the new official name; `framer-motion` is the legacy alias kept for compatibility.

| Field | Value |
|---|---|
| Latest version | **12.38.0** (2026-03-17) — both packages |
| Weekly downloads | framer-motion **35.9M**, motion **11.2M** (combined ~47M, makes it the most-downloaded animation lib by far) |
| GitHub | motiondivision/motion, 31,765★, 182 open issues, last commit 2026-04-27 |
| Bundle (min+gzip) | full `motion` **42.6 KB**, full `framer-motion` **59.1 KB**. With `LazyMotion` + `m` lazy components and `domAnimation` features, the initial-render footprint drops to **~4.6 KB** plus deferred chunks. |
| License | MIT |
| Peer | `react: ^18.0.0 \|\| ^19.0.0`, `react-dom: ^18.0.0 \|\| ^19.0.0` |
| StrictMode / React 18 | Native support — Motion is the canonical animation library for React 18+. |
| 1D vertical list support | First-class via `<Reorder.Group axis="y">` + `<Reorder.Item value=...>`. Maybe 30 lines of code for a basic list. |
| 2D flex-wrap support | **NOT supported by `Reorder`.** Quoting the official docs literally: *"`Reorder` is for simple drag-to-reorder implementations. It's exceptionally lightweight on top of the base `motion` component but **lacks some features like multirow, dragging between columns, or dragging within scrollable containers**. For advanced use-cases we recommend something like DnD Kit."* Even an old "2D drag" CodeSandbox demo (`framer-motion-2-drag-to-reorder-2d-eko08`) is unmaintained and predates Reorder. |
| Spring / settle physics | **Best-in-class.** Native `type: "spring"` transitions with `stiffness/damping/mass/bounce` knobs, plus `layout` prop performs FLIP animations on any layout change automatically. This is exactly the "physical level" feel the brief calls for. |
| Drag preview lift | Implicit — the dragged item itself moves; combine with `whileDrag` and `useRaisedShadow` (motion's own example) for the lift+shadow effect. |
| Activation gesture | `dragListener={false}` + `useDragControls().start(event)` lets you trigger drag from a specific handle. No declarative `activationConstraint`-style distance/delay (you'd implement it yourself). |
| Keyboard a11y | **Limited.** No built-in keyboard reorder for `Reorder` — official docs link to dnd-kit for accessible scenarios. There's an open community pattern using `aria-grabbed`, but it's manual. |
| Conflict isolation | `whileTap`/`onTapStart` events are well-isolated from drag events when `drag` is opt-in via `useDragControls`. |
| Touch / pointer | Pointer events only (good — handles both mouse and touch). |
| Known issues | Open Issue [#3469](https://github.com/motiondivision/motion/issues/3469) ("Reorder does not work as expected in a scrollable page"). Issue [#1651](https://github.com/motiondivision/motion/discussions/1651) shows reorder + `AnimatePresence` requires careful `LayoutGroup` wrapping to avoid distortions. |
| Learning curve | Easy for the `Reorder` happy-path; hard the moment you need anything outside it. |
| Documentation | Excellent — `motion.dev/docs/react-reorder` is concise and accurate. |

**Score**: 5/5 spring physics, 5/5 maintenance, 1/5 for 2D flex-wrap (the docs explicitly disqualify it for our Tags use case).

---

### 1.3 `@atlaskit/pragmatic-drag-and-drop` (Atlassian)

| Field | Value |
|---|---|
| Latest version | **1.8.1** (2026-04-22) — *recently updated*, very active |
| Weekly downloads | **822,984** (large and growing — Atlassian's Trello/Jira/Confluence run on this) |
| GitHub | atlassian/pragmatic-drag-and-drop, 12,598★, 99 open issues, last commit 2026-05-01 |
| Bundle (min+gzip) | **Core ~4.7 KB** per LogRocket comparison (the bundlephobia 166 B reading is the entry-shim only — the actual feature code lives in subpath imports like `/element/adapter`, `/combine`, `/reorder`). With typical add-ons (drop-indicator + hitbox + auto-scroll + flourish) and React glue, plan for **8–15 KB total**. |
| License | **Apache-2.0** (NOT MIT). Compatible with closed-source distribution but slightly more legalese than MIT — a non-issue for our app. |
| Peer | None declared (it's framework-agnostic vanilla JS); React deps come via the optional `@atlaskit/pragmatic-drag-and-drop-react-*` companion packages, which currently pin to React 18 only — Issue [#181](https://github.com/atlassian/pragmatic-drag-and-drop/issues/181) tracks React 19. **React 18.3.1 fully supported.** |
| StrictMode / React 18 | Designed for React 18 from day one. |
| 1D vertical list support | Yes — via the `closestEdge` hitbox helper + `reorder` utility |
| 2D flex-wrap support | **Yes**, but you assemble it yourself. There's no out-of-the-box `<Sortable />` component; you wire `draggable()` + `dropTargetForElements()` + collision math via `@atlaskit/pragmatic-drag-and-drop-hitbox`. For a 2D pill cloud, this means writing your own "find nearest pill" logic. |
| Spring / settle physics | None built-in. The optional `@atlaskit/pragmatic-drag-and-drop-flourish` and `@atlaskit/pragmatic-drag-and-drop-react-drop-indicator` give you a polished drop-indicator line and a "pulse" flourish, but no spring layout shift. You'd integrate Motion or write your own FLIP. |
| Drag preview lift | Uses the **native HTML5 drag preview** (the browser-supplied ghost). You can customize via `setCustomNativeDragPreview` — this gives you full control but it's one of the trickier APIs. |
| Activation gesture | Native HTML5 — fires on `dragstart` (after the OS-defined drag-threshold, typically ~3-5 px). No `delay` / `long-press` config out of the box. |
| Keyboard a11y | **Manual.** The "design and accessibility guidance" docs describe a recommended UX pattern but you have to implement it yourself with `tabIndex` + `aria-keyshortcuts`. |
| Conflict isolation | Excellent — everything is opt-in `useEffect` registration on a specific DOM element. Clicks are completely independent. |
| Touch / pointer | Native HTML5 drag means **mobile/touch support is famously poor on iOS** (the API itself is broken on touch devices in many browsers). Pragmatic ships an optional touch adapter, but that's an extra package and the maintainer has admitted in HN AMA that mobile examples have known issues. **For our macOS-only target this is fine.** |
| Known issues | Documentation is thinner than dnd-kit's (Hacker News thread, multiple complaints); examples are tied to Atlaskit + Compiled CSS. |
| Learning curve | Steeper than dnd-kit — you'll write more code for equivalent results. The trade is: fewer abstractions, lower bundle, higher ceiling. |
| Documentation | Decent and improving (atlassian.design + tutorial), but more "building blocks" than "recipes". |

**Score**: 5/5 maintenance & performance, 4/5 for both layouts (you have to assemble), 2/5 spring physics (would still need Motion), 2/5 a11y (DIY).

---

### 1.4 `react-aria` (`useDrag` / `useDrop` / `useDragAndDrop`) — Adobe

| Field | Value |
|---|---|
| Latest version | **3.48.0** (2026-04-14) |
| Weekly downloads | **4.32M** (the umbrella `react-aria` package), `@react-aria/dnd` itself **2.52M**, `react-aria-components` **2.48M** |
| GitHub | adobe/react-spectrum, 15,045★, **582 open issues** (large monorepo for the entire Spectrum design system, not just DnD), last commit 2026-05-02 |
| Bundle (min+gzip) | `@react-aria/dnd` **33.4 KB** alone. The full `react-aria` umbrella is **massive** (14 MB unpacked) — only viable if tree-shaken aggressively, and even then ~40-50 KB just for the DnD pieces is realistic. |
| License | Apache-2.0 |
| Peer | React 16.8 → 19, very permissive |
| StrictMode / React 18 | Works flawlessly — Adobe's own products run on it. |
| 1D vertical list support | Via `<ListBox>` / `<GridList>` + `useDragAndDrop` hook. **Coupled to RAC collection components** — you can't easily add it to your own arbitrary divs without rebuilding them as collection items. |
| 2D flex-wrap support | Possible only by building a `<GridList>` with custom layout; the official "drag and drop" guide doesn't show pill-cloud reorder as a use case. |
| Spring / settle physics | None — RAC focuses on accessibility, not motion. You'd layer Motion on top. |
| Drag preview lift | Custom `DragPreview` component — full control. |
| Activation gesture | Built-in "drag button" affordance (`hasDragButton: true`) — designed for explicit handles, not whole-row drag. Good for accessibility, but a different visual model from what you described. |
| Keyboard a11y | **The single best in the industry.** Years of research, documented in [Adobe's "Taming the dragon" blog](https://react-aria.adobe.com/blog/drag-and-drop). Screen-reader-aware, full keyboard parity. |
| Conflict isolation | Very explicit data flow makes conflicts easy to reason about, but coupling to RAC's `<Item>` collection model is heavy for our case. |
| Touch / pointer | Excellent. |
| Known issues | The DnD API is *new and still expanding* — open Issue [#7646](https://github.com/adobe/react-spectrum/issues/7646) on `useDragAndDrop` API quirks. The collection-based design is a misfit for "I have a flex-wrap of arbitrary divs". |
| Learning curve | Steep. Requires buying into the React Aria mental model (state hooks + behavior hooks + DOM hooks separation). |
| Documentation | Excellent for what it covers; thin for "I just want a flex-wrap of pills". |

**Score**: 5/5 a11y (best in class), 2/5 fit for our specific use case (collection-component coupling, no spring), 4/5 maintenance.

---

### 1.5 `react-beautiful-dnd` and its fork `@hello-pangea/dnd`

| Field | Value |
|---|---|
| `react-beautiful-dnd` latest | 13.1.x — **archived by Atlassian** (the GitHub repo's `archived: true` flag is now true). Last activity Aug 2025 (just for closing issues). |
| `react-beautiful-dnd` weekly downloads | 2.28M (legacy projects only — not for greenfield work) |
| `@hello-pangea/dnd` latest | **18.0.1** (2025-02-09) — actively maintained drop-in fork |
| `@hello-pangea/dnd` weekly downloads | **2.07M** — large and growing |
| GitHub | hello-pangea/dnd, 3,903★, 138 open issues, last commit 2026-05-03 |
| Bundle (min+gzip) | **28.8 KB** — heaviest in this comparison |
| License | Apache-2.0 |
| Peer | React 18 / 19 |
| StrictMode / React 18 | hello-pangea/dnd: **fully supports React 18 + StrictMode** (was the main reason for the fork). Original RBD broken in StrictMode (Issue #2350). |
| 1D vertical list support | Excellent — this is the library's *raison d'être*. Famously "physical-feeling" animations. |
| 2D flex-wrap support | **Not supported.** RBD/hello-pangea is fundamentally a *list*-based library — vertical or horizontal columns of fixed-width rows. The maintainer's own statement on GH: *"react-beautiful-dnd is for list-based drag and drop"*. Pills wrapping across rows is out-of-scope. |
| Spring / settle physics | Built-in CSS easing curves (`react-beautiful-dnd` is famous for its hand-tuned drop animation), feels great for Trello-style cards. |
| Drag preview lift | Built-in lift animation, very polished. |
| Activation gesture | Built-in 5px movement threshold, no config knob. Whole row is the handle by default unless you opt into `dragHandleProps`. |
| Keyboard a11y | First-class — was the model for many other libs. |
| Conflict isolation | The library *takes over* the entire list's DOM with refs — relatively easy to break inline editing patterns. |
| Touch / pointer | Yes, including a long-press touch threshold. |
| Known issues | The opinionated/heavy API and the lack of 2D flex-wrap support are the disqualifiers. |
| Learning curve | Easy for the happy path, painful when you go off-script. |
| Documentation | Original RBD docs are still the gold standard for narrative DnD docs; hello-pangea inherits them. |

**Score**: 5/5 vertical list polish, 0/5 2D flex-wrap support (architecturally not supported).

---

### 1.6 `react-sortablejs` + `Sortable.js`

| Field | Value |
|---|---|
| `Sortable.js` latest | **1.15.7** (2026-02-11) — published 3 months ago after a long quiet stretch |
| `Sortable.js` weekly downloads | 3.14M |
| `Sortable.js` GitHub | SortableJS/Sortable, 31,082★, **520 open issues**, last commit 2026-03-24, **explicit "maintenance mode"** per maintainer comment Feb 2026: *"yes, I would also describe it as being in a maintenance mode... it lacks any sort of regression testing... too risky to modify any core functionality or even add new features, except to fix bugs."* |
| `react-sortablejs` latest | **6.1.4** (2022-05-31) — **almost 4 years old** |
| `react-sortablejs` GitHub | SortableJS/react-sortablejs, 2,174★, 109 open issues, **last commit Dec 2023**, README literally states: *"Please note that this is not considered ready for production, as there are still a number of bugs being sent through."* |
| Bundle (min+gzip) | sortablejs **18.3 KB**, react-sortablejs wrapper **2.8 KB** → ~21 KB total |
| License | MIT |
| Peer | `react: >=16.9.0`, `react-dom: >=16.9.0` |
| StrictMode / React 18 | Issue [#263](https://github.com/SortableJS/react-sortablejs/issues/263) reports broken state on drop in nested setups under React 18 — **unresolved**. |
| 1D vertical list support | Excellent (Sortable.js's bread and butter). |
| 2D flex-wrap support | Yes — Sortable.js's `Grid` example demonstrates flex-wrap reorder. |
| Spring / settle physics | Linear CSS transition only (`animation: 150` → 150 ms ease). No spring. |
| Drag preview lift | Native HTML5 drag ghost (poor on macOS aesthetic) |
| Activation gesture | `delay`, `delayOnTouchOnly`, `touchStartThreshold` — all configurable. |
| Keyboard a11y | None built-in. |
| Touch / pointer | Yes. |
| Known issues | The React wrapper is essentially abandoned and incompatible with modern React idioms. The underlying Sortable.js is in maintenance mode by the maintainer's own admission. |

**Score**: 1/5 maintenance, 2/5 React-18 fit. Disqualified.

---

### 1.7 `swapy`

| Field | Value |
|---|---|
| Latest version | **1.0.5** (2025-01-19) |
| Weekly downloads | 15,952 (small but growing — niche/new) |
| GitHub | TahaSh/swapy, 8,479★, 50 open issues, **last commit 2025-01-19** (no activity in ~16 months) |
| Bundle (min+gzip) | bundlephobia API didn't return a value; unpacked size 99 KB suggests ~12-15 KB gzipped. **Not confirmed.** |
| License | **GPL-3.0** — **DEAL-BREAKER for closed-source distribution.** GPL-3.0 requires that any application that links against this library must also be GPL-3.0 (i.e., open source the entire app). This may or may not be acceptable for the Ensemble app — needs explicit user decision before adoption. |
| Peer | None declared |
| StrictMode / React 18 | Works (with `manualSwap: true` and `swapy.update()` choreography in `useEffect`); see Issue [#45](https://github.com/TahaSh/swapy/issues/45) for an example of the dynamic-add-remove tripwire that's required. |
| 1D vertical list support | Yes |
| 2D flex-wrap support | Yes — slot/item model is layout-agnostic |
| Spring / settle physics | Built-in `animation: "spring"` config — actually exists |
| Drag preview lift | Built-in opacity dim; no lift/shadow without custom CSS |
| Activation gesture | No configurable threshold; whole item or `data-swapy-handle` element is grabbable |
| Keyboard a11y | None |
| Conflict isolation | Decent — uses data attributes |
| Touch / pointer | Yes |
| Known issues | The slot/item dual-data-attribute model is conceptually clever but adds extra DOM nodes per row. Dynamic add/remove is finicky (#45). Maintainer has been quiet since Jan 2025. |
| Learning curve | Easy |
| Documentation | Decent — `swapy.tahazsh.com` |

**Score**: 4/5 spring physics, 3/5 maintenance, **0/5 license fit (GPL-3.0)**. Disqualified on license.

---

### 1.8 Self-built (HTML5 DragEvent or PointerEvent + RAF)

| Field | Value |
|---|---|
| Bundle | Zero, you write what you need |
| Spring | You'd build it (or pull in `motion` for layout animation only — back to ~17 KB) |
| 1D / 2D | You'd build it |
| Activation gesture | You'd build it |
| Keyboard a11y | You'd build it correctly only if you've written DnD a11y before — most teams get this wrong |
| Time cost | Best-case **3-5 days** to reach the same polish as dnd-kit's `<DragOverlay>` + `closestCenter` + auto-scroll + edge cases (drop outside list, scroll-while-drag, `<Refresh>` cancellation, ColorPicker conflict, …). Realistically, **2 weeks** to match the polish of `cubic-bezier(0.34, 1.56, 0.64, 1)` springiness and macOS feel. |
| Risk | You become the maintainer of every edge case (Tauri WebView quirks, Safari-engine pointer-events bugs, etc.) |

**Score**: 1/5 unless your goal is learning. The brief says *"优先使用现成的组件"* — explicitly disqualified.

---

## 2. Comparison matrix

Score scale: **5 = excellent / first-class**, **4 = good with minor caveats**, **3 = workable**, **2 = significant gaps**, **1 = poor**, **0 = disqualifying**, **N/A = not applicable**.

| Library | Maint. | React 18 / Strict | 1D vertical | 2D flex-wrap | Spring physics | Activation gesture config | Keyboard a11y | Conflict isolation | macOS aesthetic fit | Bundle (kB gzip) | License | Doc quality | **Total / 60** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **@dnd-kit (legacy v6)** | 4 | 5 | 5 | **5** | 3 (CSS, can integrate Motion → 5) | **5** | **5** | **5** | 5 | **~20** | MIT (5) | 5 | **52** |
| motion `Reorder` | 5 | 5 | 5 | **0** (docs disqualify) | **5** | 3 | 2 | 4 | 5 | 4.6 lazy / 42 full | MIT (5) | 5 | **44** |
| pragmatic-drag-and-drop | **5** | 5 | 4 | 4 (DIY) | 2 (DIY) | 2 (no delay) | 2 (DIY) | **5** | 4 | ~10 (modular) | Apache-2.0 (4) | 4 | **41** |
| react-aria `useDrag/Drop` | 5 | 5 | 4 (RAC coupling) | 3 (GridList only) | 1 (DIY) | 4 (drag-button) | **5** | 4 | 3 | ~33 + comp | Apache-2.0 (4) | 4 | **42** |
| @hello-pangea/dnd | 4 | 5 | 5 | **0** (out of scope) | 4 | 3 | 5 | 3 | 4 | 28.8 | Apache-2.0 (4) | 5 | **40** |
| react-beautiful-dnd | **0 (archived)** | 1 | 5 | 0 | 4 | 3 | 5 | 3 | 4 | 28.8 | Apache-2.0 (4) | 5 | **DQ** |
| react-sortablejs + Sortable.js | **1** (maint mode) | 2 | 5 | 4 | 1 | 4 | 1 | 3 | 2 (HTML5 ghost) | 21 | MIT (5) | 3 | **DQ** |
| swapy | 2 | 4 | 4 | 4 | 4 | 2 | 1 | 3 | 4 | ~12-15 | **GPL-3.0 (0)** | 4 | **DQ** |
| Self-built | 1 (you) | N/A | 3 (you) | 3 (you) | 3 (you) | 5 | 1 (typically) | 5 | 5 | 0–17 | — | — | **DQ** (brief says use existing) |

Disqualifiers in this matrix:
- **react-beautiful-dnd** — archived
- **react-sortablejs** — wrapper unmaintained since 2022, underlying Sortable.js in maintenance mode
- **swapy** — GPL-3.0 license is incompatible with proprietary closed-source distribution
- **self-built** — explicitly excluded by the brief

---

## 3. Recommendation

### Use **`@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` + `@dnd-kit/modifiers`** for both Categories AND Tags.

**Rationale**:

1. **It is the only library that is first-class for *both* a 1D vertical list AND a 2D flex-wrap layout.** `verticalListSortingStrategy` for Categories, `rectSortingStrategy` (default) for Tags. One mental model, one dependency, two strategies. Motion's `Reorder` and hello-pangea explicitly do not support 2D wrap; pragmatic and react-aria *can* but require us to write the collision math ourselves.
2. **Activation-gesture config (`{distance: 5}`) cleanly resolves all five existing-gesture conflicts** identified in the understanding doc (single-click navigate, double-click edit, right-click menu, ColorPicker dot tap, sidebar window-drag). A 5-pixel movement threshold means a static click never starts a drag — the *most reliable* primitive for click-vs-drag disambiguation across the board.
3. **`disabled: true` per-item** lets us silently turn off DnD on the row currently in `<CategoryInlineInput>` / `<TagInlineInput>` edit-or-add mode without any state-shape change or DOM remount.
4. **`<DragOverlay>`** gives us the lift+shadow visual pattern with a `dropAnimation` callback we can customize to use `cubic-bezier(0.34, 1.56, 0.64, 1)` — matching the existing design language in `src/index.css` exactly.
5. **Keyboard a11y is built-in.** No extra work.
6. **Bundle cost is ~20 KB min+gzip.** Smallest among the qualified options that handle both layouts well.
7. **MIT license, no obligations.**
8. **Maintenance signal is OK.** v6.3.1 is recent (Dec 2024), and the maintainer is actively working on a v7 rewrite (`@dnd-kit/react@0.4.x`, latest April 2025). v6 has 14M+ weekly downloads with minimal new bug reports — a sign of a stable, mature product, not a dead one.
9. **Spring physics for the *settle* animation** can be layered on top via `framer-motion`'s `layout` prop on the sortable items if we want true spring (the maintainer's own example). For 9-item sidebar lists, a tuned cubic-bezier transition is plenty and matches the project's existing animation language. We can ship with cubic-bezier first, add Motion later if desired.

### What NOT to recommend, and why:

- **Motion `Reorder` for Categories** (was tempting): It would give the *most* satisfying spring feel, but adopting two different DnD libraries (Motion for Categories, dnd-kit for Tags) doubles surface area, doubles bundle, and doubles the number of edge cases to debug. **One library, two strategies > two libraries, one strategy each.**
- **pragmatic-drag-and-drop**: We don't need its scale-up performance (we have 9-19 items total), and we'd pay for that with DIY collision logic, DIY a11y, and a less-polished animation API. It would be the right call if we were building Trello.

---

## 4. Minimal code skeleton (correct imports, real API)

> Pseudo-typed; assumes `categories: Category[]` and `tags: Tag[]` from `useAppStore()` and `reorderCategories(ids: string[])` / `reorderTags(ids: string[])` mutators added to the store + matching `reorder_categories(ids: Vec<String>)` Tauri command. Wire into Sidebar.tsx in place of the existing `.map()` blocks.

### 4.1 Install

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities @dnd-kit/modifiers
```

### 4.2 Categories — vertical 1D

```tsx
// src/components/sidebar/CategoryReorderList.tsx
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // align w/ index.css

function CategoryRow({ id, name, color, count, isEditing }: Category & { isEditing: boolean }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id,
    disabled: isEditing,           // edit mode disables DnD on this row only
    transition: { duration: 200, easing: SPRING },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,    // hidden while DragOverlay shows clone
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex h-8 items-center px-2.5"
    >
      <ColorDot color={color} />
      <span className="flex-1 truncate">{name}</span>
      <span className="text-xs opacity-60">{count}</span>
    </div>
  );
}

export function CategoryReorderList() {
  const categories = useAppStore(s => s.categories);
  const editingId = useAppStore(s => s.editingCategoryId);
  const reorderCategories = useAppStore(s => s.reorderCategories);
  const [activeId, setActiveId] = useState<string | null>(null);

  // 5px movement threshold — clicks remain clicks
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    const oldIndex = categories.findIndex(c => c.id === active.id);
    const newIndex = categories.findIndex(c => c.id === over.id);
    const next = arrayMove(categories, oldIndex, newIndex);
    reorderCategories(next.map(c => c.id));   // optimistic + persist
  }

  const active = activeId ? categories.find(c => c.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as string)}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
        {categories.map(c => (
          <CategoryRow key={c.id} {...c} isEditing={editingId === c.id} />
        ))}
      </SortableContext>

      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: SPRING,
        }}
      >
        {active && (
          <div className="flex h-8 items-center px-2.5 rounded-md bg-white shadow-xl ring-1 ring-black/10">
            <ColorDot color={active.color} />
            <span className="flex-1 truncate">{active.name}</span>
            <span className="text-xs opacity-60">{active.count}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
```

### 4.3 Tags — 2D flex-wrap

```tsx
// src/components/sidebar/TagReorderList.tsx
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,           // <— THE KEY DIFFERENCE for 2D wrap
  sortableKeyboardCoordinates,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { useAppStore } from '@/stores/appStore';

function TagPill({ id, name, count, isEditing }: Tag & { isEditing: boolean }) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id, disabled: isEditing });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
      }}
      {...attributes}
      {...listeners}
      className="px-2.5 py-[5px] rounded text-[11px] bg-bg-tertiary"
    >
      {name}
      <span className="ml-1 opacity-50">{count}</span>
    </div>
  );
}

export function TagReorderList() {
  const tags = useAppStore(s => s.tags);
  const editingId = useAppStore(s => s.editingTagId);
  const reorderTags = useAppStore(s => s.reorderTags);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToParentElement]}    // no axis lock - free 2D
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={({ active, over }: DragEndEvent) => {
        setActiveId(null);
        if (!over || active.id === over.id) return;
        const oldIndex = tags.findIndex(t => t.id === active.id);
        const newIndex = tags.findIndex(t => t.id === over.id);
        reorderTags(arrayMove(tags, oldIndex, newIndex).map(t => t.id));
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex flex-wrap gap-1.5">
        <SortableContext items={tags.map(t => t.id)} strategy={rectSortingStrategy}>
          {tags.map(t => (
            <TagPill key={t.id} {...t} isEditing={editingId === t.id} />
          ))}
        </SortableContext>
      </div>

      <DragOverlay
        dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {activeId && (() => {
          const t = tags.find(x => x.id === activeId)!;
          return (
            <div className="px-2.5 py-[5px] rounded text-[11px] bg-white shadow-lg ring-1 ring-black/10">
              {t.name} <span className="ml-1 opacity-50">{t.count}</span>
            </div>
          );
        })()}
      </DragOverlay>
    </DndContext>
  );
}
```

---

## 5. Risks & mitigation

### 5.1 StrictMode dev double-mount

- **Risk**: dnd-kit Issue [#775](https://github.com/clauderic/dnd-kit/issues/775) reports flicker when dragging fast across multi-container layouts in StrictMode dev. Reproducible only in dev; production builds unaffected.
- **Mitigation**: Our DnD setup uses **single-container** (Categories OR Tags, not cross-list). Issue does not apply. Production builds unaffected anyway. Verify in Tauri dev mode during smoke test.

### 5.2 Window drag conflict (`startDrag` on sidebar mousedown)

- **Risk**: Sidebar.tsx:10-35 attaches `onMouseDown` that calls Tauri `appWindow.startDragging()` when target is the sidebar background. dnd-kit's `PointerSensor` fires on `pointerdown`. Both can compete.
- **Mitigation**: dnd-kit listeners are spread on the *category row* / *tag pill* DOM nodes. The `startDrag` handler in Sidebar.tsx already inspects `e.target.tagName` to skip when click lands on `BUTTON`/`INPUT`/etc. Add `Sidebar.tsx`'s handler to also skip when `e.target.closest('[data-dnd-row]')` is truthy (we add `data-dnd-row` to our rows). Belt-and-suspenders: dnd-kit's `{distance: 5}` activation ensures even if both fire, no drag starts unless the user actually moves 5px — which is also enough for Tauri's window-drag to start. Both will engage, the user perceives only the row-drag (z-index higher).

### 5.3 ColorPicker dot click conflict

- **Risk**: Within a category row, the leading 8px color dot opens ColorPicker on click. If the dot is inside the dnd `listeners` spread, the click is consumed by the drag activation logic.
- **Mitigation**: Two options. **(a)** Add `e.stopPropagation()` in the dot's `onClick`. dnd-kit only starts drag after 5px movement so a static click bubbles up just fine; this is the simplest and what the docs recommend. **(b)** Use a dedicated drag handle (skip the dot from `listeners`); requires restructuring `setNodeRef` vs `listeners` placement. Prefer (a).

### 5.4 "Show X more" collapse interaction

- **Risk**: When `categories.length > 9`, only the first 9 render. If user starts dragging item 1, item 10 is not in the DOM — dropping past index 9 is undefined.
- **Mitigation (decision needed in Plan)**: cleanest behavior is **auto-expand on drag start**. On `onDragStart`, set `isExpanded = true`; on `onDragEnd` *or* `onDragCancel`, leave it expanded (since the user just demonstrated interest). Alternative: render all items but visually hide rows past index 9 with `display: none` only when not dragging. The first option is simpler and matches Linear's behavior; recommend it.

### 5.5 Refresh button preservation

- **Risk**: Refresh re-pulls data from disk. If `reorderCategories(ids)` writes to `data.json` synchronously, Refresh sees the new order. If the IPC is async-fire-and-forget, a fast Refresh after drop could clobber.
- **Mitigation**: Make `reorderCategories` await the IPC `reorder_categories` before returning. In Rust, write `data.json` synchronously before the Tauri command returns. (Same pattern as the existing CRUD commands.)

### 5.6 Drop animation on drop-into-collapsed scenario

- **Risk**: If user drops at the very bottom past the last visible item, the DragOverlay's drop animation flies to a position that doesn't exist (because we collapsed). Looks broken.
- **Mitigation**: Per #5.4, keep expanded after drop. Drop animation lands on a real DOM node.

### 5.7 ResizeObserver / layout shift glitches

- **Risk**: Tauri's webview occasionally shows extra layout repaints when sidebar height changes during drag.
- **Mitigation**: dnd-kit's `MeasuringStrategy.Always` is the default and is robust. If we see flicker, switch to `MeasuringStrategy.BeforeDragging` for the SortableContext (configurable via `measuring={{ droppable: { strategy: MeasuringStrategy.BeforeDragging } }}`).

### 5.8 Long-term maintenance signal

- **Risk**: dnd-kit v6 commit cadence has slowed. Maintainer is focused on v7 rewrite (`@dnd-kit/react` 0.x).
- **Mitigation**: v6.3.1 is **production-stable** (used by Sentry, Doist, HTTPie, Mintlify, Puck per dndkit.com sponsors page). The migration path to v7 will be incremental and the API surface for *sortable* is small enough that a future migration is bounded. We use the smallest-possible API surface here: 3 strategies, 1 collision algorithm, 2 sensors, 1 modifier, 1 hook (`useSortable`), 1 component (`<DragOverlay>`). Migration cost is hours, not days, when v7 lands.

### 5.9 Spring "physical" feel

- **Risk**: User asked for *"物理级别动效（Spring 曲线/磁吸/自然/流畅）"*. dnd-kit's built-in transition is a CSS cubic-bezier — *spring-like* but not a true physics spring.
- **Mitigation**: The sidebar uses `cubic-bezier(0.34, 1.56, 0.64, 1)` already (`src/index.css`); reuse that in the `transition.easing` of `useSortable` AND in the `dropAnimation.easing` of `<DragOverlay>` for visual coherence with the existing app. **If this doesn't feel "physical enough"** during the post-implementation review, layer Motion's `<motion.div layout transition={{ type: 'spring', stiffness: 500, damping: 35 }}>` *inside* the SortableItem — dnd-kit handles input, Motion handles layout. This pattern is documented and works (dnd-kit Issue #605, with maintainer's blessing). Cost: +6 KB gzipped (with `LazyMotion`).

---

## 6. Open questions to resolve in the planning phase

1. **Spring physics depth** — ship with cubic-bezier transition first (matches existing app), or integrate Motion's `layout` immediately for true physical spring? (Recommend: phase 1 = cubic-bezier; expert review after Phase 1; phase 1.5 = layer Motion if reviewers say "not physical enough".)
2. **"Show X more" interaction** — auto-expand on drag-start? (Recommend: yes, persist expanded after drop until next refresh.)
3. **Drag handle vs whole-row** — whole-row drag with `{distance: 5}`, or explicit drag handle on the right side? (Recommend: whole-row, matches macOS Finder/Notes; explicit handle adds visual noise that conflicts with the project's "克制" design language.)
4. **Reorder IPC shape** — `reorder_categories(ids: Vec<String>)` (idempotent, atomic) vs `move_category(id, from, to)` (smaller payload, harder to make atomic). (Recommend: `reorder_categories(ids)` — simpler, atomic, no ABA races.)

These belong in the Plan document, not in the library-comparison doc. Listed here for traceability.
