import Button from "./Button";
import ErrorAlert from "./ErrorAlert";

/**
 * Base Modal Component
 * Reusable modal wrapper with consistent styling and layout
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  error,
  onErrorDismiss,
  footer,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 opacity-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-200 rounded-md shadow-xl max-w-md w-full">
        {/* Header */}
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-5">
              <ErrorAlert message={error} onDismiss={onErrorDismiss} />
            </div>
          )}
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
