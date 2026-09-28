'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useDeleteCourseMutation, useListAdminCoursesQuery, useListAdminUsersQuery, useUpdateCourseMutation } from '../../../store/api';
import type { CourseSummary } from '../../../types/api';

function AdminCourses() {
  const courses = useListAdminCoursesQuery();
  const teachers = useListAdminUsersQuery({ role: 'teacher' });
  const [update, updateState] = useUpdateCourseMutation();
  const [deleteCourse, deleteState] = useDeleteCourseMutation();
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const busy = updateState.isLoading || deleteState.isLoading;
  const lifecycle = async (course: CourseSummary, status: 'published' | 'archived') => {
    setNotice(''); setActionError('');
    try { await update({ id: course._id, body: { status } }).unwrap(); setNotice(`“${course.title}” ${status}.`); }
    catch (error) { setActionError(getApiErrorMessage(error)); }
  };
  const remove = async (course: CourseSummary) => {
    if (!window.confirm(`Permanently delete “${course.title}”? This removes the course record.`)) return;
    setNotice(''); setActionError('');
    try { await deleteCourse(course._id).unwrap(); setNotice(`“${course.title}” was deleted.`); }
    catch (error) { setActionError(getApiErrorMessage(error)); }
  };
  return <section className="page-intro max-w-none"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="eyebrow">Administration</span><h1>Courses</h1></div><Link className="button button-primary" href="/admin/courses/new">Create course</Link></div>
    {notice ? <p className="mt-4 text-sm text-emerald-800" role="status">{notice}</p> : null}{actionError ? <p className="mt-4 text-sm text-red-700" role="alert">{actionError}</p> : null}
    {courses.isLoading || teachers.isLoading ? <LoadingState label="Loading courses" /> : courses.error ? <ErrorState message={getApiErrorMessage(courses.error)} onRetry={() => void courses.refetch()} /> : teachers.error ? <ErrorState message={getApiErrorMessage(teachers.error)} onRetry={() => void teachers.refetch()} /> : !courses.data?.length ? <EmptyState title="No courses yet" description="Create a course and assign it to an active teacher." /> : <div className="mt-6 overflow-x-auto rounded border border-slate-200 bg-white"><table className="w-full min-w-[880px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Title', 'Teacher', 'Level', 'Price', 'Status', 'Active', 'Actions'].map((heading) => <th className="px-4 py-3 font-medium" key={heading}>{heading}</th>)}</tr></thead><tbody>{courses.data.map((course) => { const teacher = teachers.data?.find((user) => user._id === course.teacherId); return <tr className="border-t border-slate-100" key={course._id}><td className="px-4 py-3 font-medium">{course.title}</td><td className="px-4 py-3">{teacher?.name ?? 'Unknown teacher'}</td><td className="px-4 py-3 capitalize">{course.level}</td><td className="px-4 py-3">{course.isFree ? 'Free' : course.price}</td><td className="px-4 py-3 capitalize">{course.status}</td><td className="px-4 py-3">{course.isActive ? 'Active' : 'Inactive'}</td><td className="px-4 py-3"><div className="flex flex-wrap items-center gap-3"><Link className="text-link" href={`/admin/courses/${course._id}/edit`}>Edit</Link>{course.status !== 'published' ? <button className="text-link" disabled={busy} onClick={() => void lifecycle(course, 'published')} type="button">Publish</button> : null}{course.status !== 'archived' ? <button className="text-link" disabled={busy} onClick={() => void lifecycle(course, 'archived')} type="button">Archive</button> : null}<button className="text-sm text-red-700 underline" disabled={busy} onClick={() => void remove(course)} type="button">{busy ? 'Working…' : 'Delete'}</button></div></td></tr>; })}</tbody></table></div>}
  </section>;
}
export default function AdminCoursesPage() { return <ProtectedRoute roles={['admin']}><AdminCourses /></ProtectedRoute>; }
