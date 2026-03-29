import { createTheme } from '@mui/material';
import { PLANNING_WEB_UX } from '@planning-monefica/shared-types';

const primaryMain = '#1a5f4a';
const secondaryMain = '#c45c26';

const reducedMotionCssBaseline = {
  '@media (prefers-reduced-motion: reduce)': {
    '*, *::before, *::after': {
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      transitionDuration: '0.01ms !important',
    },
  },
};

export function createControlPaneTheme() {
  return createTheme({
    spacing: PLANNING_WEB_UX.spacingUnitPx,
    shape: { borderRadius: PLANNING_WEB_UX.radiusMdPx },
    palette: {
      primary: { main: primaryMain },
      secondary: { main: secondaryMain },
      background: { default: '#f4f6f4', paper: '#ffffff' },
    },
    typography: {
      fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
      h4: { fontWeight: 700 },
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
