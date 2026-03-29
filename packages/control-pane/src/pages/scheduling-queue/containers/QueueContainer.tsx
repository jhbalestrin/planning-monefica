import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { CloseBookingRequestDto } from '@planning-monefica/shared-types';
import {
  useAssignBookingMutation,
  useCloseBookingMutation,
  useGetAssignmentQueueQuery,
  useGetOpenAssignedBookingsQuery,
} from '../api/schedulingQueueApi';
import { QueueView } from '../components/QueueView';

function errMsg(err: unknown): string | null {
  if (!err) {
    return null;
  }
  const e = err as FetchBaseQueryError;
  if (typeof e.status === 'number') {
    return `Erro HTTP ${e.status}`;
  }
  return 'Falha ao carregar fila.';
}

export function QueueContainer() {
  const q = useGetAssignmentQueueQuery();
  const o = useGetOpenAssignedBookingsQuery();
  const [assign, assignState] = useAssignBookingMutation();
  const [closeBooking, closeState] = useCloseBookingMutation();

  const onAssign = (bookingId: string) => {
    void assign({ bookingId });
  };

  const onClose = (bookingId: string, body: CloseBookingRequestDto) => {
    void closeBooking({ bookingId, body });
  };

  return (
    <QueueView
      queueLoading={q.isLoading || q.isFetching}
      openLoading={o.isLoading || o.isFetching}
      queueError={errMsg(q.error) ?? errMsg(o.error)}
      queue={q.data ?? []}
      openAssigned={o.data ?? []}
      onAssign={onAssign}
      assignPending={assignState.isLoading}
      onCloseBooking={onClose}
      closePending={closeState.isLoading}
    />
  );
}
