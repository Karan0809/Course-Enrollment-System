'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '../store';
import { apiSlice } from '../store/api';
import { setHydrationError, restoreToken, setUnauthenticated } from '../store/slices/authSlice';
import { getApiErrorMessage } from '../lib/api/errorMessage';
import { readAccessToken } from '../lib/auth/storage';
import { AppShell } from '../components/layout/AppShell';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionHydrator>
        <AppShell>{children}</AppShell>
      </SessionHydrator>
    </Provider>
  );
}

function SessionHydrator({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const token = readAccessToken();
    if (!token) {
      store.dispatch(setUnauthenticated());
      return;
    }

    store.dispatch(restoreToken(token));
    store.dispatch(
      apiSlice.endpoints.getCurrentUser.initiate(undefined, { forceRefetch: true }),
    ).unwrap().catch((error: unknown) => {
      const status = typeof error === 'object' && error !== null && 'status' in error
        ? error.status
        : undefined;
      if (status !== 401) store.dispatch(setHydrationError(getApiErrorMessage(error)));
    });
  }, []);

  return children;
}
