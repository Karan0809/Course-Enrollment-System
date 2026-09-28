import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function StudentMyCoursesPage() {
  return (
    <ProtectedRoute roles={['student']}>
      <section className="page-intro">
        <span className="eyebrow">Student dashboard</span>
        <h1>My courses</h1>
        <EmptyState
          title="Your courses are loading"
          description="This area will show your active course enrollments in a later module."
        />
      </section>
    </ProtectedRoute>
  );
}
