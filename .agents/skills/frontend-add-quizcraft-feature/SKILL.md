---
name: frontend-add-quizcraft-feature
description: >-
  Use this skill exclusively when implementing or modifying frontend UI features,
  components, pages, or RTK Query endpoints in `frontend/`. Do not use for backend tasks.
---

# Adding a Frontend Feature to QuizCraft

This skill guides you through the workflow for adding or extending frontend features according to the QuizCraft frontend architecture and BRD.

## Feature Implementation Workflow

Follow this sequence when developing new client-side features:

### Step 1: Types & Interfaces (`frontend/src/types/`)
- Define TypeScript interfaces matching backend models (`*Payload`, `*Detail`, `*Summary`, etc.).
- Ensure types are exported and shared across slices and components.

### Step 2: RTK Query Endpoint (`frontend/src/store/api/`)
- Add queries and mutations using `baseApi.injectEndpoints()`.
- Add proper tags to `tagTypes` in `baseApi.ts` (`User`, `Tests`, `MyTests`, `TestDetail`, `TestTake`, `Results`, `ResultDetail`).
- Provide and invalidate appropriate tags to keep UI in sync without manual refetching.
- Export generated React hooks (`use...Query`, `use...Mutation`).

### Step 3: Redux UI Slices (`frontend/src/store/slices/`)
- If client-only state is needed (modal toggles, active routing parameters, temporary form cache), update or add a slice in `store/slices/`.
- If new views are added, add the view name to `navigationSlice.ts`.

### Step 4: Component / View Implementation (`frontend/src/features/<feature>/`)
- Implement feature page component using Tailwind CSS v4 and `shadcn/ui` components from `components/ui/`.
- Use RTK Query hooks for fetching and mutating data.
- Handle `isLoading`, `error`, and empty states explicitly.
- Display errors via toast notifications: `dispatch(addToast({ type: 'error', text: msg }))`.

### Step 5: Wire Routing in `src/App.tsx`
- Mount the new feature view inside `App.tsx` based on the active view from `useSelector((state: RootState) => state.navigation.currentView)`.
- Ensure navigation links in `Navbar.tsx` or buttons navigate to the view via `dispatch(navigate({ view: '...' }))`.

### Step 6: Verify Build & Lint
- Run `npm run build` and `npm run lint` in `frontend/`.
- Fix any TypeScript or oxlint issues immediately.
