import { ThemeProvider, createTheme } from '@mui/material';
import DialogTitle from '@mui/material/DialogTitle';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PlanningDialog } from './PlanningDialog';

const theme = createTheme();

describe('PlanningDialog', () => {
  it('renders dialog with labelled title (UX-DR10)', () => {
    render(
      <ThemeProvider theme={theme}>
        <PlanningDialog open onClose={vi.fn()} aria-labelledby="planning-dlg-title">
          <DialogTitle id="planning-dlg-title">Test</DialogTitle>
        </PlanningDialog>
      </ThemeProvider>,
    );
    expect(screen.getByRole('dialog', { name: 'Test' })).toBeInTheDocument();
  });
});
