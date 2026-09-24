import React from "react";
import Link from "next/link";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
  actionText?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  message,
  statusCode,
  onRetry,
  actionText = "Try Again",
  className = "",
}) => {
  const is401 = statusCode === 401;
  const is403 = statusCode === 403;
  const is404 = statusCode === 404;

  const defaultTitle = is401
    ? "Session Expired"
    : is403
    ? "Administrator Access Required"
    : is404
    ? "Record Not Found"
    : "Operation Failed";

  const defaultMessage = is401
    ? "Your administrator session has expired. Please sign in again."
    : is403
    ? "This administrative feature requires verified admin role permissions."
    : is404
    ? "The requested component or customer record could not be found."
    : "An error occurred while communicating with the backend API.";

  return (
    <div
      className={`rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 p-8 text-center max-w-lg mx-auto ${className}`}
      role="alert"
    >
      <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-4">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h3 className="text-base font-bold text-slate-900 dark:text-white">
        {title || defaultTitle}
      </h3>
      <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
        {message || defaultMessage}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white"
          >
            {actionText}
          </button>
        )}

        {is401 && (
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
          >
            Sign In Again
          </Link>
        )}

        <Link
          href="/dashboard"
          className="px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};
