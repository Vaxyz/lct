import { baseApi } from "../../app/baseApi";
export type Sermon = {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  topic?: string;
  bibleReferences?: string;
  description?: string;
  status: string;
  featured: boolean;
  mediaUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  publishedAt?: string;
  mediaAssetId?: string;
};
export type LiveStream = {
  id: string;
  title: string;
  streamUrl?: string;
  playbackUrl?: string;
  status: string;
  scheduledStart?: string;
  scheduledEnd?: string;
  recordingEnabled: boolean;
};
export type LiveChatMessage = {
  id: string;
  streamId: string;
  senderName: string;
  message: string;
  createdAt: string;
};
export type LiveChatMessagePayload = {
  message: string;
};
export type LiveStreamPayload = {
  title: string;
  streamUrl: string | null;
  playbackUrl: string | null;
  status: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  recordingEnabled: boolean;
};
export const mediaApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    sermons: b.query<Sermon[], string | void>({
      query: (q) =>
        q ? `/v1/sermons?q=${encodeURIComponent(q)}` : "/v1/sermons",
      providesTags: ["Media"],
    }),
    featuredSermons: b.query<Sermon[], void>({
      query: () => "/v1/sermons/featured",
      providesTags: ["Media"],
    }),
    sermon: b.query<Sermon, string>({
      query: (slug) => `/v1/sermons/${slug}`,
      providesTags: ["Media"],
    }),
    currentStream: b.query<LiveStream | null, void>({
      query: () => "/v1/church-tv/current",
      providesTags: ["Media"],
    }),
    schedule: b.query<LiveStream[], void>({
      query: () => "/v1/church-tv/schedule",
      providesTags: ["Media"],
    }),
    chatMessages: b.query<LiveChatMessage[], string>({
      query: (streamId) => `/v1/church-tv/${streamId}/chat`,
      providesTags: ["Media"],
    }),
    sendChatMessage: b.mutation<
      LiveChatMessage,
      { streamId: string; body: LiveChatMessagePayload }
    >({
      query: ({ streamId, body }) => ({
        url: `/v1/church-tv/${streamId}/chat`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Media"],
    }),
    adminChatMessages: b.query<LiveChatMessage[], string>({
      query: (streamId) => `/v1/church-tv/admin/${streamId}/chat`,
      providesTags: ["Media"],
    }),
    removeChatMessage: b.mutation<void, string>({
      query: (messageId) => ({
        url: `/v1/church-tv/admin/chat/${messageId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Media"],
    }),
    adminStreams: b.query<LiveStream[], void>({
      query: () => "/v1/church-tv/admin",
      providesTags: ["Media"],
    }),
    createStream: b.mutation<LiveStream, LiveStreamPayload>({
      query: (body) => ({ url: "/v1/church-tv/admin", method: "POST", body }),
      invalidatesTags: ["Media"],
    }),
    updateStream: b.mutation<
      LiveStream,
      { id: string; body: LiveStreamPayload }
    >({
      query: ({ id, body }) => ({
        url: `/v1/church-tv/admin/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Media"],
    }),
    deleteStream: b.mutation<void, string>({
      query: (id) => ({ url: `/v1/church-tv/admin/${id}`, method: "DELETE" }),
      invalidatesTags: ["Media"],
    }),
    createSermon: b.mutation<
      Sermon,
      Omit<Partial<Sermon>, "mediaAssetId"> & { slug: string; speaker: string; title: string; mediaAssetId?: string | null }
    >({
      query: (body) => ({ url: "/v1/sermons", method: "POST", body }),
      invalidatesTags: ["Media"],
    }),
    mySermons: b.query<Sermon[], void>({
      query: () => "/v1/sermons/mine",
      providesTags: ["Media"],
    }),
    updateSermon: b.mutation<
      Sermon,
      {
        id: string;
        body: Omit<Partial<Sermon>, "mediaAssetId"> & {
          title: string;
          speaker: string;
          slug: string;
          mediaAssetId?: string | null;
        };
      }
    >({
      query: ({ id, body }) => ({
        url: `/v1/sermons/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Media"],
    }),
    deleteSermon: b.mutation<void, string>({
      query: (id) => ({ url: `/v1/sermons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Media"],
    }),
    publishSermon: b.mutation<Sermon, string>({
      query: (id) => ({ url: `/v1/sermons/${id}/publish`, method: "POST" }),
      invalidatesTags: ["Media"],
    }),
  }),
  overrideExisting: false,
});
export const {
  useSermonsQuery,
  useFeaturedSermonsQuery,
  useSermonQuery,
  useCurrentStreamQuery,
  useScheduleQuery,
  useChatMessagesQuery,
  useSendChatMessageMutation,
  useAdminChatMessagesQuery,
  useRemoveChatMessageMutation,
  useAdminStreamsQuery,
  useCreateStreamMutation,
  useUpdateStreamMutation,
  useDeleteStreamMutation,
  useCreateSermonMutation,
  useMySermonsQuery,
  useUpdateSermonMutation,
  useDeleteSermonMutation,
  usePublishSermonMutation,
} = mediaApi;
