import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { EligibilitySelfStatusDto } from '@planning-monefica/shared-types';

export const eligibilitySelfApi = createApi({
  reducerPath: 'eligibilitySelfApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
    prepareHeaders: (headers) => {
      const token = process.env.EXPO_PUBLIC_DEV_ACCESS_TOKEN;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getSelfEligibility: builder.query<
      EligibilitySelfStatusDto,
      { tenantId: string }
    >({
      query: ({ tenantId }) =>
        `/api/v1/ic/tenants/${tenantId}/me/eligibility`,
    }),
  }),
});

export const { useGetSelfEligibilityQuery } = eligibilitySelfApi;
