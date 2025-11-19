import { useState, useEffect } from "react";

function ErrorAlert({
  message,
  onDismiss,
  onRetry,
  autoDismiss = true,
  dismissDelay = 5000,
}) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!autoDismiss || !isVisible) return;

    const timer = setTimeout(() => {
      handleDismiss();
    }, dismissDelay);

    return () => clearTimeout(timer);
  }, [isVisible, autoDismiss, dismissDelay]);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <p className="text-red-700 text-sm">Error: {message}</p>
      </div>
      <div className="flex gap-2 ml-4">
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
          >
            Retry
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
        >
          X
        </button>
      </div>
    </div>
  );
}

export default ErrorAlert;
