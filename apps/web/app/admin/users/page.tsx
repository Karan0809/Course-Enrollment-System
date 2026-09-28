'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useDeactivateAdminUserMutation, useListAdminUsersQuery } from '../../../store/api';

function UsersList() {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const query = useListAdminUsersQuery({ role: role || undefined, isActive: status || undefined });
  const [deactivate, mutation] = useDeactivateAdminUserMutation();
  const deactivateUser = async (id: string, name: string) => {
    if (!window.confirm(`Deactivate ${name}? They will no longer be able to sign in.`)) return;
    try { await deactivate(id).unwrap(); } catch { /* list query reports refreshed API state */ }
  };
  return <section className="page-intro max-w-none"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">Administration</span><h1>Users</h1></div><Link className="button button-primary" href="/admin/users/new">Create user</Link></div>
    <div className="mt-6 flex flex-wrap gap-4"><label className="field m-0">Role<select className="h-11 rounded border border-slate-300 bg-white px-3" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option><option value="teacher">Teacher</option><option value="student">Student</option><option value="admin">Admin</option></select></label><label className="field m-0">Status<select className="h-11 rounded border border-slate-300 bg-white px-3" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="true">Active</option><option value="false">Inactive</option></select></label></div>
    {query.isLoading ? <LoadingState label="Loading users" /> : query.error ? <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} /> : !query.data?.length ? <EmptyState title="No users found" description="No users match the selected filters." /> : <div className="mt-6 overflow-x-auto rounded border border-slate-200 bg-white"><table className="w-full min-w-[680px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => <th className="px-4 py-3 font-medium" key={h}>{h}</th>)}</tr></thead><tbody>{query.data.map((user) => <tr className="border-t border-slate-100" key={user._id}><td className="px-4 py-3">{user.name}</td><td className="px-4 py-3">{user.email}</td><td className="px-4 py-3 capitalize">{user.role}</td><td className="px-4 py-3">{user.isActive ? 'Active' : 'Inactive'}</td><td className="px-4 py-3"><div className="flex items-center gap-3"><Link className="text-link" href={`/admin/users/${user._id}/edit`}>Edit</Link>{user.isActive ? <button className="text-sm text-red-700 underline" disabled={mutation.isLoading} onClick={() => void deactivateUser(user._id, user.name)} type="button">{mutation.isLoading ? 'Working…' : 'Deactivate'}</button> : null}</div></td></tr>)}</tbody></table>{mutation.error ? <p className="p-3 text-sm text-red-700" role="alert">{getApiErrorMessage(mutation.error)}</p> : null}</div>}
  </section>;
}
export default function AdminUsersPage() { return <ProtectedRoute roles={['admin']}><UsersList /></ProtectedRoute>; }
