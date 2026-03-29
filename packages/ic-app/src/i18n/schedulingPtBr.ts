import type { BookingState } from '@planning-monefica/shared-types';
import { SchedulingErrorCodes } from '@planning-monefica/shared-types';

/** UX-DR6 — status badges for collaborator list. */
export const bookingStateChipPtBr: Record<BookingState, string> = {
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  no_show: 'Falta',
  completed: 'Concluída',
};

/** UX-DR2 — map API error codes to collaborator-facing pt-BR copy. */
export function messageForSchedulingErrorCode(code: string | undefined): string {
  switch (code) {
    case SchedulingErrorCodes.BOOKING_NOT_CANCELLABLE:
      return 'Não é possível alterar ou cancelar: prazo ou política não permitem.';
    case SchedulingErrorCodes.BOOKING_NOT_RESCHEDULABLE:
      return 'Reagendamento não disponível para esta sessão.';
    case SchedulingErrorCodes.SLOT_TAKEN:
      return 'Esse horário acabou de ser reservado. Escolha outro.';
    case SchedulingErrorCodes.BOOKING_SLOT_INVALID:
      return 'Horário inválido ou indisponível.';
    case SchedulingErrorCodes.RANGE_EXCEEDS_MAX:
      return 'Intervalo de datas muito longo; reduza a busca.';
    case SchedulingErrorCodes.BOOKING_NOT_FOUND:
      return 'Sessão não encontrada.';
    default:
      return 'Não foi possível concluir a ação. Tente novamente.';
  }
}

/** UX-DR7 — post-booking confirmation line (date/time in UTC label). */
export function bookingConfirmationLinePtBr(slotStartUtc: string, slotEndUtc: string): string {
  return `Sessão confirmada: ${slotStartUtc.slice(0, 16)} → ${slotEndUtc.slice(0, 16)} (UTC).`;
}
