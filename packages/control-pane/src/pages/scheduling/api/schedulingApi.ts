import { createApi } from '@reduxjs/toolkit/query/react';
import type { ConsultantCalendarSummaryDto } from '@planning-monefica/shared-types';
import { planningControlPaneBaseQuery } from '../../../lib/apiBaseQuery';

export type CalendarRangeParams = { fromUtc: string; toUtc: string };

export const schedulingApi = createApi({
  reducerPath: 'schedulingApi',
  baseQuery: planningControlPaneBaseQuery,
  tagTypes: ['SchedulingCalendar'],
  endpoints: (builder) => ({
    getMyCalendar: builder.query<ConsultantCalendarSummaryDto, CalendarRangeParams>({
      query: ({ fromUtc, toUtc }) => ({
        url: '/api/v1/scheduling/consultant/me/calendar',
        params: { fromUtc, toUtc },
      }),
      providesTags: ['SchedulingCalendar'],
    }),
  }),
});

export const { useGetMyCalendarQuery } = schedulingApi;
