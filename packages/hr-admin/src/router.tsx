import { createBrowserRouter } from 'react-router-dom';
import { EligibilityPage } from './pages/eligibility/EligibilityPage';
import { HomePage } from './pages/home/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/eligibility',
    element: <EligibilityPage />,
  },
]);
