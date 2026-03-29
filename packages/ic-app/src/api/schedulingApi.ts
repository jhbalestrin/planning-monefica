import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BookingSummaryDto,
  EmployeeBookableSlotDto,
} from '@planning-monefica/shared-types';

function weekRangeUtc(): { fromUtc: string; toUtc: string } {
  const now = new Date();
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { fromUtc: start.toISOString(), toUtc: end.toISOString() };
}

export { weekRangeUtc };

export const schedulingApi = createApi({
  reducerPath: 'schedulingApi',
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
  tagTypes: ['BookableSlots', 'MyBookings'],
  endpoints: (builder) => ({
    getBookableSlots: builder.query<
      EmployeeBookableSlotDto[],
      { tenantId: string; fromUtc: string; toUtc: string }
    >({
      query: ({ tenantId, fromUtc, toUtc }) => ({
        url: `/api/v1/ic/tenants/${tenantId}/scheduling/slots`,
        params: { fromUtc, toUtc },
      }),
      providesTags: ['BookableSlots'],
    }),
    getMyBookings: builder.query<BookingSummaryDto[], { tenantId: string }>({
      query: ({ tenantId }) => `/api/v1/ic/tenants/${tenantId}/scheduling/bookings`,
      providesTags: ['MyBookings'],
    }),
    createBooking: builder.mutation<
      BookingSummaryDto,
      {
        tenantId: string;
        consultantId: string;
        slotStartUtc: string;
        slotEndUtc: string;
        idempotencyKey?: string;
      }
    >({
      query: ({ tenantId, consultantId, slotStartUtc, slotEndUtc, idempotencyKey }) => ({
        url: `/api/v1/ic/tenants/${tenantId}/scheduling/bookings`,
        method: 'POST',
        body: { consultantId, slotStartUtc, slotEndUtc },
        headers: idempotencyKey
          ? { 'Idempotency-Key': idempotencyKey }
          : undefined,
      }),
      invalidatesTags: ['BookableSlots', 'MyBookings'],
    }),
    cancelBooking: builder.mutation<
      BookingSummaryDto,
      { tenantId: string; bookingId: string }
    >({
      query: ({ tenantId, bookingId }) => ({
        url: `/api/v1/ic/tenants/${tenantId}/scheduling/bookings/${bookingId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['BookableSlots', 'MyBookings'],
    }),
    rescheduleBooking: builder.mutation<
      BookingSummaryDto,
      {
        tenantId: string;
        bookingId: string;
        consultantId: string;
        slotStartUtc: string;
        slotEndUtc: string;
        idempotencyKey?: string;
      }
    >({
      query: (arg) => ({
        url: `/api/v1/ic/tenants/${arg.tenantId}/scheduling/bookings/${arg.bookingId}/reschedule`,
        method: 'POST',
        body: {
          consultantId: arg.consultantId,
          slotStartUtc: arg.slotStartUtc,
          slotEndUtc: arg.slotEndUtc,
        },
        headers: arg.idempotencyKey
          ? { 'Idempotency-Key': arg.idempotencyKey }
          : undefined,
      }),
      invalidatesTags: ['BookableSlots', 'MyBookings'],
    }),
  }),
});

export const {
  useGetBookableSlotsQuery,
  useGetMyBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
  useRescheduleBookingMutation,
} = schedulingApi;
