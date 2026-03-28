import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { HealthResponseDto } from '@planning-monefica/shared-types';

export const healthApi = createApi({
  reducerPath: 'healthApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  }),
  tagTypes: ['Health'],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponseDto, void>({
      query: () => '/api/v1/health',
    }),
  }),
});

export const { useGetHealthQuery } = healthApi;
