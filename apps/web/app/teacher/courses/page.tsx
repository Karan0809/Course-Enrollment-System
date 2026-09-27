import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { EmptyState } from '../../../components/ui/EmptyState';

export default function TeacherCoursesDestinationPage() {
  return (
    <ProtectedRoute roles={['teacher']}>
      <section className="page-intro">
        <span className="eyebrow">Teaching</span>
        <h1>Course workspace</h1>
        <EmptyState title="Workspace foundation" description="Teacher course tools will be introduced in a later module." />
      </section>
    </ProtectedRoute>
  );
}