function EmptyState({
  message = "No data found",
  icon,
  action,
  actionLabel = "Create New",
}) {
  return (
    <div className="bg-white rounded-sm p-12 text-center border border-slate-200">
      {icon && (
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            {icon}
          </div>
        </div>
      )}
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
