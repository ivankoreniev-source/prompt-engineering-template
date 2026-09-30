---
description: Frontend Architecture Rules for React 19 + TypeScript (QuizCraft)
globs: ["frontend/**"]
---

# Frontend Architecture Rules

These rules apply exclusively to all frontend files and tasks within `frontend/**`.

## Architecture & Directory Hierarchy

QuizCraft frontend is built with React 19, TypeScript, Vite, Tailwind CSS v4, and Redux Toolkit:
```
src/
├── features/         # Feature-specific pages & view modules
│   ├── auth/         # Login, Register, Profile pages
│   ├── dashboard/    # Hero banner, stats, quick-actions
│   ├── tests/        # Catalog, My Tests, Test Editor (Builder)
│   ├── taking/       # Step-by-step test taking interface
│   └── results/      # Result breakdown, review, My Results history
├── store/            # Redux Toolkit centralized state
│   ├── api/          # RTK Query API slices (baseApi, authApi, testsApi, resultsApi)
│   ├── slices/       # Client/UI state slices (authSlice, uiSlice, navigationSlice)
│   └── store.ts      # Configured Redux store
├── components/       # Reusable components
│   ├── ui/           # Radix / shadcn/ui UI primitives (button, card, dialog, badge)
│   ├── layout/       # Navbar, header, footers
│   └── common/       # ConfirmDialog, NotificationToast
├── types/            # TypeScript domain types matching backend schemas
└── lib/              # Utilities (config.ts, utils.ts)
```

## Architectural Guidelines & Separation of Concerns

1. **Feature-First Layout**:
   - Each page or view belongs under its respective `src/features/<feature>/` folder.
   - Do not dump monolithic logic into `App.tsx`.
2. **RTK Query for Server State**:
   - ALL network requests to backend endpoints MUST use RTK Query hooks generated from `src/store/api/`.
   - Never use raw `fetch()` or `axios` directly inside React components.
   - Manage caching and automatic invalidation using RTK Query tags (`User`, `Tests`, `MyTests`, `TestDetail`, `Results`, `ResultDetail`).
3. **Redux Slices for Client & UI State**:
   - `authSlice.ts`: Tracks authenticated user and token.
   - `navigationSlice.ts`: Client router/navigation state (`view`, `param`).
   - `uiSlice.ts`: Toast notifications and modal overlays.
4. **Centralized Configuration**:
   - ALWAYS resolve API endpoints through `src/lib/config.ts` (`API_BASE_URL`).
   - NEVER hardcode `http://localhost:8001` or direct URLs inside components.
