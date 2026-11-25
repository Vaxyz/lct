import { baseApi } from "../../app/baseApi";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};
export type Announcement = {
  id: string;
  title: string;
  body: string;
  audienceType: "ALL" | "ROLE";
  targetRole?: string | null;
  status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
  publishAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
export type AnnouncementRequest = Pick<
  Announcement,
  "title" | "body" | "audienceType" | "status"
> & { targetRole?: string | null; publishAt?: string | null };
export const announcementsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnnouncements: builder.query<ApiResponse<Announcement[]>, void>({
      query: () => "/v1/announcements",
      providesTags: ["Announcements"],
    }),
    getAdminAnnouncements: builder.query<ApiResponse<Announcement[]>, void>({
      query: () => "/v1/announcements/admin",
      providesTags: ["Announcements"],
    }),
    createAnnouncement: builder.mutation<
      ApiResponse<Announcement>,
      AnnouncementRequest
    >({
      query: (body) => ({
        url: "/v1/announcements/admin",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Announcements"],
    }),
    updateAnnouncement: builder.mutation<
      ApiResponse<Announcement>,
      { id: string; body: AnnouncementRequest }
    >({
      query: ({ id, body }) => ({
        url: `/v1/announcements/admin/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Announcements"],
    }),
  }),
});
export const {
  useGetAnnouncementsQuery,
  useGetAdminAnnouncementsQuery,
  useCreateAnnouncementMutation,
  useUpdateAnnouncementMutation,
} = announcementsApi;
