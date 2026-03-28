import { Alert, Box, Button, CircularProgress, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { HealthResponseDto } from '@planning-monefica/shared-types';
import { fetchHealth } from '../services/api';

export function HomePage() {
  const [health, setHealth] = useState<HealthResponseDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then((data) => {
        if (!cancelled) {
          setHealth(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Could not reach API. Is the server running on port 5555?');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        HR Admin
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Example navigation using React Router{' '}
        <Button component={Link} to="/" variant="outlined" size="small">
          Home
        </Button>
      </Typography>
      {loading && <CircularProgress size={24} />}
      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
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
