import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { store } from '../state/store';
import { HomePage } from './HomePage';

vi.mock('../services/api', () => ({
  fetchHealth: vi.fn().mockResolvedValue({
    status: 'ok',
    timestamp: '2026-01-01T00:00:00.000Z',
  }),
}));

describe('HomePage', () => {
  it('renders title', async () => {
    const router = createMemoryRouter([{ path: '/', element: <HomePage /> }], {
      initialEntries: ['/'],
    });
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    expect(screen.getByRole('heading', { name: /HR Admin/i })).toBeInTheDocument();
  });
});
