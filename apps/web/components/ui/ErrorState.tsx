export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <section className="error-state" role="alert">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry ? <button className="button button-secondary" onClick={onRetry} type="button">Try again</button> : null}
    </section>
  );
}