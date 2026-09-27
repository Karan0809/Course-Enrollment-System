'use client';

import { useRouter } from 'next/navigation';
import { clearClientSession } from '../../lib/auth/logout';
import { useAppDispatch } from '../../store/hooks';

export function LogoutButton() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  function handleLogout() {
    clearClientSession(dispatch);
    router.replace('/login');
  }

  return <button className="button button-quiet" onClick={handleLogout} type="button">Sign out</button>;
}