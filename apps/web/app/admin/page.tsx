import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { EmptyState } from '../../components/ui/EmptyState';

export default function AdminDestinationPage() {
  return (
    <ProtectedRoute roles={['admin']}>
      <section className="page-intro">
        <span className="eyebrow">Administrator</span>
        <h1>Administration workspace</h1>
        <EmptyState title="Workspace foundation" description="Administrative tools will be introduced in a later module." />
      </section>
    </ProtectedRoute>
  );
}