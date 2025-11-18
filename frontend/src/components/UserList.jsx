import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Table from "./common/Table";
import LoadingSpinner from "./common/LoadingSpinner";
import ErrorAlert from "./common/ErrorAlert";
import EmptyState from "./common/EmptyState";
import PageHeader from "./common/PageHeader";
import Button from "./common/Button";
import { useAsync } from "../hooks";

function UserList({ onCreateNew, onEdit }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const deleteUser = useCallback(async (id) => {
    return axios.delete(`/api/users/${id}/`);
  }, []);

  const {
    execute: executeDelete,
    loading: deleteLoading,
    error: deleteError,
  } = useAsync(deleteUser, false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      if (!isInitialLoad) {
        setLoading(true);
      }
      const response = await axios.get("/api/users/");
      setUsers(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  const handleDelete = useCallback(
    async (id) => {
      const user = users.find((u) => u.id === id);
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
    [executeDelete, users]
  );

  if (loading) return <LoadingSpinner />;

  if (error) return <ErrorAlert message={error} onRetry={fetchUsers} />;

  return (
    <div>
      <PageHeader
        title={users.length === 0 ? "No Users Found" : "Users"}
        action={
          <Button onClick={onCreateNew} variant="primary">
            Create New User
          </Button>
        }
      />

      {users.length === 0 ? (
        <EmptyState
          message="no users found"
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
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          }
        />
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
          data={users}
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

export default UserList;
