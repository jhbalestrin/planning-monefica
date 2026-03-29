import { createApi } from '@reduxjs/toolkit/query/react';
import type {
  BookingClosureReasonCode,
  BookingQueueItemDto,
  BookingSummaryDto,
  CloseBookingRequestDto,
} from '@planning-monefica/shared-types';
import { planningControlPaneBaseQuery } from '../../../lib/apiBaseQuery';

export const schedulingQueueApi = createApi({
  reducerPath: 'schedulingQueueApi',
  baseQuery: planningControlPaneBaseQuery,
  tagTypes: ['AssignmentQueue', 'OpenAssigned'],
  endpoints: (builder) => ({
    getAssignmentQueue: builder.query<BookingQueueItemDto[], void>({
      query: () => '/api/v1/scheduling/consultant/me/assignment-queue',
      providesTags: ['AssignmentQueue'],
    }),
    getOpenAssignedBookings: builder.query<BookingSummaryDto[], void>({
      query: () => '/api/v1/scheduling/consultant/me/open-assigned-bookings',
      providesTags: ['OpenAssigned'],
    }),
    assignBooking: builder.mutation<BookingSummaryDto, { bookingId: string }>({
      query: ({ bookingId }) => ({
        url: `/api/v1/scheduling/consultant/me/assignment-queue/${bookingId}/assign`,
        method: 'POST',
      }),
      invalidatesTags: ['AssignmentQueue', 'OpenAssigned'],
    }),
    closeBooking: builder.mutation<
      BookingSummaryDto,
      { bookingId: string; body: CloseBookingRequestDto }
    >({
      query: ({ bookingId, body }) => ({
        url: `/api/v1/scheduling/consultant/me/bookings/${bookingId}/close`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['AssignmentQueue', 'OpenAssigned'],
    }),
  }),
});

export const {
  useGetAssignmentQueueQuery,
  useGetOpenAssignedBookingsQuery,
  useAssignBookingMutation,
  useCloseBookingMutation,
} = schedulingQueueApi;

export const closureReasonsByOutcome: Record<
  CloseBookingRequestDto['outcome'],
  BookingClosureReasonCode[]
> = {
  completed: ['delivered_completed'],
  cancelled: ['client_cancelled', 'consultant_cancelled'],
  no_show: ['no_show_employee', 'no_show_other'],
};
