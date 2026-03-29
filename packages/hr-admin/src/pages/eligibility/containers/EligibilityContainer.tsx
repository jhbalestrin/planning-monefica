import { Alert, Box } from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import type {
  EligibilityCollaboratorOptionDto,
  EligibilityListItemDto,
} from '@planning-monefica/shared-types';
import { resolveHrTenantId } from '../../../lib/hrTenantId';
import {
  useGetCollaboratorsForEligibilityQuery,
  useGetEligibilityListQuery,
  useMarkEligibleMutation,
  useRemoveEligibleMutation,
} from '../api/eligibilityApi';
import { EligibilityListView } from '../components/EligibilityListView';

export function EligibilityContainer() {
  const tenantId = useMemo(() => resolveHrTenantId(), []);
  const skip = !tenantId;

  const {
    data: rows = [],
    isLoading: loadingList,
    isError: listError,
  } = useGetEligibilityListQuery(tenantId, { skip });

  const [addOpen, setAddOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] =
    useState<EligibilityCollaboratorOptionDto | null>(null);

  const {
    data: collaboratorOptions = [],
    isLoading: loadingCollaborators,
  } = useGetCollaboratorsForEligibilityQuery(
    { tenantId, excludeEligible: true },
    { skip: skip || !addOpen },
  );

  const [markEligible, { isLoading: adding }] = useMarkEligibleMutation();
  const [removeEligible, { isLoading: removing }] =
    useRemoveEligibleMutation();

  const [removePhase, setRemovePhase] = useState<null | 'warn' | 'final'>(
    null,
  );
  const [pendingRemove, setPendingRemove] =
    useState<EligibilityListItemDto | null>(null);

  const onRequestRemove = useCallback((row: EligibilityListItemDto) => {
    setPendingRemove(row);
    setRemovePhase('warn');
  }, []);

  const onRemoveContinue = useCallback(() => {
    setRemovePhase('final');
  }, []);

  const onRemoveBack = useCallback(() => {
    setRemovePhase('warn');
  }, []);

  const onRemoveCancel = useCallback(() => {
    setRemovePhase(null);
    setPendingRemove(null);
  }, []);

  const onRemoveConfirm = useCallback(async () => {
    if (!pendingRemove || !tenantId) return;
    try {
      await removeEligible({
        tenantId,
        userId: pendingRemove.userId,
      }).unwrap();
      onRemoveCancel();
    } catch {
      /* RTK sets error; keep dialog open */
    }
  }, [pendingRemove, tenantId, removeEligible, onRemoveCancel]);

  const onOpenAdd = useCallback(() => {
    setSelectedCollaborator(null);
    setAddOpen(true);
  }, []);

  const onCloseAdd = useCallback(() => {
    setAddOpen(false);
    setSelectedCollaborator(null);
  }, []);

  const onConfirmAdd = useCallback(async () => {
    if (!selectedCollaborator || !tenantId) return;
    try {
      await markEligible({
        tenantId,
        body: { userId: selectedCollaborator.userId },
      }).unwrap();
      onCloseAdd();
    } catch {
      /* surface via RTK */
    }
  }, [selectedCollaborator, tenantId, markEligible, onCloseAdd]);

  if (!tenantId) {
    return (
      <Box sx={{ p: 3, maxWidth: 720 }}>
        <Alert severity="warning">
          Set <code>VITE_TENANT_ID</code> in <code>.env</code> or{' '}
          <code>localStorage.setItem(&apos;planning_monefica_hr_tenant_id&apos;, &apos;&lt;ObjectId&gt;&apos;)</code>{' '}
          to load this page.
        </Alert>
      </Box>
    );
  }

  return (
    <EligibilityListView
      tenantId={tenantId}
      rows={rows}
      loadingList={loadingList}
      listError={listError}
      addOpen={addOpen}
      onOpenAdd={onOpenAdd}
      onCloseAdd={onCloseAdd}
      collaboratorOptions={collaboratorOptions}
      loadingCollaborators={loadingCollaborators}
      selectedCollaborator={selectedCollaborator}
      onSelectCollaborator={setSelectedCollaborator}
      onConfirmAdd={onConfirmAdd}
      adding={adding}
      removePhase={removePhase}
      pendingEmail={pendingRemove?.email ?? ''}
      onRequestRemove={onRequestRemove}
      onRemoveContinue={onRemoveContinue}
      onRemoveBack={onRemoveBack}
      onRemoveCancel={onRemoveCancel}
      onRemoveConfirm={onRemoveConfirm}
      removing={removing}
    />
  );
}
