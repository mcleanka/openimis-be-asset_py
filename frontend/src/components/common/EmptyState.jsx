function EmptyState({
  message = "No data found",
  icon,
  action,
  actionLabel = "Create New",
}) {
  return (
    <div className="bg-white rounded-sm p-12 text-center border border-slate-200">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      </div>
      <p className="text-slate-500 text-lg mb-4 capitalize">{message}</p>
      {action && (
        <button
          onClick={action}
          className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
