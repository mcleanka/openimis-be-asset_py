import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import Button from "./common/Button";
import SearchFilter from "./common/SearchFilter";
import { useAsync, useFetch } from "../hooks";
import {
  AssignAssetModal,
  UnassignAssetModal,
  MarkRepairModal,
  RetireAssetModal,
} from "./modals/AssetActionModals";

function AssetList({ onCreateNew, onEdit }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  // Fetch filter options
  const { data: regions = [] } = useFetch("/api/regions/");
  const { data: deviceTypes = [] } = useFetch("/api/device-types/");
  const { data: assetStatuses = [] } = useFetch("/api/asset-statuses/");

  const deleteAsset = useCallback(async (id) => {
    return axios.delete(`/api/assets/${id}/`);
  }, []);

  const {
    execute: executeDelete,
    loading: deleteLoading,
    error: deleteError,
  } = useAsync(deleteAsset, false);

  const [modalState, setModalState] = useState({
    assignAsset: null,
    unassignAsset: null,
    repairAsset: null,
    retireAsset: null,
  });

  // Build query string based on search and filters
  const buildUrl = useCallback(() => {
    const params = new URLSearchParams();

    if (search) {
      params.append("search", search);
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "") {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    return queryString ? `/api/assets/?${queryString}` : "/api/assets/";
  }, [search, filters]);

  useEffect(() => {
    fetchAssets();
  }, [search, filters]);

  const fetchAssets = async () => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      const response = await axios.get(buildUrl());
      setAssets(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load assets");
      console.error("Error fetching assets:", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      if (!window.confirm("Are you sure you want to delete this asset?")) {
        return;
      }

      try {
        await executeDelete(id);
        fetchAssets();
      } catch (err) {
        console.error("Error deleting asset:", err);
      }
    },
    [executeDelete]
  );

  const openAssignModal = (asset) => {
    setModalState((prev) => ({ ...prev, assignAsset: asset }));
  };

  const openUnassignModal = (asset) => {
    setModalState((prev) => ({ ...prev, unassignAsset: asset }));
  };

  const openRepairModal = (asset) => {
    setModalState((prev) => ({ ...prev, repairAsset: asset }));
  };

  const openRetireModal = (asset) => {
    setModalState((prev) => ({ ...prev, retireAsset: asset }));
  };

  const closeAllModals = () => {
    setModalState({
      assignAsset: null,
      unassignAsset: null,
      repairAsset: null,
      retireAsset: null,
    });
  };

  const handleActionSuccess = () => {
    closeAllModals();
    fetchAssets();
  };

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={error} onRetry={fetchAssets} />;

  const filterOptions = {
    region: regions,
    device_type: deviceTypes,
    status: assetStatuses,
  };

  return (
    <div>
      <PageHeader
        title={assets.length === 0 ? "No Asset Found" : "Assets"}
        action={
          <Button onClick={onCreateNew} variant="primary">
            Create New Asset
          </Button>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        placeholder="Search by asset name or serial number..."
      />

      {assets.length === 0 ? (
        <EmptyState message="no assets found" />
      ) : (
        <>
          <Table
            columns={[
              { key: "name", label: "Name", bold: true },
              { key: "serial_number", label: "Serial Number" },
              { key: "device_type_name", label: "Device Type" },
              { key: "region_name", label: "Region" },
              {
                key: "status_name",
                label: "Status",
                render: (value) => (
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      value === "Available"
                        ? "bg-green-100 text-green-800"
                        : value === "Assigned"
                        ? "bg-blue-100 text-blue-800"
                        : value === "Repair"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {value}
                  </span>
                ),
              },
            ]}
            data={assets}
            actions={(asset) => (
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => onEdit(asset)}
                  variant="link"
                  type="button"
                  size="sm"
                >
                  Edit
                </Button>
                {asset.status_name === "Available" && (
                  <Button
                    onClick={() => openAssignModal(asset)}
                    variant="link"
                    type="button"
                    size="sm"
                    className="text-green-600 hover:text-green-800"
                  >
                    Assign
                  </Button>
                )}
                {asset.status_name === "Assigned" && (
                  <>
                    <Button
                      onClick={() => openUnassignModal(asset)}
                      variant="link"
                      type="button"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Unassign
                    </Button>
                    <Button
                      onClick={() => openRepairModal(asset)}
                      variant="link"
                      type="button"
                      size="sm"
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      Repair
                    </Button>
                  </>
                )}
                {asset.status_name !== "Retired" && (
                  <Button
                    onClick={() => openRetireModal(asset)}
                    variant="link"
                    type="button"
                    size="sm"
                    className="text-red-600 hover:text-red-800"
                  >
                    Retire
                  </Button>
                )}
                <Button
                  onClick={() => handleDelete(asset.id)}
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

          {modalState.assignAsset && (
            <AssignAssetModal
              asset={modalState.assignAsset}
              onClose={closeAllModals}
              onSuccess={handleActionSuccess}
            />
          )}
          {modalState.unassignAsset && (
            <UnassignAssetModal
              asset={modalState.unassignAsset}
              onClose={closeAllModals}
              onSuccess={handleActionSuccess}
            />
          )}
          {modalState.repairAsset && (
            <MarkRepairModal
              asset={modalState.repairAsset}
              onClose={closeAllModals}
              onSuccess={handleActionSuccess}
            />
          )}
          {modalState.retireAsset && (
            <RetireAssetModal
              asset={modalState.retireAsset}
              onClose={closeAllModals}
              onSuccess={handleActionSuccess}
            />
          )}
        </>
      )}
    </div>
  );
}

export default AssetList;
