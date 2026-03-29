import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { ConsultantCalendarSummaryDto } from '@planning-monefica/shared-types';
import { PLANNING_WEB_UX } from '@planning-monefica/shared-types';
import { BookingStateChip } from '../../../components/BookingStateChip';

export type SchedulingViewProps = {
  loading: boolean;
  errorMessage: string | null;
  summary: ConsultantCalendarSummaryDto | null;
  rangeLabel: string;
};

function formatWindow(startIso: string, endIso: string): string {
  const s = new Date(startIso);
  const e = new Date(endIso);
  return `${s.toISOString().slice(0, 16)} → ${e.toISOString().slice(0, 16)} UTC`;
}

export function SchedulingView({
  loading,
  errorMessage,
  summary,
  rangeLabel,
}: SchedulingViewProps) {
  return (
    <Box sx={{ p: 4, maxWidth: PLANNING_WEB_UX.layout.pageMaxWidthScheduling }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" color="primary">
          Scheduling
        </Typography>
        <Chip label={rangeLabel} size="small" variant="outlined" color="secondary" />
      </Stack>
      <Box sx={{ mb: 2 }}>
        <Button component={RouterLink} to="/" size="small" variant="text" color="primary">
          ← Home
        </Button>
      </Box>
      {loading && <CircularProgress size={28} aria-label="Loading calendar" />}
      {errorMessage && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {summary && !loading && (
        <Stack spacing={3} divider={<Divider flexItem />}>
          <section aria-labelledby="availability-heading">
            <Typography id="availability-heading" variant="h6" gutterBottom>
              Availability
            </Typography>
            {summary.availability.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No availability in this range.
              </Typography>
            ) : (
              <List dense disablePadding>
                {summary.availability.map((b) => (
                  <ListItem key={b.id} sx={{ py: 1, alignItems: 'flex-start' }}>
                    <ListItemText
                      primary={formatWindow(b.startUtc, b.endUtc)}
                      secondary={`Tenant ${b.tenantId}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </section>
          <section aria-labelledby="bookings-heading">
            <Typography id="bookings-heading" variant="h6" gutterBottom>
              Bookings
            </Typography>
            {summary.bookings.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No confirmed bookings in this range.
              </Typography>
            ) : (
              <List dense disablePadding>
                {summary.bookings.map((bk) => (
                  <ListItem
                    key={bk.id}
                    sx={{ py: 1, alignItems: 'flex-start', gap: 1, flexWrap: 'wrap' }}
                  >
                    <BookingStateChip state={bk.state} />
                    <ListItemText
                      primary={formatWindow(bk.slotStartUtc, bk.slotEndUtc)}
                      secondary={`Employee ${bk.employeeUserId} · Tenant ${bk.tenantId}`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </section>
        </Stack>
      )}
    </Box>
  );
}
