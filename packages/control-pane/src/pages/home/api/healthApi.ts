import { createApi } from '@reduxjs/toolkit/query/react';
import type { HealthResponseDto } from '@planning-monefica/shared-types';
import { planningControlPaneBaseQuery } from '../../../lib/apiBaseQuery';

export const healthApi = createApi({
  reducerPath: 'healthApi',
  baseQuery: planningControlPaneBaseQuery,
  tagTypes: ['Health'],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthResponseDto, void>({
      query: () => '/api/v1/health',
    }),
  }),
});

export const { useGetHealthQuery } = healthApi;
