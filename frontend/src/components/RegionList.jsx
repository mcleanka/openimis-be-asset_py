import { useState, useCallback } from "react";
import axios from "axios";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import Button from "./common/Button";
import { useFetch, useAsync } from "../hooks";

function RegionList({ onCreateNew, onEdit }) {
  const [deleteError, setDeleteError] = useState(null);

  const {
    data: regions = [],
    loading,
    error,
    retry,
    refetch,
  } = useFetch("/api/regions/");

  const deleteRegion = useCallback(async (id) => {
    return axios.delete(`/api/regions/${id}/`);
  }, []);

  const { execute: executeDelete, loading: deleteLoading } = useAsync(
    deleteRegion,
    false
  );

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
        setDeleteError(null);
        refetch();
      } catch (err) {
        console.error("Error deleting region:", err);
        if (err.response?.data?.detail) {
          setDeleteError(`Cannot delete region: ${err.response.data.detail}`);
        } else {
          setDeleteError("Failed to delete region");
        }
      }
    },
    [executeDelete, regions, refetch]
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={error} onRetry={retry} />;

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
        <EmptyState message="no regions found" />
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
          onDismiss={() => setDeleteError(null)}
          autoDismiss={false}
        />
      )}
    </div>
  );
}

export default RegionList;
