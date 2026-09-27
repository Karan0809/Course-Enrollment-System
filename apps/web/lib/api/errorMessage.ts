type ApiErrorPayload = {
  status?: number | string;
  data?: { message?: unknown };
  error?: string;
};

const fallbackMessages: Record<number, string> = {
  400: 'Please check the submitted fields.',
  401: 'Your session has expired. Please log in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'That record already exists.',
  500: 'Something went wrong. Please try again.',
};

export function getApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') return 'Something went wrong. Please try again.';

  const apiError = error as ApiErrorPayload;
  const backendMessage = apiError.data?.message;
  if (typeof backendMessage === 'string' && backendMessage.trim()) return backendMessage;

  const status = typeof apiError.status === 'number' ? apiError.status : Number(apiError.status);
  if (Number.isFinite(status) && fallbackMessages[status]) return fallbackMessages[status];
  if (apiError.error) return 'Unable to reach the server. Check your connection and try again.';
  return 'Something went wrong. Please try again.';
}