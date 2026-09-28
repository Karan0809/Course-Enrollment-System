'use client';

import Link from 'next/link';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../lib/api/errorMessage';
import { useGetAdminDashboardSummaryQuery } from '../../store/api';

function Dashboard() {
  const { data, error, isLoading, refetch } = useGetAdminDashboardSummaryQuery();
  if (isLoading) return <LoadingState label="Loading dashboard" />;
  if (error || !data) return <ErrorState message={getApiErrorMessage(error)} onRetry={() => void refetch()} />;
  const cards = [['Teachers', data.teachers], ['Students', data.students], ['Courses', data.courses], ['Enrollments', data.enrollments]] as const;
  return <section className="page-intro"><span className="eyebrow">Administrator</span><h1>Dashboard</h1><p className="text-sm text-slate-600">Current totals from the course enrollment database.</p><div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, count]) => <article className="rounded border border-slate-200 bg-white p-6" key={label}><p className="text-sm text-slate-500">Total {label.toLowerCase()}</p><p className="mt-2 text-4xl font-semibold text-emerald-950">{count}</p></article>)}</div><Link className="button button-primary mt-8" href="/admin/users">Manage users</Link></section>;
}

export default function AdminPage() { return <ProtectedRoute roles={['admin']}><Dashboard /></ProtectedRoute>; }
