import { useState, useRef, useEffect } from "react";
import FormField from "./FormField";

function SearchFilter({
  searchValue,
  onSearchChange,
  filters = {},
  onFilterChange = () => {},
  filterOptions = {},
  placeholder = "Search...",
}) {
  const [tempFilters, setTempFilters] = useState(filters);
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const searchInputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearchValue(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(value);
    }, 500);
  };

  const handleTempFilterChange = (filterKey, value) => {
    setTempFilters({ ...tempFilters, [filterKey]: value });
  };

  const handleApplyFilters = () => {
    onFilterChange(tempFilters);
  };

  const handleClearFilters = () => {
    setTempFilters({});
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "" && v !== null
  ).length;

  const hasChanges = JSON.stringify(tempFilters) !== JSON.stringify(filters);

  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <FormField
          type="text"
          name="search"
          value={localSearchValue}
          onChange={handleSearchChange}
          inputRef={searchInputRef}
          placeholder={placeholder}
        />
      </div>

      {Object.keys(filterOptions).length > 0 && (
        <>
          <div className="p-4 border border-gray-300 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(filterOptions).map(([key, options]) => (
                <div key={key}>
                  <FormField
                    label={key.replace(/_/g, " ")}
                    name={key}
                    type="select"
                    value={tempFilters[key] || ""}
                    onChange={(e) =>
                      handleTempFilterChange(key, e.target.value)
                    }
                    options={
                      Array.isArray(options)
                        ? options.map((option) =>
                            typeof option === "object"
                              ? option
                              : { id: option, name: option }
                          )
                        : []
                    }
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 justify-end">
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm gap-2 font-medium text-red-600 bg-red-100 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                >
                  Clear filters
                  {activeFilterCount > 0 && (
                    <span className="inline-flex items-center justify-center w-5 h-5 ml-2 text-xs font-bold text-white bg-blue-600 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleApplyFilters}
                disabled={!hasChanges}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Apply filters
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default SearchFilter;
