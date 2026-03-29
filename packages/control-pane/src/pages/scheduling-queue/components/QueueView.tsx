import {
  Alert,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import type {
  BookingClosureReasonCode,
  BookingQueueItemDto,
  BookingSummaryDto,
  CloseBookingRequestDto,
} from '@planning-monefica/shared-types';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { PLANNING_WEB_UX } from '@planning-monefica/shared-types';
import { PlanningDialog } from '../../../components/PlanningDialog';
import { closureReasonsByOutcome } from '../api/schedulingQueueApi';

export type QueueViewProps = {
  queueLoading: boolean;
  openLoading: boolean;
  queueError: string | null;
  queue: BookingQueueItemDto[];
  openAssigned: BookingSummaryDto[];
  onAssign: (bookingId: string) => void;
  assignPending: boolean;
  onCloseBooking: (bookingId: string, body: CloseBookingRequestDto) => void;
  closePending: boolean;
};

export function QueueView({
  queueLoading,
  openLoading,
  queueError,
  queue,
  openAssigned,
  onAssign,
  assignPending,
  onCloseBooking,
  closePending,
}: QueueViewProps) {
  const [closeTarget, setCloseTarget] = useState<BookingSummaryDto | null>(null);
  const [outcome, setOutcome] = useState<CloseBookingRequestDto['outcome']>('completed');
  const [reasonCode, setReasonCode] = useState<BookingClosureReasonCode>('delivered_completed');

  const reasons = closureReasonsByOutcome[outcome];

  return (
    <Box sx={{ p: 4, maxWidth: PLANNING_WEB_UX.layout.pageMaxWidthMd }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" color="primary">
          Fila de atribuição
        </Typography>
        <Button component={RouterLink} to="/scheduling" size="small" variant="outlined">
          Calendário
        </Button>
      </Stack>
      <Button component={RouterLink} to="/" size="small" sx={{ mb: 2 }}>
        ← Home
      </Button>
      {queueError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {queueError}
        </Alert>
      )}
      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
        Aguardando Assumir (UX-DR8)
      </Typography>
      <Table size="small" sx={{ mb: 4 }} aria-label="Fila de reservas sem consultor atribuído">
        <TableHead>
          <TableRow>
            <TableCell>Início (UTC)</TableCell>
            <TableCell>Tenant</TableCell>
            <TableCell>Colaborador</TableCell>
            <TableCell align="right">Ação</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {queueLoading && (
            <TableRow>
              <TableCell colSpan={4}>
                Carregando…
              </TableCell>
            </TableRow>
          )}
          {!queueLoading && queue.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                Nenhum item na fila.
              </TableCell>
            </TableRow>
          )}
          {queue.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.slotStartUtc.slice(0, 16)}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.tenantId}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.employeeUserId}</TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  variant="contained"
                  color="secondary"
                  disabled={assignPending}
                  onClick={() => onAssign(row.id)}
                >
                  Assumir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6" gutterBottom>
        Minhas sessões abertas
      </Typography>
      <Table size="small" aria-label="Sessões atribuídas a mim">
        <TableHead>
          <TableRow>
            <TableCell>Início (UTC)</TableCell>
            <TableCell>Tenant</TableCell>
            <TableCell align="right">Encerrar</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {openLoading && (
            <TableRow>
              <TableCell colSpan={3}>
                Carregando…
              </TableCell>
            </TableRow>
          )}
          {!openLoading && openAssigned.length === 0 && (
            <TableRow>
              <TableCell colSpan={3}>
                Nenhuma sessão aberta atribuída a você.
              </TableCell>
            </TableRow>
          )}
          {openAssigned.map((row) => (
            <TableRow key={row.id}>
              <TableCell>{row.slotStartUtc.slice(0, 16)}</TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{row.tenantId}</TableCell>
              <TableCell align="right">
                <Button size="small" variant="outlined" onClick={() => setCloseTarget(row)}>
                  Encerrar
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <PlanningDialog
        open={closeTarget != null}
        onClose={() => setCloseTarget(null)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="queue-close-title"
      >
        <DialogTitle id="queue-close-title">Encerrar sessão</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="outcome-label">Resultado</InputLabel>
              <Select
                labelId="outcome-label"
                label="Resultado"
                value={outcome}
                onChange={(e) => {
                  const o = e.target.value as CloseBookingRequestDto['outcome'];
                  setOutcome(o);
                  setReasonCode(closureReasonsByOutcome[o][0]);
                }}
              >
                <MenuItem value="completed">Concluída</MenuItem>
                <MenuItem value="cancelled">Cancelada</MenuItem>
                <MenuItem value="no_show">No-show</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="reason-label">Motivo</InputLabel>
              <Select
                labelId="reason-label"
                label="Motivo"
                value={reasonCode}
                onChange={(e) => setReasonCode(e.target.value as BookingClosureReasonCode)}
              >
                {reasons.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseTarget(null)}>Cancelar</Button>
          <Button
            variant="contained"
            disabled={closePending || !closeTarget}
            onClick={() => {
              if (!closeTarget) {
                return;
              }
              onCloseBooking(closeTarget.id, { outcome, reasonCode });
              setCloseTarget(null);
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </PlanningDialog>
    </Box>
  );
}
