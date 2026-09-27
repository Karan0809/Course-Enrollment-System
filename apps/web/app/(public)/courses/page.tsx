import { EmptyState } from '../../../components/ui/EmptyState';

export default function CoursesPage() {
  return (
    <section className="page-intro">
      <span className="eyebrow">Course catalogue</span>
      <h1>Find your next subject.</h1>
      <EmptyState title="The catalogue is being prepared" description="Course browsing will be available in a later module." />
    </section>
  );
}