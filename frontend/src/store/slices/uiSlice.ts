import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}

interface UiState {
  toasts: ToastMessage[]
}

const initialState: UiState = {
  toasts: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast(
      state,
      action: PayloadAction<{ type: 'success' | 'error' | 'info'; text: string }>,
    ) {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6)
      state.toasts.push({ id, ...action.payload })
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
  },
})

export const { addToast, removeToast } = uiSlice.actions

export default uiSlice.reducer

