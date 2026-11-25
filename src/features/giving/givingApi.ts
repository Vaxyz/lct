import { baseApi } from "../../app/baseApi";
export type GivingFund = {
  id: string;
  name: string;
  description?: string;
  active: boolean;
};
export type GivingRequest = {
  fundId: string;
  amount: number;
  donorEmail: string;
  donorName: string;
  anonymous: boolean;
  description?: string;
  provider: "PAYSTACK" | "FLUTTERWAVE";
};
export type PaymentInit = {
  provider: string;
  reference: string;
  checkoutUrl: string;
  status: string;
};
export type GivingRecord = {
  id: string;
  fundId: string;
  amount: number;
  currency: string;
  provider: string;
  reference: string;
  status: string;
  donorName: string;
  donorEmail: string;
  anonymous: boolean;
  paidAt?: string;
  createdAt?: string;
};
export const givingApi = baseApi.injectEndpoints({
  endpoints: (b) => ({
    funds: b.query<GivingFund[], void>({
      query: () => "/v1/giving/funds",
      transformResponse: (r: { data: GivingFund[] }) => r.data,
    }),
    initializeGiving: b.mutation<PaymentInit, GivingRequest>({
      query: (body) => ({ url: "/v1/giving/initialize", method: "POST", body }),
      transformResponse: (r: { data: PaymentInit }) => r.data,
    }),
    myGiving: b.query<GivingRecord[], void>({
      query: () => "/v1/giving/mine",
      transformResponse: (r: { data: GivingRecord[] }) => r.data,
    }),
    givingTransactions: b.query<GivingRecord[], void>({
      query: () => "/v1/giving/transactions",
      transformResponse: (r: { data: GivingRecord[] }) => r.data,
    }),
    verifyGiving: b.query<
      GivingRecord,
      { provider: "PAYSTACK" | "FLUTTERWAVE"; reference: string }
    >({
      query: ({ provider, reference }) =>
        `/v1/giving/verify/${provider}/${encodeURIComponent(reference)}`,
      transformResponse: (r: { data: GivingRecord }) => r.data,
    }),
    givingAnalytics: b.query<GivingAnalytics, { from?: string; to?: string }>({
      query: ({ from, to }) => ({
        url: "/v1/giving/analytics",
        params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
      }),
      transformResponse: (r: { data: GivingAnalytics }) => r.data,
    }),
  }),
  overrideExisting: false,
});
export const {
  useFundsQuery,
  useInitializeGivingMutation,
  useMyGivingQuery,
  useGivingTransactionsQuery,
  useVerifyGivingQuery,
  useGivingAnalyticsQuery,
} = givingApi;


export type GivingAnalytics = {
  from: string; to: string; totalTransactions: number; successfulTransactions: number;
  pendingTransactions: number; failedTransactions: number; successfulAmount: number;
  daily: Array<{ date: string; transactions: number; successfulTransactions: number; successfulAmount: number }>;
  providers: Array<{ provider: string; transactions: number; successfulTransactions: number; successfulAmount: number }>;
  funds: Array<{ fundName: string; transactions: number; successfulTransactions: number; successfulAmount: number }>;
};
