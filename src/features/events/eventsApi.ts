import { baseApi } from "../../app/baseApi";

export type EventItem = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  venue?: string;
  address?: string;
  startAt: string;
  endAt: string;
  timezone: string;
  capacity?: number;
  registeredCount: number;
  registrationRequired: boolean;
  status: string;
  featured: boolean;
  coverImageUrl?: string;
};
export type EventRequest = {
  title: string;
  description?: string;
  category?: string;
  venue?: string;
  address?: string;
  startAt: string;
  endAt: string;
  timezone?: string;
  capacity?: number;
  registrationRequired: boolean;
  featured: boolean;
  coverImageUrl?: string;
};
export type EventCategory = { id: string; name: string; description?: string };
export type EventCategoryRequest = { name: string; description?: string };
export type Registration = {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  registeredAt: string;
};

export const eventsApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    eventCategories: b.query<EventCategory[], void>({
      query: () => "/v1/event-categories",
      providesTags: ["Events"],
    }),
    createEventCategory: b.mutation<EventCategory, EventCategoryRequest>({
      query: (body) => ({ url: "/v1/event-categories", method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
    updateEventCategory: b.mutation<
      EventCategory,
      { id: string; body: EventCategoryRequest }
    >({
      query: ({ id, body }) => ({
        url: `/v1/event-categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEventCategory: b.mutation<void, string>({
      query: (id) => ({ url: `/v1/event-categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Events"],
    }),
    events: b.query<EventItem[], { q?: string; category?: string } | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.q) qs.set("q", params.q);
        if (params?.category) qs.set("category", params.category);
        return `/v1/events${qs.toString() ? `?${qs}` : ""}`;
      },
      providesTags: ["Events"],
    }),
    featuredEvents: b.query<EventItem[], void>({
      query: () => "/v1/events/featured",
      providesTags: ["Events"],
    }),
    event: b.query<EventItem, string>({
      query: (slug) => `/v1/events/${slug}`,
      providesTags: ["Events"],
    }),
    adminEvents: b.query<EventItem[], void>({
      query: () => "/v1/events/admin/all",
      providesTags: ["Events"],
    }),
    createEvent: b.mutation<EventItem, EventRequest>({
      query: (body) => ({ url: "/v1/events", method: "POST", body }),
      invalidatesTags: ["Events"],
    }),
    updateEvent: b.mutation<EventItem, { id: string; body: EventRequest }>({
      query: ({ id, body }) => ({
        url: `/v1/events/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Events"],
    }),
    deleteEvent: b.mutation<void, string>({
      query: (id) => ({ url: `/v1/events/${id}`, method: "DELETE" }),
      invalidatesTags: ["Events"],
    }),
    publishEvent: b.mutation<EventItem, string>({
      query: (id) => ({ url: `/v1/events/${id}/publish`, method: "POST" }),
      invalidatesTags: ["Events"],
    }),
    cancelEvent: b.mutation<EventItem, string>({
      query: (id) => ({ url: `/v1/events/${id}/cancel`, method: "POST" }),
      invalidatesTags: ["Events"],
    }),
    registerEvent: b.mutation<Registration, string>({
      query: (id) => ({ url: `/v1/events/${id}/register`, method: "POST" }),
      invalidatesTags: ["Events"],
    }),
    cancelRegistration: b.mutation<Registration, string>({
      query: (id) => ({
        url: `/v1/events/${id}/register/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Events"],
    }),
    registrations: b.query<Registration[], string>({
      query: (id) => `/v1/events/${id}/registrations`,
      providesTags: ["Events"],
    }),
  }),
  overrideExisting: false,
});
export const {
  useEventCategoriesQuery,
  useCreateEventCategoryMutation,
  useUpdateEventCategoryMutation,
  useDeleteEventCategoryMutation,
  useEventsQuery,
  useFeaturedEventsQuery,
  useEventQuery,
  useAdminEventsQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  usePublishEventMutation,
  useDeleteEventMutation,
  useCancelEventMutation,
  useRegisterEventMutation,
  useCancelRegistrationMutation,
  useRegistrationsQuery,
} = eventsApi;
