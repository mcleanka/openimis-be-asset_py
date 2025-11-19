import { useState } from "react";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import { useFetch } from "../hooks";

function AssetAssignmentList() {
  const [filter, setFilter] = useState("all");

  let url = "/api/asset-assignments/";
  if (filter === "active") {
    url += "?active=true";
  } else if (filter === "returned") {
    url += "?active=false";
  }

  const { data: assignments = [], loading, error, retry } = useFetch(url);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} onRetry={retry} />;

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
