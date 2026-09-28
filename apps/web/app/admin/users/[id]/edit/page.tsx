'use client';

import { useParams } from 'next/navigation';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { ErrorState } from '../../../../../components/ui/ErrorState';
import { LoadingState } from '../../../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../../../lib/api/errorMessage';
import { useGetAdminUserQuery } from '../../../../../store/api';
import { UserForm } from '../../UserForm';

function EditUser() {
  const params = useParams<{ id: string }>();
  const query = useGetAdminUserQuery(params.id);
  if (query.isLoading) return <LoadingState label="Loading user" />;
  if (query.error || !query.data) return <ErrorState title="Unable to load user" message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return <section className="page-intro"><span className="eyebrow">Administration</span><h1>Edit user</h1><UserForm user={query.data} /></section>;
}
export default function EditAdminUserPage() { return <ProtectedRoute roles={['admin']}><EditUser /></ProtectedRoute>; }
