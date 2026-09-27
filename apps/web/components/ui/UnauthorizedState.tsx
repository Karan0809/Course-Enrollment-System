export function UnauthorizedState({ message = 'You do not have permission to view this resource.' }: { message?: string }) {
  return (
    <section className="unauthorized-state" role="alert">
      <span className="eyebrow">Access restricted</span>
      <h1>Not authorized</h1>
      <p>{message}</p>
    </section>
  );
}