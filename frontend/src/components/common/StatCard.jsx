function StatCard({ title, value, description, icon }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xl font-semibold text-gray-900">{title}</p>
          <p className="text-sm font-medium text-gray-600 mt-2">
            {description}: {value}
          </p>
        </div>
        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
