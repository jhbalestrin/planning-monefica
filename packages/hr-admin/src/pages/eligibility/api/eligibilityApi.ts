import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  EligibilityCollaboratorOptionDto,
  EligibilityListItemDto,
  EligibilityMarkRequestDto,
} from '@planning-monefica/shared-types';
import { planningApiBaseQuery } from '../../../lib/apiBaseQuery';

export const eligibilityApi = createApi({
  reducerPath: 'eligibilityApi',
  baseQuery: planningApiBaseQuery,
  tagTypes: ['Eligibility'],
  endpoints: (builder) => ({
    getEligibilityList: builder.query<EligibilityListItemDto[], string>({
      query: (tenantId) => `/api/v1/hr/tenants/${tenantId}/eligibility`,
      providesTags: (_r, _e, tenantId) => [
        { type: 'Eligibility', id: `LIST_${tenantId}` },
      ],
    }),
    getCollaboratorsForEligibility: builder.query<
      EligibilityCollaboratorOptionDto[],
      { tenantId: string; excludeEligible?: boolean }
    >({
      query: ({ tenantId, excludeEligible }) => ({
        url: `/api/v1/hr/tenants/${tenantId}/eligibility/collaborators`,
        params:
          excludeEligible === true ? { excludeEligible: 'true' } : undefined,
      }),
      providesTags: (_r, _e, { tenantId }) => [
        { type: 'Eligibility', id: `COLL_${tenantId}` },
      ],
    }),
    markEligible: builder.mutation<
      EligibilityListItemDto,
      { tenantId: string; body: EligibilityMarkRequestDto }
    >({
      query: ({ tenantId, body }) => ({
        url: `/api/v1/hr/tenants/${tenantId}/eligibility`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [
        { type: 'Eligibility', id: `LIST_${tenantId}` },
        { type: 'Eligibility', id: `COLL_${tenantId}` },
      ],
    }),
    removeEligible: builder.mutation<
      { ok: true },
      { tenantId: string; userId: string }
    >({
      query: ({ tenantId, userId }) => ({
        url: `/api/v1/hr/tenants/${tenantId}/eligibility/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { tenantId }) => [
        { type: 'Eligibility', id: `LIST_${tenantId}` },
        { type: 'Eligibility', id: `COLL_${tenantId}` },
      ],
    }),
  }),
});

export const {
  useGetEligibilityListQuery,
  useGetCollaboratorsForEligibilityQuery,
  useMarkEligibleMutation,
  useRemoveEligibleMutation,
} = eligibilityApi;
