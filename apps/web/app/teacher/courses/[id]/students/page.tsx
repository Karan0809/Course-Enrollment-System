'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProtectedRoute } from '../../../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../../../components/ui/EmptyState';
import { ErrorState } from '../../../../../components/ui/ErrorState';
import { LoadingState } from '../../../../../components/ui/LoadingState';
import { getApiErrorMessage } from '../../../../../lib/api/errorMessage';
import { useGetCourseQuery, useGetTeacherCourseStudentsQuery } from '../../../../../store/api';

function EnrolledStudents() {
  const { id } = useParams<{ id: string }>();
  const course = useGetCourseQuery(id);
  const students = useGetTeacherCourseStudentsQuery(id);
  if (course.isLoading || students.isLoading) return <LoadingState label="Loading enrolled students" />;
  if (course.error || !course.data) return <ErrorState title="Unable to load course" message={getApiErrorMessage(course.error)} onRetry={() => void course.refetch()} />;
  if (students.error) return <ErrorState title="Unable to load enrolled students" message={getApiErrorMessage(students.error)} onRetry={() => void students.refetch()} />;
  return <section className="page-intro max-w-none"><Link className="text-link" href={`/teacher/courses/${id}`}>← {course.data.title}</Link><span className="eyebrow mt-6">Teaching</span><h1>Enrolled students</h1>
    {!students.data?.length ? <EmptyState title="No students enrolled" description="Students who enroll in this course will appear here." /> : <div className="mt-6 overflow-x-auto rounded border border-slate-200 bg-white"><table className="w-full min-w-[650px] border-collapse text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Student', 'Email', 'Status', 'Enrolled'].map((label) => <th className="px-4 py-3 font-medium" key={label}>{label}</th>)}</tr></thead><tbody>{students.data.map((item) => <tr className="border-t border-slate-100" key={item.enrollmentId}><td className="px-4 py-3">{item.student.name}</td><td className="px-4 py-3">{item.student.email}</td><td className="px-4 py-3 capitalize">{item.status}</td><td className="px-4 py-3">{new Date(item.enrolledAt).toLocaleDateString()}</td></tr>)}</tbody></table></div>}
  </section>;
}

export default function TeacherCourseStudentsPage() { return <ProtectedRoute roles={['teacher']}><EnrolledStudents /></ProtectedRoute>; }
