'use client';

import Link from 'next/link';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ErrorState } from '../../../components/ui/ErrorState';
import { LoadingState } from '../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../lib/api/errorMessage';
import { useGetMyEnrollmentsQuery } from '../../../store/api';

function MyCourses() {
  const query = useGetMyEnrollmentsQuery();
  if (query.isLoading) return <LoadingState label="Loading your courses" />;
  if (query.error) return <ErrorState message={getApiErrorMessage(query.error)} onRetry={() => void query.refetch()} />;
  if (!query.data?.length) return <section className="page-intro"><span className="eyebrow">Student dashboard</span><h1>My courses</h1><EmptyState title="You have not enrolled in any courses yet" description="Browse the catalogue to find a course you would like to take." /><Link className="button button-primary mt-5" href="/courses">Browse courses</Link></section>;
  return <section className="page-intro max-w-none"><span className="eyebrow">Student dashboard</span><h1>My courses</h1><div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2">{query.data.map((enrollment) => <article className="rounded border border-slate-200 bg-white p-6" key={enrollment.id}><div className="flex flex-wrap items-start justify-between gap-3"><h2 className="font-serif text-2xl text-emerald-950">{enrollment.course?.title ?? 'Course unavailable'}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs capitalize">{enrollment.status}</span></div>{enrollment.course ? <><p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{enrollment.course.description}</p><dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Level</dt><dd className="mt-1 capitalize">{enrollment.course.level}</dd></div><div><dt className="text-slate-500">Duration</dt><dd className="mt-1">{enrollment.course.duration} hours</dd></div><div><dt className="text-slate-500">Price</dt><dd className="mt-1">{enrollment.course.isFree ? 'Free' : enrollment.course.price}</dd></div><div><dt className="text-slate-500">Enrolled</dt><dd className="mt-1">{new Date(enrollment.enrolledAt).toLocaleDateString()}</dd></div></dl><Link className="button button-secondary mt-5" href={`/courses/${enrollment.course.id}`}>View course</Link></> : <p className="mt-3 text-sm text-slate-600">This course record is no longer available.</p>}</article>)}</div></section>;
}
export default function StudentMyCoursesPage() { return <ProtectedRoute roles={['student']}><MyCourses /></ProtectedRoute>; }
