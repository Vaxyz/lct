import { baseApi } from "../../app/baseApi";

export type UploadResponse = { url: string; publicId: string; resourceType: string };
export type MediaAssetUploadResponse = {
  id: string;
  title: string;
  mediaType: "VIDEO" | "AUDIO";
  mediaUrl: string;
  durationSeconds?: number;
  publicId: string;
};
type ApiResponse<T> = { success: boolean; message: string; data: T };

export const storageApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    uploadEventImage: b.mutation<UploadResponse, FormData>({
      query: (body) => ({ url: "/v1/storage/event-image", method: "POST", body }),
      transformResponse: (r: ApiResponse<UploadResponse>) => r.data,
    }),
    uploadMediaAsset: b.mutation<MediaAssetUploadResponse, FormData>({
      query: (body) => ({ url: "/v1/storage/media", method: "POST", body }),
      transformResponse: (r: ApiResponse<MediaAssetUploadResponse>) => r.data,
    }),
  }),
  overrideExisting: false,
});
export const { useUploadEventImageMutation, useUploadMediaAssetMutation } = storageApi;
