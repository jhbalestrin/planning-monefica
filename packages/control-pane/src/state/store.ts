import { configureStore } from '@reduxjs/toolkit';
import { healthApi } from '../pages/home/api/healthApi';
import { schedulingApi } from '../pages/scheduling/api/schedulingApi';
import { schedulingQueueApi } from '../pages/scheduling-queue/api/schedulingQueueApi';

export const store = configureStore({
  reducer: {
    [healthApi.reducerPath]: healthApi.reducer,
    [schedulingApi.reducerPath]: schedulingApi.reducer,
    [schedulingQueueApi.reducerPath]: schedulingQueueApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      healthApi.middleware,
      schedulingApi.middleware,
      schedulingQueueApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
