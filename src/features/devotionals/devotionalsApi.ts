import { baseApi } from '../../app/baseApi'

export type ApiResponse<T> = { success: boolean; message: string; data: T; timestamp: string }
export type DevotionalStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED'
export type Devotional = {
  id: string
  title: string
  slug: string
  theme?: string | null
  scriptureReference: string
  scriptureText?: string | null
  reflection: string
  practicalApplication?: string | null
  prayer?: string | null
  status?: DevotionalStatus
  publishAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}
export type SaveDevotionalRequest = Partial<Devotional> &
  Pick<Devotional, 'title' | 'scriptureReference' | 'reflection'> & {
    status?: DevotionalStatus
    publishAt?: string
  }
export type JournalEntry = { id: string; devotionalId?: string | null; entryDate: string; reflection?: string | null; prayerNotes?: string | null; gratitudeNotes?: string | null; createdAt?: string; updatedAt?: string }
export type ReadingPlanDay = { dayNumber: number; devotionalId?: string | null; scriptureReference?: string | null; reflectionPrompt?: string | null }
export type ReadingPlan = { id: string; title: string; slug: string; description?: string | null; durationDays: number; days?: ReadingPlanDay[]; status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; configuredDays?: number }
export type AdminReadingPlan = ReadingPlan & { status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; configuredDays: number }
export type JournalInput = { devotionalId?: string; entryDate?: string; reflection?: string; prayerNotes?: string; gratitudeNotes?: string }

export const devotionalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDevotionals: builder.query<ApiResponse<Devotional[]>, { q?: string; theme?: string; date?: string } | void>({ query: (params) => ({ url: '/v1/devotionals', params: params || undefined }), providesTags: ['Devotionals'] }),
    getDevotional: builder.query<ApiResponse<Devotional>, string>({ query: (slug) => `/v1/devotionals/${slug}`, providesTags: ['Devotionals'] }),
    getAdminDevotionals: builder.query<ApiResponse<Devotional[]>, { status?: DevotionalStatus | 'ALL'; q?: string } | void>({
      query: (params) => ({ url: '/v1/devotionals/admin', params: params || undefined }),
      providesTags: ['Devotionals'],
    }),
    getReadingPlans: builder.query<ApiResponse<ReadingPlan[]>, void>({ query: () => '/v1/devotionals/plans', providesTags: ['Devotionals'] }),
    getAdminReadingPlans: builder.query<ApiResponse<AdminReadingPlan[]>, void>({ query: () => '/v1/devotionals/plans/admin', providesTags: ['Devotionals'] }),
    getReadingPlan: builder.query<ApiResponse<ReadingPlan>, string>({ query: (id) => `/v1/devotionals/plans/${id}`, providesTags: ['Devotionals'] }),
    getMyJournal: builder.query<ApiResponse<JournalEntry[]>, void>({ query: () => '/v1/devotionals/journal', providesTags: ['Devotionals'] }),
    createJournal: builder.mutation<ApiResponse<JournalEntry>, JournalInput>({ query: (body) => ({ url: '/v1/devotionals/journal', method: 'POST', body }), invalidatesTags: ['Devotionals'] }),
    updateJournal: builder.mutation<ApiResponse<JournalEntry>, { id: string; body: JournalInput }>({ query: ({ id, body }) => ({ url: `/v1/devotionals/journal/${id}`, method: 'PUT', body }), invalidatesTags: ['Devotionals'] }),
    deleteJournal: builder.mutation<ApiResponse<null>, string>({ query: (id) => ({ url: `/v1/devotionals/journal/${id}`, method: 'DELETE' }), invalidatesTags: ['Devotionals'] }),
    completeReadingDay: builder.mutation<ApiResponse<unknown>, { planId: string; day: number }>({ query: ({ planId, day }) => ({ url: `/v1/devotionals/plans/${planId}/days/${day}/complete`, method: 'POST' }), invalidatesTags: ['Devotionals'] }),
    getReadingProgress: builder.query<ApiResponse<{ dayNumber: number; completedAt: string }[]>, string>({ query: (id) => `/v1/devotionals/plans/${id}/progress`, providesTags: ['Devotionals'] }),
    saveDevotional: builder.mutation<ApiResponse<Devotional>, SaveDevotionalRequest>({ query: (body) => ({ url: '/v1/devotionals/admin', method: 'POST', body }), invalidatesTags: ['Devotionals'] }),
    updateDevotional: builder.mutation<ApiResponse<Devotional>, { id: string; body: SaveDevotionalRequest }>({
      query: ({ id, body }) => ({ url: `/v1/devotionals/admin/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Devotionals'],
    }),
    saveReadingPlan: builder.mutation<ApiResponse<ReadingPlan>, { title: string; description?: string; durationDays: number; status?: string }>({ query: (body) => ({ url: '/v1/devotionals/plans/admin', method: 'POST', body }), invalidatesTags: ['Devotionals'] }),
    addReadingPlanDay: builder.mutation<ApiResponse<unknown>, { id: string; dayNumber: number; scriptureReference?: string; reflectionPrompt?: string }>({ query: ({ id, ...body }) => ({ url: `/v1/devotionals/plans/admin/${id}/days`, method: 'POST', body }), invalidatesTags: ['Devotionals'] }),
    updateReadingPlan: builder.mutation<ApiResponse<ReadingPlan>, { id: string; title: string; description?: string; durationDays: number; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' }>({ query: ({ id, ...body }) => ({ url: `/v1/devotionals/plans/admin/${id}`, method: 'PUT', body }), invalidatesTags: ['Devotionals'] }),
  }),
})

export const { useGetDevotionalsQuery, useGetDevotionalQuery, useGetAdminDevotionalsQuery, useGetReadingPlansQuery, useGetAdminReadingPlansQuery, useGetReadingPlanQuery, useGetMyJournalQuery, useCreateJournalMutation, useUpdateJournalMutation, useDeleteJournalMutation, useCompleteReadingDayMutation, useGetReadingProgressQuery, useSaveDevotionalMutation, useUpdateDevotionalMutation, useSaveReadingPlanMutation, useAddReadingPlanDayMutation, useUpdateReadingPlanMutation } = devotionalsApi
