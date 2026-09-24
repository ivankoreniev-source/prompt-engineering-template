import { baseApi } from './baseApi'
import type {
  CreateTestPayload,
  TestDetail,
  TestSummary,
  TestTake,
  UpdateTestPayload,
} from '@/types/test'

export interface TestQueryParams {
  search?: string
  category?: string
  difficulty?: string
}

export const testsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedTests: builder.query<TestSummary[], TestQueryParams | void>({
      query: (params) => ({
        url: '/tests',
        params: params || {},
      }),
      providesTags: ['Tests'],
    }),
    getMyTests: builder.query<TestSummary[], void>({
      query: () => '/tests/my',
      providesTags: ['MyTests'],
    }),
    getTestForCreator: builder.query<TestDetail, string>({
      query: (testId) => `/tests/${testId}`,
      providesTags: (_result, _err, testId) => [{ type: 'TestDetail', id: testId }],
    }),
    getTestForTaking: builder.query<TestTake, string>({
      query: (testId) => `/tests/${testId}/take`,
      providesTags: (_result, _err, testId) => [{ type: 'TestTake', id: testId }],
    }),
    createTest: builder.mutation<TestDetail, CreateTestPayload>({
      query: (body) => ({
        url: '/tests',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MyTests'],
    }),
    updateTest: builder.mutation<
      TestDetail,
      { id: string; payload: UpdateTestPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/tests/${id}`,
        method: 'PUT',
        body: payload,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        'MyTests',
        'Tests',
        { type: 'TestDetail', id },
      ],
    }),
    publishTest: builder.mutation<TestDetail, string>({
      query: (testId) => ({
        url: `/tests/${testId}/publish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, testId) => [
        'MyTests',
        'Tests',
        { type: 'TestDetail', id: testId },
      ],
    }),
    unpublishTest: builder.mutation<TestDetail, string>({
      query: (testId) => ({
        url: `/tests/${testId}/unpublish`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _err, testId) => [
        'MyTests',
        'Tests',
        { type: 'TestDetail', id: testId },
      ],
    }),
    deleteTest: builder.mutation<void, string>({
      query: (testId) => ({
        url: `/tests/${testId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['MyTests', 'Tests'],
    }),
  }),
})

export const {
  useGetPublishedTestsQuery,
  useGetMyTestsQuery,
  useGetTestForCreatorQuery,
  useGetTestForTakingQuery,
  useCreateTestMutation,
  useUpdateTestMutation,
  usePublishTestMutation,
  useUnpublishTestMutation,
  useDeleteTestMutation,
} = testsApi

