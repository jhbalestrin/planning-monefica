import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EligibilityListView } from './EligibilityListView';

const noop = () => {};

describe('EligibilityListView', () => {
  it('renders heading and table structure', () => {
    render(
      <EligibilityListView
        tenantId="507f1f77bcf86cd799439011"
        rows={[
          {
            userId: '507f1f77bcf86cd799439012',
            email: 'a@example.com',
            updatedAt: '2026-03-29T12:00:00.000Z',
            updatedBySub: 'hr-sub',
          },
        ]}
        loadingList={false}
        listError={false}
        addOpen={false}
        onOpenAdd={noop}
        onCloseAdd={noop}
        collaboratorOptions={[]}
        loadingCollaborators={false}
        selectedCollaborator={null}
        onSelectCollaborator={noop}
        onConfirmAdd={noop}
        adding={false}
        removePhase={null}
        pendingEmail=""
        onRequestRemove={noop}
        onRemoveContinue={noop}
        onRemoveBack={noop}
        onRemoveCancel={noop}
        onRemoveConfirm={noop}
        removing={false}
      />,
    );

    expect(screen.getByRole('heading', { name: /eligible employees/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('a@example.com')).toBeInTheDocument();
    expect(screen.getByText('Eligible')).toBeInTheDocument();
  });

  it('opens first-step remove dialog', () => {
    const onRequestRemove = vi.fn();
    render(
      <EligibilityListView
        tenantId="t1"
        rows={[
          {
            userId: 'u1',
            email: 'b@example.com',
            updatedAt: '2026-03-29T12:00:00.000Z',
            updatedBySub: 'x',
          },
        ]}
        loadingList={false}
        listError={false}
        addOpen={false}
        onOpenAdd={noop}
        onCloseAdd={noop}
        collaboratorOptions={[]}
        loadingCollaborators={false}
        selectedCollaborator={null}
        onSelectCollaborator={noop}
        onConfirmAdd={noop}
        adding={false}
        removePhase="warn"
        pendingEmail="b@example.com"
        onRequestRemove={onRequestRemove}
        onRemoveContinue={noop}
        onRemoveBack={noop}
        onRemoveCancel={noop}
        onRemoveConfirm={noop}
        removing={false}
      />,
    );

    expect(screen.getByRole('heading', { name: /remove eligibility/i })).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /remove eligibility/i })).toBeInTheDocument();
  });
});
