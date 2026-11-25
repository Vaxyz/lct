import { baseApi } from '../../app/baseApi'

export type DailyEngagement = {
  date: string
  bibleReadingUpdates: number
  devotionalJournalEntries: number
  readingPlanCompletions: number
  eventRegistrations: number
  prayerRequests: number
  churchTvSessions: number
}
export type EngagementAnalytics = {
  from: string
  to: string
  bibleReadingUpdates: number
  devotionalJournalEntries: number
  readingPlanCompletions: number
  eventRegistrations: number
  prayerRequests: number
  churchTvSessions: number
  activeChurchTvViewers: number
  daily: DailyEngagement[]
}
type ApiResponse<T> = { success: boolean; message: string; data: T }
export const engagementApi = baseApi.injectEndpoints({
  endpoints: b => ({
    engagementAnalytics: b.query<EngagementAnalytics, {from: string; to: string}>({
      query: ({from,to}) => `/v1/analytics/engagement?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      transformResponse: (response: ApiResponse<EngagementAnalytics>) => response.data,
    }),
    churchTvViewerAnalytics: b.query<ViewerAnalytics, {from: string; to: string}>({
      query: ({from,to}) => `/v1/church-tv/admin/analytics?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      transformResponse: (response: ViewerAnalytics | ApiResponse<ViewerAnalytics>) => 'data' in response ? response.data : response,
    }),
  }),
  overrideExisting: false,
})
export type ViewerAnalytics = {
  from: string; to: string; totalSessions: number; activeViewers: number
  averageDurationSeconds: number; totalViewSeconds: number; dailySessions: {day: string; sessions: number}[]
}
export const { useEngagementAnalyticsQuery, useChurchTvViewerAnalyticsQuery } = engagementApi
