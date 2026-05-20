# Mobile responsiveness — deep UI analysis

**Purpose:** Prepare the Amplify Case Management sandbox for phone and small-tablet use by documenting current layout constraints, what already adapts, and a phased remediation plan.

**Scope:** React + Tailwind app under `src/app/components/`. Viewport meta is present (`width=device-width` in `index.html`). There is **no dedicated mobile layout layer** today.

**Date:** May 2026

---

## 1. Executive summary

| Finding | Detail |
|--------|--------|
| **Design intent** | Desktop / analyst workstation (1280px+). Multi-column shell: header + 96px rail + optional list panel + main + optional AI panel. |
| **Responsive usage** | Very low. Tailwind `sm:` / `md:` / `lg:` appear in ~15 files; most are modals or isolated widgets—not the app shell. |
| **Primary risk** | **Horizontal real estate**: fixed nav (96px), resizable side panels (240–420px+), data tables with sticky columns (min width ~900–1200px per table). |
| **Secondary risk** | **Stacked chrome on Case detail**: context bar (4 columns) + subway + tab bar + table OR third column AI panel. |
| **Good foundations** | `min-w-0` / `overflow-x-hidden` in shell; `ModuleTabsBar` horizontal scroll; workflow subway uses `touch-pan-x` and `max-sm:truncate`; several modals use `min(…, calc(100vw - …))`. |

**Recommendation:** Adopt a **mobile shell** (bottom nav or hamburger + full-width main) below `lg` (1024px), and **drawer-based** secondary panels (case list, task/doc detail, AI) below `md` (768px). Keep table **card/list fallbacks** or **single-column priority** views—not raw table shrink.

---

## 2. App shell architecture (fixed geometry)

```
┌─────────────────────────────────────────────────────────────┐
│ Header 48px — logo, search (lg+ only today), AI, user       │
├────┬──────────────┬──────────────────────────┬───────────────┤
│ 96 │ Cases list   │ Case / module main       │ AI panel      │
│ px │ 240–420px    │ flex-1                   │ 400–70% vw    │
│nav │ (optional)   │                          │ (optional)    │
└────┴──────────────┴──────────────────────────┴───────────────┘
```

### 2.1 Constants (hard-coded pixels)

| Constant | Value | File |
|----------|------:|------|
| Header height | 48px | `WorkspaceSidePanelChrome.tsx`, `Layout.tsx` |
| Vertical nav width | 96px | `Layout.tsx`, `useResizableSidePanel` |
| Cases list default | 300px (min 240, max 420) | `CasesWorkspace.tsx`, `useResizableSidePanel` |
| Global AI panel min | 400px (max 70% viewport) | `Layout.tsx` |
| Case AI panel default | 45% viewport (min 420px) | `sidepanel-width.ts` |
| Task/doc side panels | min 420–480px | `CaseView.tsx`, `getDefaultSidePanelWidth` |

On a **390px-wide phone**, the shell alone exceeds viewport before any table content.

### 2.2 Resize model

- **Mouse-only:** `useResizableSidePanel` and case AI resize use `mousemove` / `mouseup`—no touch/pointer unified handler.
- **Position math:** Panel width from `e.clientX - MAIN_NAV_WIDTH_PX` assumes nav is always visible and 96px—breaks if nav is hidden on mobile.

---

## 3. Responsive patterns already in the codebase

### 3.1 Strong (reuse as templates)

| Pattern | Where | Mobile value |
|---------|--------|----------------|
| Tab bar horizontal scroll + chevrons | `ModuleTabsBar.tsx` | Already usable on narrow screens |
| Subway / stepper `touch-pan-x`, `no-scrollbar` | `WorkflowMetaSubway`, CaseView stepper | Touch scroll without visible scrollbar |
| Step labels `max-sm:truncate` | `WorkflowMetaSubway` | Prevents step names from wrapping layout |
| Modal width caps | `CreateCaseModal`, `SmartRequestModal`, `DecisionModal` | `w-[min(1080px,calc(100vw-2rem))]` etc. |
| Toast / FAB max width | `CaseView`, `TaskModule` | `max-w-[min(440px,calc(100vw-3rem))]` |
| GI cards `lg:grid-cols-2` | `GeneralInformationRichView` in `CaseView.tsx` | Single column below 1024px |
| Folders toolbar | `FoldersModule.tsx` | `flex-col` → `md:flex-row` |

### 3.2 Weak or desktop-only

| Pattern | Issue |
|---------|--------|
| Header global search | `Layout.tsx` — `hidden … lg:block`, **no mobile search alternative** in header |
| Platform Settings | Some `sm:` stacks; main editor `lg:grid-cols-[1fr_420px]` — unusable on phone without full-screen steps |
| Dashboard | `max-w-[1100px] px-8 pt-[120px]` — large top padding; no nav offset adjustment |
| Entity modals | e.g. `ClientAdvancedSearchModal` fixed `920px` width |

---

## 4. Surface-by-surface analysis

### 4.1 Layout + VerticalNav — **Critical**

**Files:** `Layout.tsx`, `VerticalNav.tsx`

| Issue | Severity | Notes |
|-------|----------|-------|
| 96px rail always visible (except eApp) | Critical | Consumes ~25% of 390px width |
| 10+ nav items stacked vertically | High | Long scroll on short screens; labels 11px under icons |
| Global search centered, desktop-only | High | Mobile users lose quick case jump |
| Global AI panel 400px min | Critical | Cannot open on narrow viewports without covering entire UI |

**Mobile direction:**

- `< lg`: hide rail; **bottom tab bar** (5–6 primary modules) or hamburger → sheet.
- Header: compact logo, menu, search icon → full-screen search sheet.
- Global AI: **full-screen sheet** or route to `/copilot` only (already linked).

---

### 4.2 Cases workspace — **Critical**

**Files:** `CasesWorkspace.tsx`, `CasesModule.tsx`

| Issue | Severity | Notes |
|-------|----------|-------|
| Two-column: list + detail always | Critical | List panel 240px+ competes with `CaseView` |
| `text-3xl` “Cases” in list header | Low | Fine if list becomes drawer |
| Open cases list | Medium | Touch targets OK; horizontal overflow on long IDs |

**Mobile direction:**

- Route `/cases` → **list only** (full width).
- Route `/cases/:id` → **detail only**; back button to list; open cases as **chips** or drawer.
- Retain `useResizableSidePanel` only `>= lg`; below that use `sidePanelOpen` as overlay drawer.

---

### 4.3 Case detail (`CaseView`) — **Critical** (largest file ~4400 lines)

**File:** `CaseView.tsx`

#### Header band (lines ~2400–2530)

| Element | Desktop layout | Mobile risk |
|---------|----------------|-------------|
| Case ID `text-2xl` | Left block | OK with wrap |
| DECISION / CREATE TASK pills | Horizontal row | **Overflow** — need wrap or overflow menu |
| Assistant CTA card | `ml-6` large button | Should move below title or FAB |

#### Context metrics (4 slots)

```tsx
<div className="flex items-stretch">
  {workflowContextSlots.map(...)} // flex-1 × 4 in a row
</motion.div>
```

| Issue | Severity |
|-------|----------|
| Four equal columns, no breakpoint | **Critical** on <640px |
| Dividers vertical | Squashed text, clipped policy links |

**Mobile direction:** `grid grid-cols-2` or **accordion** below `md`; single column below `sm`.

#### Workflow subway / pre-approval stepper

| Status | Notes |
|--------|-------|
| Partially ready | Horizontal scroll, `touch-pan-x`, truncated labels on `max-sm` |
| Watch | AI mode badges on steps may still widen row |

#### Tabs (`ModuleTabsBar`)

| Status | Notes |
|--------|-------|
| Good | Scroll + edge fade buttons; works on mobile if given full width |

#### Overview (`GeneralInformationRichView`)

| Status | Notes |
|--------|-------|
| Good | `lg:grid-cols-2` → 1 col on phone |
| Check | Status tile grids inside cards may use internal flex—verify per card type |

#### Entity tabs: Tasks / Requirements / Documents

| Pattern | Min width pressure |
|---------|-------------------|
| Sticky left column (task name / doc name) | 220–320px |
| Sticky right actions column | 64–96px |
| Middle columns (summary, stage, AI) | 260–400px |
| **Estimated min table width** | **~900–1200px** |

Uses `moduleTableScrollContainerClass` + `useTableHorizontalScroll`—**horizontal scroll is intentional**, not a bug, but poor UX on phone.

**Mobile direction:**

- Respect existing `tabViews` `'table' | 'list'` — ensure **list view is default** below `md` for tasks/requirements/documents.
- Or: dedicated **mobile card list** component per row (title, status, due date, tap → drawer).
- Sticky columns: disable on mobile; single scroll container.

#### Case AI panel (right column)

| Issue | Severity |
|-------|----------|
| Sibling column `width: panelWidth` (45% vw, min 420) | Critical |
| Resize handle mouse-only | High |
| Selection mini-toolbar absolute positioned | Medium — may clip off-screen |

**Mobile direction:** Full-screen overlay with close; no side-by-side; copilot dock pinned bottom (already similar to chat apps).

#### Nested side panels (task / req / doc)

Multiple widths (420–480px) over main content—**stack as full-screen drawers** on mobile with shared `WorkspaceObjectSidePanel` pattern.

---

### 4.4 Module pages (Tasks, Documents, Requests, AI Actions)

**Files:** `TaskModule.tsx`, `DocumentModule.tsx`, `RequestsModule.tsx`, `AiActionsModule.tsx`

| Module | Table stickies | Other |
|--------|----------------|-------|
| Tasks | Left + right 48px | Kanban columns `min-w-[260px]` — horizontal board scroll |
| Documents | Similar to CaseView | `DOCUMENT_TABLE_MIN_WIDTH` comment |
| Requests | Summary col `min-w-[400px]` | Very wide |
| AI Actions | 220px left sticky | By-case table variant |

**Mobile direction:**

- Kanban: allow vertical stack of columns (`flex-col`) on mobile or single-column “My tasks” list.
- Requests: drop summary column to second line in card layout.
- Shared **ModuleTableScaffold** mobile prop: `variant="cards" | "table"`.

---

### 4.5 Dashboard — **Medium**

**File:** `Dashboard.tsx`

- Fixed `max-w-[1100px]`, `px-8`, `pt-[120px]` — top padding assumes desktop header/search.
- Widget grids likely multi-column—grep shows chart rows; verify each section for `grid-cols-*` without breakpoints.

**Mobile direction:** `pt-20`, `px-4`, single-column widgets, collapse “quick actions”.

---

### 4.6 Copilot — **Medium**

**Files:** `AiCopilotFooter.tsx`, `CopilotFullPage.tsx`, `Layout` global panel

- Full-page copilot is the natural mobile home for assistant.
- Dock footer input: verify safe-area (`pb-safe`) for iOS—not present today.
- Message bubbles `max-w-[85%]` — OK.

---

### 4.7 Settings & modals — **Medium**

**File:** `PlatformSettingsModal.tsx`

- Large dialogs `sm:max-w-[1180px]` — full viewport on mobile is OK if content scrolls.
- Internal two-column `lg:grid-cols-[1fr_420px]` for case type editor — needs **step wizard** on mobile.

**Smaller modals:** Generally fine with `max-w-[94vw]` patterns.

---

### 4.8 Folders / Entity workspace — **Medium–High**

**Files:** `FoldersWorkspace.tsx`, `EntitySubFolderListView.tsx`, `FolderView.tsx`

- Second sidebar pattern (like Cases)—same drawer treatment.
- Entity tables use `moduleTableScrollContainerClass` extensively.

---

### 4.9 eApp — **Low** (separate app mode)

Nav hidden in Layout when `activeApp.id === 'eapp'`—shows precedent for **hiding rail** per route/app.

---

## 5. Z-index and overlay stacking (mobile)

High z-index layers (case tooltips `z-[300]`, header `z-[1000]`, AI toast `z-[200]`, modals `z-[1110]+`) must be ordered when adding mobile drawers (`z-[1050]` drawer, `z-[1100]` modal).

Selection toolbar in CaseView while AI open—test **touch selection** on iOS (no `mouseup` text selection menu).

---

## 6. Touch and pointer gaps

| Gap | Impact |
|-----|--------|
| Resize strips (`SidePanelResizeStrip`) | Unusable on touch; hide below `lg` |
| Hover-only tooltips (decision locked, benefit popup) | Use `click` / `Popover` on mobile |
| `group-hover` disclosure | Provide tap alternative |
| Double scroll (body + inner table) | Common on iOS—use `overscroll-behavior: contain` on drawers |

---

## 7. Recommended breakpoint system

Align with Tailwind defaults (already in project):

| Token | Width | App mode |
|-------|------:|----------|
| default | <640px | **Phone** |
| `sm` | 640px | Large phone / portrait tablet |
| `md` | 768px | Tablet — optional 2-col GI |
| `lg` | 1024px | **Desktop shell** — show rail + side-by-side cases |
| `xl` | 1280px | Comfortable multi-panel |

Introduce a single hook used across shell:

```ts
// Proposed: src/app/hooks/useViewportLayout.ts
export type ViewportLayout = 'mobile' | 'tablet' | 'desktop';
// mobile: width < 768
// tablet: 768–1023
// desktop: >= 1024
```

Use **one source of truth** instead of ad-hoc `lg:` per component.

---

## 8. Proposed mobile information architecture

### Phone (<768px)

1. **Bottom navigation** (4–5 items): Home, Cases, Tasks, Documents, More (Requests, Copilot, Settings).
2. **Cases:** list ↔ detail via routes; no persistent open-case column.
3. **Case detail:** vertical stack — title → actions menu (⋯) → context metrics (2×2 grid) → subway (scroll) → tabs → tab content.
4. **Tables:** card list default; optional “Table view” for landscape tablet only.
5. **AI:** full-screen modal from FAB or tab; not column resize.

### Tablet (768–1023px)

- Optional collapsible case list (icon strip or 72px rail).
- AI panel as 50% overlay drawer.
- Tables still scroll horizontally OR 2-column cards.

### Desktop (≥1024px)

- Current behavior preserved.

---

## 9. Implementation phases (suggested)

### Phase 0 — Foundation (1–2 days)

- [ ] Add `useViewportLayout` + `ViewportLayoutProvider`.
- [ ] Document tokens: `--app-header-h`, `--nav-w`, `--case-list-w` in CSS variables for tests.
- [ ] Audit: `touch-action`, `viewport-fit=cover` for iOS safe areas.

### Phase 1 — Shell (3–5 days)

- [ ] Mobile header: menu + search entry.
- [ ] Hide `VerticalNav` `< lg`; add `MobileNav` bottom bar or drawer.
- [ ] `CasesWorkspace`: drawer list on detail route; back navigation.
- [ ] Global AI: full-screen `<Sheet>` `< lg`.

### Phase 2 — Case detail (5–8 days)

- [ ] Context bar responsive grid.
- [ ] Header actions → `DropdownMenu` overflow.
- [ ] Case AI panel → full-screen sheet.
- [ ] Task/req/doc panels → sheets; pointer-friendly close.
- [ ] Default `tabViews` to `list` on mobile for tasks/reqs/docs.

### Phase 3 — Modules (5–7 days)

- [ ] Tasks kanban mobile layout.
- [ ] Requests/Documents/Cases list card mode.
- [ ] Dashboard single column.

### Phase 4 — Polish (3–5 days)

- [ ] Settings wizard on mobile.
- [ ] Platform guide / demo overlays scale.
- [ ] E2E viewport tests (390×844, 768×1024, 1440×900).

---

## 10. Testing matrix

| Device / viewport | Priority flows |
|-------------------|----------------|
| 390×844 (iPhone 14) | Login gate → Cases list → open case → requirements tab → open req drawer → back |
| 390×844 landscape | Tables / subway scroll |
| 768×1024 (iPad) | Cases list + detail coexist? |
| 1280×800 | Regression: resize panels, sticky tables |
| 1440×900 | Primary demo path unchanged |

**Tools:** Chrome DevTools device mode, BrowserStack, real iOS Safari (sticky + 100vh bugs).

---

## 11. Files to touch first (priority order)

1. `Layout.tsx` — shell, nav visibility, AI panel mode  
2. `CasesWorkspace.tsx` — list/detail split  
3. `CaseView.tsx` — context bar, actions, AI column, table defaults  
4. `useResizableSidePanel.ts` / `WorkspaceSidePanelChrome.tsx` — touch + mobile drawer  
5. `sidepanel-width.ts` — lower min widths or mobile bypass  
6. `ModuleTabsBar.tsx` — already OK; minor touch target size (44px min)  
7. `TaskModule.tsx`, `DocumentModule.tsx`, `RequestsModule.tsx` — card fallbacks  
8. `PlatformSettingsModal.tsx` — single-column flows  
9. `design-tokens.ts` — optional `BREAKPOINTS` export for JS hooks  

---

## 12. What not to do

- Shrink tables by reducing font to 10px—unreadable for demo/legal UI.
- Scale entire app with `transform: scale(0.8)`—breaks touch targets.
- Hide critical actions on mobile without an overflow menu.
- Assume `100vh` without `dvh`—mobile browser chrome jumps (use `min-h-dvh` where supported).

---

## 13. Related docs

| Doc | Relevance |
|-----|-----------|
| `docs/CLIENT_DATASET_PLAYBOOK.md` | Demo data unchanged by viewport |
| `src/app/constants/design-tokens.ts` | `MODULE_TEXT`, `UI_CLASS` for consistent mobile typography |
| `src/app/utils/module-table-scroll.ts` | Table scroll wrapper behavior |

---

*Version 1.0 — May 2026. Update after Phase 0 spike or first mobile shell PR.*
