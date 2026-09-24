import { baseApi } from './baseApi'
import type {
  ResultDetail,
  ResultSummary,
  TestSubmissionPayload,
} from '@/types/result'

export const resultsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitTest: builder.mutation<
      ResultDetail,
      { testId: string; submission: TestSubmissionPayload }
    >({
      query: ({ testId, submission }) => ({
        url: `/tests/${testId}/submit`,
        method: 'POST',
        body: submission,
      }),
      invalidatesTags: ['MyResults'],
    }),
    getMyResults: builder.query<ResultSummary[], void>({
      query: () => '/results/my',
      providesTags: ['MyResults'],
    }),
    getResultById: builder.query<ResultDetail, string>({
      query: (resultId) => `/results/${resultId}`,
      providesTags: (_result, _err, resultId) => [{ type: 'Results', id: resultId }],
    }),
  }),
})

export const {
  useSubmitTestMutation,
  useGetMyResultsQuery,
  useGetResultByIdQuery,
} = resultsApi

