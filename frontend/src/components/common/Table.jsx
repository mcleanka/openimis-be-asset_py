function Table({ columns, data, actions }) {
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
            <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 text-sm ${
                    column.bold ? "text-gray-900 font-medium" : "text-gray-600"
                  }`}
                >
                  {row[column.key]}
                </td>
              ))}
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

export default Table;
