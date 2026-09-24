import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export type AppView =
  | 'dashboard'
  | 'tests'
  | 'create-test'
  | 'edit-test'
  | 'take-test'
  | 'result'
  | 'my-tests'
  | 'my-results'
  | 'profile'
  | 'login'
  | 'register'

export interface NavigationState {
  currentView: AppView
  param: string | null
}

export function parseHash(hash: string): { view: AppView; param: string | null } {
  const clean = hash.replace(/^#\/?/, '').trim()
  if (!clean) {
    return { view: 'dashboard', param: null }
  }

  const [viewPart, ...paramParts] = clean.split('/')
  const param = paramParts.join('/') || null

  const validViews: AppView[] = [
    'dashboard',
    'tests',
    'create-test',
    'edit-test',
    'take-test',
    'result',
    'my-tests',
    'my-results',
    'profile',
    'login',
    'register',
  ]

  if (validViews.includes(viewPart as AppView)) {
    return { view: viewPart as AppView, param }
  }

  return { view: 'dashboard', param: null }
}

const initial = parseHash(window.location.hash)

const initialState: NavigationState = {
  currentView: initial.view,
  param: initial.param,
}

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    navigate(
      state,
      action: PayloadAction<{ view: AppView; param?: string | null; updateHash?: boolean }>,
    ) {
      state.currentView = action.payload.view
      state.param = action.payload.param || null

      if (action.payload.updateHash !== false) {
        const hash = action.payload.param
          ? `#${action.payload.view}/${action.payload.param}`
          : `#${action.payload.view}`
        if (window.location.hash !== hash) {
          window.location.hash = hash
        }
      }
    },
    syncFromHash(state, action: PayloadAction<string>) {
      const parsed = parseHash(action.payload)
      state.currentView = parsed.view
      state.param = parsed.param
    },
  },
})

export const { navigate, syncFromHash } = navigationSlice.actions

export default navigationSlice.reducer

