const getNestedValue = (obj, path) => {
  return path.split(".").reduce((current, key) => current?.[key], obj);
};

export default function Table({ columns, data, actions }) {
  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="border-b border-gray-200">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-5 text-left text-md font-semibold text-gray-900"
              >
                {column.label}
              </th>
            ))}
            {actions && (
              <th className="px-6 py-5 text-left text-md font-semibold text-gray-900">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              className="hover:bg-gray-50 transition-colors"
            >
              {columns.map((column) => {
                const value = getNestedValue(row, column.key);
                const displayValue = column.render
                  ? column.render(value, row)
                  : value;

                return (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-sm ${
                      column.bold
                        ? "text-gray-900 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {displayValue}
                  </td>
                );
              })}
              {actions && (
                <td className="px-6 py-4 text-sm space-x-3">{actions(row)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
