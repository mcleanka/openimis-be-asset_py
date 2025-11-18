import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import Button from "./common/Button";
import { useAsync } from "../hooks";

function RegionList({ onCreateNew, onEdit }) {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const deleteRegion = useCallback(async (id) => {
    return axios.delete(`/api/regions/${id}/`);
  }, []);

  const {
    execute: executeDelete,
    loading: deleteLoading,
    error: deleteError,
  } = useAsync(deleteRegion, false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      const response = await axios.get("/api/regions/");
      setRegions(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load regions");
      console.error("Error fetching regions:", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      const region = regions.find((r) => r.id === id);
      if (
        !window.confirm(
          `Are you sure you want to delete the region "${region?.name}"? This action cannot be undone if the region has users or assets.`
        )
      ) {
        return;
      }

      try {
        await executeDelete(id);
        fetchRegions();
      } catch (err) {
        console.error("Error deleting region:", err);
        if (err.response?.data?.detail) {
          alert(`Cannot delete region: ${err.response.data.detail}`);
        }
      }
    },
    [executeDelete, regions]
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={error} onRetry={fetchRegions} />;

  return (
    <div>
      <PageHeader
        title={regions.length === 0 ? "No Regions Found" : "Regions"}
        action={
          <Button onClick={onCreateNew} variant="primary">
            Create New Region
          </Button>
        }
      />

      {regions.length === 0 ? (
        <EmptyState
          message="no regions found"
          icon={
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
                d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      ) : (
        <Table
          columns={[
            {
              key: "name",
              label: "Region Name",
              bold: true,
            },
            {
              key: "stats.total_users",
              label: "Users",
              render: (value) => value || 0,
            },
            {
              key: "stats.total_assets",
              label: "Assets",
              render: (value) => value || 0,
            },
            {
              key: "created_at",
              label: "Created",
              render: (value) => new Date(value).toLocaleDateString(),
            },
          ]}
          data={regions}
          actions={(region) => (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => onEdit(region)}
                variant="link"
                type="button"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(region.id)}
                variant="link"
                type="button"
                size="sm"
                disabled={deleteLoading}
                className="text-red-700 hover:text-red-900"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          )}
        />
      )}

      {deleteError && (
        <ErrorAlert
          message={deleteError}
          onDismiss={() => {}}
          autoDismiss={false}
        />
      )}
    </div>
  );
}

export default RegionList;
