export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <section className="empty-state" aria-label={title}>
      <span className="empty-state-mark" aria-hidden="true">+</span>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </section>
  );
}