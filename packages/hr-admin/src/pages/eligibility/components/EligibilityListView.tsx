import {
  Alert,
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import type {
  EligibilityCollaboratorOptionDto,
  EligibilityListItemDto,
} from '@planning-monefica/shared-types';
import { PLANNING_WEB_UX } from '@planning-monefica/shared-types';
import { BenefitEligibilityStatusChip } from '../../../components/BenefitEligibilityStatusChip';
import { PlanningDialog } from '../../../components/PlanningDialog';

export type EligibilityListViewProps = {
  tenantId: string;
  rows: EligibilityListItemDto[];
  loadingList: boolean;
  listError: boolean;
  addOpen: boolean;
  onOpenAdd: () => void;
  onCloseAdd: () => void;
  collaboratorOptions: EligibilityCollaboratorOptionDto[];
  loadingCollaborators: boolean;
  selectedCollaborator: EligibilityCollaboratorOptionDto | null;
  onSelectCollaborator: (v: EligibilityCollaboratorOptionDto | null) => void;
  onConfirmAdd: () => void;
  adding: boolean;
  removePhase: null | 'warn' | 'final';
  pendingEmail: string;
  onRequestRemove: (row: EligibilityListItemDto) => void;
  onRemoveContinue: () => void;
  onRemoveBack: () => void;
  onRemoveCancel: () => void;
  onRemoveConfirm: () => void;
  removing: boolean;
};

export function EligibilityListView({
  tenantId,
  rows,
  loadingList,
  listError,
  addOpen,
  onOpenAdd,
  onCloseAdd,
  collaboratorOptions,
  loadingCollaborators,
  selectedCollaborator,
  onSelectCollaborator,
  onConfirmAdd,
  adding,
  removePhase,
  pendingEmail,
  onRequestRemove,
  onRemoveContinue,
  onRemoveBack,
  onRemoveCancel,
  onRemoveConfirm,
  removing,
}: EligibilityListViewProps) {
  return (
    <Box
      sx={{
        p: 3,
        maxWidth: PLANNING_WEB_UX.layout.pageMaxWidthLg,
        mx: 'auto',
      }}
    >
      <Typography variant="h4" component="h1" gutterBottom>
        Eligible employees
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tenant: <code>{tenantId || '—'}</code> — set{' '}
        <code>VITE_TENANT_ID</code> or{' '}
        <code>localStorage.planning_monefica_hr_tenant_id</code>. Auth:{' '}
        <code>localStorage.planning_monefica_access_token</code> (Bearer).
      </Typography>
      {listError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load eligibility (check token, tenant, and API).
        </Alert>
      )}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" onClick={onOpenAdd}>
          Add eligible employee
        </Button>
      </Box>
      <TableContainer
        component={Paper}
        elevation={1}
        sx={{
          maxHeight: '70vh',
          overflow: 'auto',
          minWidth: PLANNING_WEB_UX.table.minWidthWide,
        }}
      >
        <Table stickyHeader size="small" aria-label="Eligible employees">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  minWidth: PLANNING_WEB_UX.table.stickyPrimaryColumnMinWidth,
                  boxShadow: 1,
                }}
              >
                Email
              </TableCell>
              <TableCell sx={{ minWidth: PLANNING_WEB_UX.table.colStatusMinWidth }}>
                Status
              </TableCell>
              <TableCell sx={{ minWidth: PLANNING_WEB_UX.table.colLastUpdatedMinWidth }}>
                Last updated
              </TableCell>
              <TableCell sx={{ minWidth: PLANNING_WEB_UX.table.colUpdatedByMinWidth }}>
                Updated by (sub)
              </TableCell>
              <TableCell align="right" sx={{ minWidth: PLANNING_WEB_UX.table.colActionsMinWidth }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loadingList ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">
                    No eligible employees yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row.userId} hover>
                  <TableCell
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                    }}
                  >
                    {row.email}
                  </TableCell>
                  <TableCell>
                    <BenefitEligibilityStatusChip status="eligible" />
                  </TableCell>
                  <TableCell>
                    {format(new Date(row.updatedAt), 'PPp')}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap title={row.updatedBySub}>
                      {row.updatedBySub}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => onRequestRemove(row)}
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <PlanningDialog
        open={addOpen}
        onClose={onCloseAdd}
        fullWidth
        maxWidth="sm"
        aria-labelledby="eligibility-add-title"
      >
        <DialogTitle id="eligibility-add-title">Add eligibility</DialogTitle>
        <DialogContent>
          {loadingCollaborators ? (
            <CircularProgress size={28} />
          ) : (
            <Autocomplete
              options={collaboratorOptions}
              value={selectedCollaborator}
              onChange={(_e, v) => onSelectCollaborator(v)}
              getOptionLabel={(o) => `${o.email} (${o.userId})`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Collaborator"
                  margin="normal"
                  fullWidth
                />
              )}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCloseAdd}>Cancel</Button>
          <Button
            variant="contained"
            onClick={onConfirmAdd}
            disabled={!selectedCollaborator || adding}
          >
            {adding ? 'Saving…' : 'Confirm add'}
          </Button>
        </DialogActions>
      </PlanningDialog>

      <PlanningDialog
        open={removePhase === 'warn'}
        onClose={onRemoveCancel}
        fullWidth
        maxWidth="sm"
        aria-labelledby="eligibility-remove-warn-title"
      >
        <DialogTitle id="eligibility-remove-warn-title">Remove eligibility?</DialogTitle>
        <DialogContent>
          <Typography>
            You are starting removal of benefit access for{' '}
            <strong>{pendingEmail}</strong>. Continue only if this is intended.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRemoveCancel}>Cancel</Button>
          <Button variant="contained" onClick={onRemoveContinue}>
            Continue
          </Button>
        </DialogActions>
      </PlanningDialog>

      <PlanningDialog
        open={removePhase === 'final'}
        onClose={onRemoveCancel}
        fullWidth
        maxWidth="sm"
        aria-labelledby="eligibility-remove-final-title"
      >
        <DialogTitle id="eligibility-remove-final-title">Confirm removal</DialogTitle>
        <DialogContent>
          <Typography>
            Remove sponsored benefit access for <strong>{pendingEmail}</strong>
            ? This updates the server immediately after you confirm.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onRemoveBack}>Back</Button>
          <Button onClick={onRemoveCancel}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={onRemoveConfirm}
            disabled={removing}
          >
            {removing ? 'Removing…' : 'Remove access'}
          </Button>
        </DialogActions>
      </PlanningDialog>
    </Box>
  );
}
