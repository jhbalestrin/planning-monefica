import { createTheme } from '@mui/material';
import { PLANNING_WEB_UX } from '@planning-monefica/shared-types';

/** UX-DR9 — primary text on contained buttons vs white label. */
const primaryMain = '#1565c0';

const reducedMotionCssBaseline = {
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
    },
  },
};

export function createHrAdminTheme() {
  return createTheme({
    spacing: PLANNING_WEB_UX.spacingUnitPx,
    shape: { borderRadius: PLANNING_WEB_UX.radiusMdPx },
    palette: {
      primary: { main: primaryMain },
      secondary: { main: '#6d4c41' },
    },
    typography: {
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      h4: { fontWeight: 700, fontSize: '1.75rem' },
      h6: { fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: reducedMotionCssBaseline,
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: PLANNING_WEB_UX.radiusSmPx,
          },
        },
      },
    },
  });
}
