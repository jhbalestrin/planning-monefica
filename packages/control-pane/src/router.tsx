import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from './pages/home/HomePage';
import { SchedulingPage } from './pages/scheduling/SchedulingPage';
import { SchedulingQueuePage } from './pages/scheduling-queue/SchedulingQueuePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/scheduling',
    element: <SchedulingPage />,
  },
  {
    path: '/scheduling/queue',
    element: <SchedulingQueuePage />,
  },
]);
