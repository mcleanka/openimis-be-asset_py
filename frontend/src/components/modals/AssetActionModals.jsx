import { useState } from "react";
import axios from "axios";
import Button from "../common/Button";
import ErrorAlert from "../common/ErrorAlert";
import LoadingSpinner from "../common/LoadingSpinner";
import { useFetch, useAsync } from "../../hooks";

/**
 * Modal for assigning an asset to a user
 */
export function AssignAssetModal({ asset, onClose, onSuccess }) {
  const [selectedUserId, setSelectedUserId] = useState("");

  const {
    data: users = [],
    loading,
    error,
  } = useFetch("/api/users/?", { params: { region_name: asset.region_name } });

  const assignAsset = async (userId) => {
    const response = await axios.post(`/api/assets/${asset.id}/assign/`, {
      user_id: userId,
    });
    return response.data;
  };

  const {
    loading: submitting,
    error: submitError,
    execute: handleAssign,
  } = useAsync(assignAsset, false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserId) {
      return;
    }

    try {
      const result = await handleAssign(parseInt(selectedUserId));
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error("Error assigning asset:", err);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="fixed inset-0 bg-black/60 opacity-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-200 rounded-md shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Assign Asset
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{asset.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {(error || submitError) && (
            <div className="mb-5">
              <ErrorAlert message={error || submitError} onDismiss={() => {}} />
            </div>
          )}{" "}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Choose a user...</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} • {user.email}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Assigning...
                </span>
              ) : (
                "Assign Asset"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Confirmation modal for unassigning an asset
 */
export function UnassignAssetModal({ asset, onClose, onSuccess }) {
  const unassignAsset = async () => {
    const response = await axios.post(`/api/assets/${asset.id}/unassign/`);
    return response.data;
  };

  const {
    loading: submitting,
    error,
    execute: handleUnassign,
  } = useAsync(unassignAsset, false);

  const handleSubmit = async () => {
    try {
      const result = await handleUnassign();
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error("Error unassigning asset:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 opacity-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-200 rounded-md shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Unassign Asset
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5">
              <ErrorAlert message={error} onDismiss={() => {}} />
            </div>
          )}

          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-50 mb-4">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Confirm Unassignment
            </h4>
            <p className="text-gray-600">
              Remove{" "}
              <span className="font-semibold text-gray-900">{asset.name}</span>{" "}
              from{" "}
              <span className="font-semibold text-gray-900">
                {asset.assigned_to_name}
              </span>
              ?
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Unassign"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation modal for marking asset as repair
 */
export function MarkRepairModal({ asset, onClose, onSuccess }) {
  const markAssetRepair = async () => {
    const response = await axios.post(`/api/assets/${asset.id}/mark-repair/`);
    return response.data;
  };

  const {
    loading: submitting,
    error,
    execute: handleMarkRepair,
  } = useAsync(markAssetRepair, false);

  const handleSubmit = async () => {
    try {
      const result = await handleMarkRepair();
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error("Error marking asset for repair:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 opacity-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-200 rounded-md shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Mark for Repair
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5">
              <ErrorAlert message={error} onDismiss={() => {}} />
            </div>
          )}

          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-50 mb-4">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Send for Maintenance
            </h4>
            <p className="text-gray-600">
              Mark{" "}
              <span className="font-semibold text-gray-900">{asset.name}</span>{" "}
              as under repair?
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Mark for Repair"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Confirmation modal for retiring an asset
 */
export function RetireAssetModal({ asset, onClose, onSuccess }) {
  const retireAsset = async () => {
    const response = await axios.post(`/api/assets/${asset.id}/retire/`);
    return response.data;
  };

  const {
    loading: submitting,
    error,
    execute: handleRetire,
  } = useAsync(retireAsset, false);

  const handleSubmit = async () => {
    try {
      const result = await handleRetire();
      onSuccess?.(result);
      onClose();
    } catch (err) {
      console.error("Error retiring asset:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 opacity-100 flex items-center justify-center p-4 z-50">
      <div className="bg-white border border-gray-200 rounded-md shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Retire Asset
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-5">
              <ErrorAlert message={error} onDismiss={() => {}} />
            </div>
          )}

          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-50 mb-4">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">
              Confirm Retirement
            </h4>
            <p className="text-gray-600 mb-3">
              This will permanently retire{" "}
              <span className="font-semibold text-gray-900">{asset.name}</span>.
            </p>
            <p className="text-sm text-gray-600 font-medium">
              This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="primary"
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-100"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                "Retire Asset"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
