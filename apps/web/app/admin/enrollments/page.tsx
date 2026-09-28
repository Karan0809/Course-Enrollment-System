'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useGetAdminEnrollmentsQuery } from '../../../store/api';

function AdminEnrollments() {
  const query = useGetAdminEnrollmentsQuery();
  if (query.isLoading) return <LoadingState label="Loading enrollments" />;
  if (query.error) return <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  return <section className="page-intro max-w-none"><span className="eyebrow">Administration</span><h1>Enrollments</h1>
    {!query.data?.length ? <EmptyState title="No enrollments yet" description="Student course enrollments will appear here." /> :
      <div className="mt-6 overflow-x-auto rounded border border-slate-200 bg-white"><table className="w-full min-w-[900px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Student', 'Course', 'Teacher', 'Status', 'Enrolled'].map((label) => <th className="px-4 py-3 font-medium" key={label}>{label}</th>)}</tr></thead><tbody>{query.data.map((item) => <tr className="border-t border-slate-100" key={item.id}><td className="px-4 py-3">{item.student?.name ?? 'Unavailable'}<div className="text-xs text-slate-500">{item.student?.email ?? ''}</div></td><td className="px-4 py-3">{item.course?.title ?? 'Unavailable'}</td><td className="px-4 py-3">{item.course?.teacher?.name ?? 'Unavailable'}<div className="text-xs text-slate-500">{item.course?.teacher?.email ?? ''}</div></td><td className="px-4 py-3 capitalize">{item.status}</td><td className="px-4 py-3">{new Date(item.enrolledAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
  </section>;
}

export default function AdminEnrollmentsPage() { return <ProtectedRoute roles={['admin']}><AdminEnrollments /></ProtectedRoute>; }
