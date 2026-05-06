import React from "react";

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-slate-600 text-sm">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;
