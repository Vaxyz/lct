import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { env } from '../config/env';

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
   baseUrl: env.apiBaseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("lct_access_token");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: [
    "Church",
    "Media",
    "Events",
    "Giving",
    "Prayer",
    "Notifications",
    "Bible",
    "Devotionals",
    "Announcements",
    "Profile",
    "AdminUsers",
    "Users",
  ],
  endpoints: () => ({}),
});
