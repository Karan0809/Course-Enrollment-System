'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@course-enrollment-system/contracts';
import { getApiErrorMessage } from '../../lib/api/errorMessage';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { apiSlice } from '../../store/api';
import { restoreToken, setHydrationError } from '../../store/slices/authSlice';
import { LoadingState } from '../ui/LoadingState';
import { ErrorState } from '../ui/ErrorState';
import { UnauthorizedState } from '../ui/UnauthorizedState';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, token, user, hydrationError } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [router, status]);

  if (status === 'unknown') {
    if (hydrationError && token) {
      return (
        <ErrorState
          title="Session could not be verified"
          message={hydrationError}
          onRetry={() => {
            dispatch(restoreToken(token));
            dispatch(apiSlice.endpoints.getCurrentUser.initiate(undefined, { forceRefetch: true }))
              .unwrap()
              .catch((error: unknown) => dispatch(setHydrationError(getApiErrorMessage(error))));
          }}
        />
      );
    }

    return <LoadingState label="Checking your session" />;
  }

  if (status === 'unauthenticated') return <LoadingState label="Taking you to sign in" />;
  if (roles && user && !roles.includes(user.role)) return <UnauthorizedState />;
  if (roles && !user) return <LoadingState label="Loading your account" />;

  return <>{children}</>;
}