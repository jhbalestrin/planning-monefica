import { ThemeProvider } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createControlPaneTheme } from '../theme/appTheme';
import { PlanningDialog } from './PlanningDialog';

const theme = createControlPaneTheme();

describe('PlanningDialog', () => {
  it('renders dialog with labelled title (UX-DR10)', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlanningDialog open onClose={vi.fn()} aria-labelledby="cp-dlg-title">
          <DialogTitle id="cp-dlg-title">Encerrar</DialogTitle>
        </PlanningDialog>
      </ThemeProvider>,
    );
    expect(screen.getByRole('dialog', { name: 'Encerrar' })).toBeInTheDocument();
  });
});
