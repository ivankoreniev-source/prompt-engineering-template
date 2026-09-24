import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { User } from '@/types/auth'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  isInitialized: boolean
}

const savedToken = localStorage.getItem('quizcraft_token')

const initialState: AuthState = {
  token: savedToken,
  user: null,
  isAuthenticated: !!savedToken,
  isInitialized: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{ access_token: string; user: User }>,
    ) {
      state.token = action.payload.access_token
      state.user = action.payload.user
      state.isAuthenticated = true
      state.isInitialized = true
      localStorage.setItem('quizcraft_token', action.payload.access_token)
    },
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
      state.isAuthenticated = true
      state.isInitialized = true
    },
    setInitialized(state) {
      state.isInitialized = true
    },
    logout(state) {
      state.token = null
      state.user = null
      state.isAuthenticated = false
      state.isInitialized = true
      localStorage.removeItem('quizcraft_token')
    },
  },
})

export const { setCredentials, setUser, setInitialized, logout } =
  authSlice.actions

export default authSlice.reducer

