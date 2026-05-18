# Dev Stack

A high-fidelity, fully client-side React prototype for the **Amplify Case Management** workspace (multi-case life & disability underwriting + claims). No backend — all data is fixture-driven for demo and design review.

## Build & runtime

| | |
|---|---|
| Bundler / dev server | **Vite 6** with `@vitejs/plugin-react` |
| Language | **TypeScript** + **React 18.3** (function components, hooks) |
| Module system | ESM (`"type": "module"`) |
| Path alias | `@/*` → `src/*` |
| Scripts | `npm run dev` &nbsp;·&nbsp; `npm run build` |

## UI

- **Component primitives** — [Radix UI](https://www.radix-ui.com/) (accordion, dialog, dropdown, popover, tabs, switch, etc.) wrapped in shadcn-style local components under `src/app/components/ui/`.
- **Icons** — [`lucide-react`](https://lucide.dev/) for all stroke icons; `@mui/icons-material` reserved for legacy/eApp surfaces.
- **Animation / motion** — [`motion`](https://motion.dev/) (Framer Motion successor) + `tw-animate-css` for utility transitions.
- **Charts** — [`recharts`](https://recharts.org/) (used sparingly; most "charts" are hand-rolled flex bars for pixel control).
- **Misc** — `cmdk` (command palette), `vaul` (drawers), `embla-carousel`, `react-day-picker`, `sonner` (toasts), `input-otp`, `react-resizable-panels`, `react-dnd`.

## Styling

- **Tailwind CSS 4** via the official `@tailwindcss/vite` plugin.
- Global stylesheets live in `src/styles/`:
  - `tailwind.css` — Tailwind layer entry point
  - `theme.css` — design tokens (colors, surfaces, text, borders) exposed as CSS custom properties (`--brand-primary`, `--text-heading`, etc.) so branding is themable at runtime
  - `fonts.css` — typography
- Class merging via `clsx` + `tailwind-merge` (re-exported as `cn` in `src/app/components/ui/utils.ts`).
- Variant patterns via `class-variance-authority`.

## Internal design system

`src/app/components/ds/` — small, opinionated primitives shared across modules: `SurfaceCard`, `StatCard`, `ListRow`, `FilterChip`, `SegmentedControl`, `RagDot`, `PriorityBadge`, `EmptyState`, `SectionLabel`. These wrap Tailwind tokens so spacing, padding and surfaces stay consistent.

## Routing

- **`react-router` 7** declared in `src/app/routes.tsx`, mounted from `src/app/App.tsx`.
- Stable English URL slugs (e.g. `/folders/policy-1/agents`) regardless of UI language.

## State & data

- **No global store.** State is co-located with screens; cross-cutting concerns use **React Context**:
  - `PlatformSettingsContext` — branding, modules feature flags, case-type config, theme, language. Persisted to `localStorage` with a versioned schema + migration ladder.
  - `FoldersNavContext` — sidebar UI state (open/expanded folders).
  - `CasesNavContext`, `CopilotContext`, `LiveContextProvider` — module-scoped UI state.
- **Mock data** lives in `src/app/data/mock-*.ts`. Dashboard, cases, folders, tasks, documents, eApp templates and entity folders all read from these fixtures.
- **Forms** — `react-hook-form` (used in eApp builder).

## Internationalization

- [`i18next`](https://www.i18next.com/) + `react-i18next`, initialized in `src/app/i18n/index.ts`.
- Five namespaces (`common`, `nav`, `settings`, `folders`, `fixtures`) authored in `en` / `fr-CA` / `es-419` under `src/app/i18n/resources/`.
- `i18n.d.ts` augments `react-i18next` so `t('settings.tabs.language.label')` is autocomplete- and compile-checked.
- Locale-aware formatting helpers in `i18n/format.ts` (`useFormatDate`, `useFormatNumber`, `useFormatCurrency`) backed by `date-fns` + `Intl`.
- Language picker is **gated behind `LANGUAGE_FEATURE_ENABLED`** in `i18n/types.ts` — the app stays in English until the FR/ES translations have had a UX writing review. Flip the flag to ship.

## Project layout

```
src/
├── app/
│   ├── App.tsx                  # root provider tree
│   ├── routes.tsx               # react-router config
│   ├── components/
│   │   ├── ui/                  # shadcn-style Radix wrappers
│   │   ├── ds/                  # internal design system primitives
│   │   ├── entity/              # entity folder views (Folders module)
│   │   ├── eapp/                # eApp form builder + dashboard
│   │   └── *.tsx                # module screens (Dashboard, Cases, Folders, Tasks, …)
│   ├── contexts/                # PlatformSettings, FoldersNav, Cases, Copilot, Live
│   ├── data/                    # mock-*.ts fixtures + selector hooks (useFolders.ts)
│   ├── domain/                  # framework-agnostic domain helpers (case types, entity folders)
│   ├── hooks/                   # cross-cutting hooks
│   ├── i18n/                    # i18next setup, types, format helpers, JSON resources
│   └── utils/, types/, constants/
├── styles/                      # tailwind, theme tokens, fonts
└── main.tsx                     # entry — initializes i18n, renders <App />
```

## Conventions

- **Tokens over literals.** Use CSS custom properties (`text-text-primary`, `bg-surface-card`, `border-border-soft`) — never raw hex outside `theme.css` and one-off accent colors.
- **Translatable copy.** New user-facing strings go through `t()` and a JSON resource file even when the language picker is disabled — keeps future locale work cheap.
- **Persistence.** Anything written to `localStorage` goes through a versioned schema in `PlatformSettingsContext.loadSettings()` so future data-shape changes can migrate forward without nuking user state.
- **No backend assumptions.** Every fixture lives in `src/app/data/`; selector hooks (`useTranslatedFolders`, `useTranslatedEntityFolder`, …) merge structural data with locale content at render time.
