import { useState } from "react";

function SearchFilter({
  searchValue,
  onSearchChange,
  filters = {},
  onFilterChange = () => {},
  filterOptions = {},
  placeholder = "Search...",
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSearchChange = (e) => {
    onSearchChange(e.target.value);
  };

  const handleFilterChange = (filterKey, value) => {
    onFilterChange({ ...filters, [filterKey]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "" && v !== null
  ).length;

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <input
          type="text"
          value={searchValue}
          onChange={handleSearchChange}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {Object.keys(filterOptions).length > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>

          {activeFilterCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {isOpen && Object.keys(filterOptions).length > 0 && (
        <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(filterOptions).map(([key, options]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/_/g, " ")}
                </label>
                <select
                  value={filters[key] || ""}
                  onChange={(e) => handleFilterChange(key, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">All</option>
                  {Array.isArray(options) &&
                    options.map((option) => (
                      <option
                        key={typeof option === "object" ? option.id : option}
                        value={typeof option === "object" ? option.id : option}
                      >
                        {typeof option === "object" ? option.name : option}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchFilter;
