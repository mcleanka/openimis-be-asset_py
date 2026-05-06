import { useState, useEffect } from "react";
import axios from "axios";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import SearchFilter from "./common/SearchFilter";
import { useFetch } from "../hooks";

function AssetAssignmentList() {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: regions = [] } = useFetch("/api/regions/");
  const { data: assetStatuses = [] } = useFetch("/api/asset-statuses/");

  const buildUrl = () => {
    const params = new URLSearchParams();

    if (filter === "active") {
      params.append("active", "true");
    } else if (filter === "returned") {
      params.append("active", "false");
    }

    if (search) {
      params.append("search", search);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return queryString
      ? `/api/asset-assignments/?${queryString}`
      : "/api/asset-assignments/";
  };

  useEffect(() => {
    fetchAssignments();
  }, [filter, search, filters]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildUrl());
      setAssignments(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load asset assignments");
      console.error("Error fetching assignments:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={fetchAssignments} />;

  const filterOptions = {
    assignment_region: regions,
    assignment_status: assetStatuses,
  };

  return (
    <div>
      <PageHeader
        title={"Asset Assignments Audit"}
        action={
          <nav className="flex space-x-4">
            {[
              { id: "all", label: "All Assignments" },
              { id: "active", label: "Active" },
              { id: "returned", label: "Returned" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        placeholder="Search by asset name, serial number, or user..."
      />

      {assignments.length === 0 ? (
        <EmptyState message="no assest assignments audit found" />
      ) : (
        <Table
          columns={[
            { key: "asset_name", label: "Asset", bold: true },
            { key: "asset_serial_number", label: "Serial Number" },
            { key: "assigned_to_name", label: "Assigned To" },
            {
              key: "assigned_date",
              label: "Assigned Date",
              render: (value) => new Date(value).toLocaleDateString(),
            },
            {
              key: "returned_date",
              label: "Returned Date",
              render: (value) =>
                value ? new Date(value).toLocaleDateString() : "Active",
            },
            {
              key: "is_active",
              label: "Status",
              render: (value) => (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    value
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {value ? "Active" : "Returned"}
                </span>
              ),
            },
          ]}
          data={assignments}
        />
      )}
    </div>
  );
}

export default AssetAssignmentList;
