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
  actionText,
  className = "",
}) => {
  const is401 = statusCode === 401;
  const is403 = statusCode === 403;
  const is404 = statusCode === 404;

  const defaultTitle = is401
    ? "Authentication Required"
    : is403
    ? "Premium Access Required"
    : is404
    ? "Component Not Found"
    : "Something Went Wrong";

  const defaultMessage = is401
    ? "Please sign in to your customer account to view this component."
    : is403
    ? "This component requires an active premium developer membership."
    : is404
    ? "The requested component does not exist in the public catalogue or has not been published yet."
    : "An error occurred while loading content from the backend service.";

  return (
    <div
      className={`rounded-lg border border-red-500/30 bg-red-950/15 p-8 text-center max-w-md mx-auto ${className}`}
      role="alert"
    >
      <div className="mx-auto w-10 h-10 rounded-md bg-red-900/30 flex items-center justify-center text-red-300 mb-3 border border-red-500/20">
        {is403 ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
      </div>

      <h3 className="text-sm font-semibold text-zinc-100">
        {title || defaultTitle}
      </h3>
      <p className="mt-1.5 text-xs text-zinc-300 leading-relaxed max-w-sm mx-auto">
        {message || defaultMessage}
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-750 rounded-md border border-zinc-700 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50"
          >
            {actionText || "Try Again"}
          </button>
        )}

        {is401 && (
          <Link
            href="/login"
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-900 bg-blue-200 hover:bg-blue-100 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50"
          >
            Sign In Now
          </Link>
        )}

        {is403 && (
          <Link
            href="/account"
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-100 bg-zinc-800 hover:bg-zinc-750 rounded-md border border-zinc-700 transition-colors focus:outline-none focus:ring-1 focus:ring-blue-200/50"
          >
            Check Account Status
          </Link>
        )}

        <Link
          href="/components"
          className="px-3.5 py-1.5 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors border border-zinc-700/60"
        >
          Browse Components
        </Link>
      </div>
    </div>
  );
};
