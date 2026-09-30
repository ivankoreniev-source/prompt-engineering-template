---
description: Frontend TypeScript, React, and Styling Coding Standards
globs: ["frontend/**"]
---

# Frontend Coding Standards

These rules apply exclusively to all frontend files and tasks within `frontend/**`.

## TypeScript & Code Hygiene

1. **Strict Typing**:
   - `strict: true` is enabled in `tsconfig.json`.
   - Avoid `any`. Define proper TypeScript interfaces or types for all payloads, responses, and component props in `src/types/`.
   - Type RTK Query mutations and queries with explicit response and request generics.
2. **Component Conventions**:
   - Use functional components typed with `React.FC` or explicit prop types.
   - Use Lucide React icons for standard actions (`lucide-react`).
   - Clean separation of UI primitives: keep helper classes or variant functions structured so fast-refresh and oxlint pass without warnings.
3. **Quality Tooling & Hygiene**:
   - **Linter (`oxlint`)**: `npm run lint` must pass with zero errors and zero warnings.
   - **Formatter (`prettier`)**: `npm run format:check` must pass (configured via `.prettierrc`). Run `npm run format` to auto-format.
   - **Type Checker (`tsc -b`)**: `npm run typecheck` must pass with zero compiler errors.
   - Do NOT call `setState()` synchronously inside `useEffect()` to mirror props/queries. Initialize state directly or derive values during render.
   - Ensure `npm run build` (`tsc -b && vite build`) passes cleanly for production deployment.

## UI, Styling & Accessibility

1. **Tailwind CSS v4 & shadcn/ui**:
   - Use standard utility classes from Tailwind CSS v4.
   - Use semantic color tokens (`bg-primary`, `text-foreground`, `border-border`, `bg-muted`, `text-destructive`).
   - Difficulty level badge colors: Easy = green/emerald, Medium = yellow/amber, Hard = red/destructive.
2. **User Feedback & Errors**:
   - Display asynchronous errors via toast notifications (`dispatch(addToast({ type: 'error', text: msg }))`).
   - Show loading spinners or skeleton placeholders during network requests.
   - Provide confirmation dialogs before destructive actions (deleting test, submitting test).
