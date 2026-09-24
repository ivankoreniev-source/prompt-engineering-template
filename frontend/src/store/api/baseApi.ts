import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { API_BASE_URL } from '@/lib/config'
import type { RootState } from '@/store/store'

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState
      const token = state.auth.token || localStorage.getItem('quizcraft_token')
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: [
    'Auth',
    'Tests',
    'MyTests',
    'TestDetail',
    'TestTake',
    'Results',
    'MyResults',
  ],
  endpoints: () => ({}),
})

