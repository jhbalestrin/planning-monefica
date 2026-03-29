import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import type { HealthResponseDto } from '@planning-monefica/shared-types';

export type HomeViewProps = {
  loading: boolean;
  errorMessage: string | null;
  health: HealthResponseDto | null;
};

export function HomeView({ loading, errorMessage, health }: HomeViewProps) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Control Pane
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Example navigation using React Router{' '}
        <Button component={Link} to="/" variant="outlined" size="small">
          Home
        </Button>{' '}
        <Button component={Link} to="/scheduling" variant="outlined" size="small">
          Scheduling
        </Button>{' '}
        <Button component={Link} to="/scheduling/queue" variant="outlined" size="small">
          Fila
        </Button>
      </Typography>
      {loading && <CircularProgress size={24} />}
      {errorMessage && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {errorMessage}
        </Alert>
      )}
      {health && (
        <Alert severity="success" sx={{ mt: 2 }}>
          API: {health.status} at {health.timestamp}
        </Alert>
      )}
    </Box>
  );
}
