import React from "react";

/**
 * Validation error component for form fields
 */
function FieldError({ error, show = false }) {
  if (!show || !error) return null;

  return (
    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {error}
    </p>
  );
}

export default FieldError;
