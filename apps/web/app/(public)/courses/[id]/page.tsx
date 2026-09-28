'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../../lib/api/errorMessage';
import { useEnrollInCourseMutation, useGetCourseQuery, useGetMyEnrollmentsQuery } from '../../../../store/api';
import { useAppSelector } from '../../../../store/hooks';

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const courseId = params.id;
  const courseQuery = useGetCourseQuery(courseId);
  const user = useAppSelector((state) => state.auth.user);
  const isStudent = user?.role === 'student';
  const enrollments = useGetMyEnrollmentsQuery(undefined, { skip: !isStudent });
  const [enroll, enrollState] = useEnrollInCourseMutation();
  const [success, setSuccess] = useState('');
  const [enrollError, setEnrollError] = useState('');

  if (courseQuery.isLoading) return <LoadingState label="Loading course details" />;
  if (courseQuery.error || !courseQuery.data) return <ErrorState title="Course unavailable" message={getApiErrorMessage(courseQuery.error)} onRetry={() => void courseQuery.refetch()} />;
  const course = courseQuery.data;
  const alreadyEnrolled = enrollments.data?.some((item) => item.courseId === courseId && item.status === 'active') ?? false;
  const handleEnroll = async () => {
    setSuccess(''); setEnrollError('');
    try {
      await enroll(courseId).unwrap();
      setSuccess('You are enrolled in this course.');
    } catch (error) { setEnrollError(getApiErrorMessage(error)); }
  };

  return <article className="page-intro"><Link className="text-link" href="/courses">← Course catalogue</Link><header className="mt-6"><span className="eyebrow capitalize">{course.level} · {course.duration} hours</span><h1>{course.title}</h1><p className="max-w-3xl whitespace-pre-line text-base leading-7 text-slate-600">{course.description}</p></header><div className="mt-6 flex flex-wrap items-center gap-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-sm capitalize">{course.status}</span><span className="text-sm">{course.isFree ? 'Free' : course.price}</span></div>
    {isStudent ? <div className="mt-8">{enrollments.isLoading ? <LoadingState label="Checking your enrollment" /> : alreadyEnrolled ? <div className="flex flex-wrap items-center gap-4"><p className="text-sm text-emerald-800" role="status">You are already enrolled in this course.</p><Link className="button button-secondary" href="/student/my-courses">My courses</Link></div> : <button className="button button-primary" disabled={enrollState.isLoading || enrollments.isError} onClick={() => void handleEnroll()} type="button">{enrollState.isLoading ? 'Enrolling…' : 'Enroll'}</button>}{success ? <p className="mt-3 text-sm text-emerald-800" role="status">{success}</p> : null}{enrollError ? <p className="form-error" role="alert">{enrollError}</p> : null}{enrollments.isError ? <p className="form-error" role="alert">{getApiErrorMessage(enrollments.error)}</p> : null}</div> : user ? null : <p className="mt-8 text-sm text-slate-600">Sign in as a student to enroll. <Link className="text-link" href="/login">Sign in</Link></p>}
  </article>;
}
