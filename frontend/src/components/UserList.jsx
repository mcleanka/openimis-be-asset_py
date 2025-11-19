import { useCallback, useState, useEffect } from "react";
import axios from "axios";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import Button from "./common/Button";
import SearchFilter from "./common/SearchFilter";
import { useAsync, useFetch } from "../hooks";

function UserList({ onCreateNew, onEdit }) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { data: regions = [] } = useFetch("/api/regions/");
  const { data: roles = [] } = useFetch("/api/user-roles/");

  const deleteUser = useCallback(async (id) => {
    return axios.delete(`/api/users/${id}/`);
  }, []);

  const {
    execute: executeDelete,
    loading: deleteLoading,
    error: deleteError,
  } = useAsync(deleteUser, false);

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
    return queryString ? `/api/users/?${queryString}` : "/api/users/";
  }, [search, filters]);

  useEffect(() => {
    fetchUsers();
  }, [search, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(buildUrl());
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      const user = users?.find((u) => u.id === id);
      if (
        !window.confirm(
          `Are you sure you want to delete the user "${user?.name}"? This action cannot be undone if the user has assigned assets.`
        )
      ) {
        return;
      }

      try {
        await executeDelete(id);
        fetchUsers();
      } catch (err) {
        console.error("Error deleting user:", err);
        if (err.response?.data?.detail) {
          alert(`Cannot delete user: ${err.response.data.detail}`);
        }
      }
    },
    [executeDelete, users, fetchUsers]
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={error} onRetry={fetchUsers} />;

  const userList = users || [];
  const filterOptions = {
    region: regions,
    role: roles,
  };

  return (
    <div>
      <PageHeader
        title={"Users"}
        action={
          <Button onClick={onCreateNew} variant="primary">
            Create New User
          </Button>
        }
      />

      <SearchFilter
        searchValue={search}
        onSearchChange={setSearch}
        filters={filters}
        onFilterChange={setFilters}
        filterOptions={filterOptions}
        placeholder="Search by name or email..."
      />

      {deleteError && (
        <ErrorAlert
          message={deleteError}
          onDismiss={() => {}}
          autoDismiss={false}
        />
      )}

      {userList.length === 0 ? (
        <EmptyState message="no users found" />
      ) : (
        <Table
          columns={[
            {
              key: "name",
              label: "Full Name",
              bold: true,
            },
            {
              key: "email",
              label: "Email",
            },
            {
              key: "region_name",
              label: "Region",
            },
            {
              key: "role_name",
              label: "Role",
              render: (value) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                  {value}
                </span>
              ),
            },
            {
              key: "assigned_assets_count",
              label: "Assigned Assets",
              render: (value) => value || 0,
            },
            {
              key: "created_at",
              label: "Created",
              render: (value) => new Date(value).toLocaleDateString(),
            },
          ]}
          data={userList}
          actions={(user) => (
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => onEdit(user)}
                variant="link"
                type="button"
                size="sm"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDelete(user.id)}
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
    </div>
  );
}

export default UserList;
