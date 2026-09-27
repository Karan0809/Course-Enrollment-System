export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="state-message" role="status" aria-live="polite">
      <span className="loading-mark" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}