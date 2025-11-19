import React, { useMemo } from "react";
import axios from "axios";
import ErrorAlert from "./common/ErrorAlert";
import FormField from "./common/FormField";
import Button from "./common/Button";
import { useFetch, useForm } from "../hooks";

const validateForm = (values) => {
  const errors = {};
  if (!values.name?.trim()) errors.name = "Asset name is required";
  if (!values.serial_number?.trim())
    errors.serial_number = "Serial number is required";
  if (!values.region) errors.region = "Region is required";
  if (!values.device_type) errors.device_type = "Device type is required";
  if (!values.status) errors.status = "Status is required";

  return errors;
};

function AssetForm({ asset, onClose }) {
  const { data: regions, loading: regionsLoading } = useFetch("/api/regions/");
  const { data: deviceTypes, loading: deviceTypesLoading } =
    useFetch("/api/device-types/");
  const { data: assetStatuses, loading: statusesLoading } = useFetch(
    "/api/asset-statuses/"
  );
  const { data: allUsers, loading: usersLoading } = useFetch("/api/users/");

  const [submitState, setSubmitState] = React.useState({
    loading: false,
    error: null,
  });

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit: handleFormSubmit,
    setErrors,
    setValues,
  } = useForm(
    {
      name: asset?.name || "",
      serial_number: asset?.serial_number || "",
      region: asset?.region?.id || asset?.region || "",
      device_type: asset?.device_type?.id || asset?.device_type || "",
      status: asset?.status?.id || asset?.status || "",
      assigned_to: asset?.assigned_to?.id || asset?.assigned_to || "",
    },
    async (values) => {
      const validationErrors = validateForm(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitState({ loading: true, error: null });
      try {
        const formData = {
          ...values,
          assigned_to: values.assigned_to || null,
        };

        if (asset) {
          await axios.put(`/api/assets/${asset.id}/`, formData);
        } else {
          await axios.post("/api/assets/", formData);
        }
        onClose();
      } catch (err) {
        console.error("Form submission error:", err);
        const errorMessage = getErrorMessage(err);
        setSubmitState({ loading: false, error: errorMessage });
      }
    }
  );

  const filteredUsers = useMemo(() => {
    if (!allUsers || !values.region) {
      return allUsers || [];
    }

    return allUsers.filter(
      (user) =>
        user.region?.id?.toString() === values.region.toString() ||
        user.region?.toString() === values.region.toString()
    );
  }, [allUsers, values.region]);

  const handleRegionChange = (e) => {
    const newRegionId = e.target.value;

    if (values.assigned_to && allUsers) {
      const currentUser = allUsers.find(
        (user) =>
          user.id?.toString() === values.assigned_to.toString() ||
          user.id === values.assigned_to
      );

      if (
        currentUser &&
        currentUser.region?.id?.toString() !== newRegionId.toString()
      ) {
        setValues((prev) => ({
          ...prev,
          region: newRegionId,
          assigned_to: "",
        }));
        return;
      }
    }

    handleChange(e);
  };

  const getErrorMessage = (err) => {
    if (err.response?.data) {
      const data = err.response.data;
      if (typeof data === "object") {
        const fieldErrors = Object.entries(data)
          .filter(([key, value]) => key !== "detail")
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          )
          .join("; ");

        if (fieldErrors) return fieldErrors;
      }
      return data.detail || data.message || "Failed to save asset";
    }
    return err.message || "Failed to save asset";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(e);
  };

  const isLoading =
    regionsLoading || deviceTypesLoading || statusesLoading || usersLoading;

  return (
    <div className="max-w-4xl">
      {submitState.error && (
        <ErrorAlert
          message={submitState.error}
          onDismiss={() => setSubmitState({ loading: false, error: null })}
          autoDismiss={false}
        />
      )}

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">
            {asset ? "Edit Asset" : "Create New Asset"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <FormField
                label="Asset Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter asset name"
                required
                error={errors.name}
                touched={touched.name}
              />

              <FormField
                label="Serial Number"
                name="serial_number"
                value={values.serial_number}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter serial number"
                required
                error={errors.serial_number}
                touched={touched.serial_number}
              />

              <FormField
                label="Device Type"
                name="device_type"
                type="select"
                value={values.device_type}
                onChange={handleChange}
                onBlur={handleBlur}
                options={deviceTypes || []}
                required
                error={errors.device_type}
                touched={touched.device_type}
                loading={deviceTypesLoading}
              />

              <FormField
                label="Status"
                name="status"
                type="select"
                value={values.status}
                onChange={handleChange}
                onBlur={handleBlur}
                options={assetStatuses || []}
                required
                error={errors.status}
                touched={touched.status}
                loading={statusesLoading}
              />
            </div>

            <div className="space-y-4">
              <FormField
                label="Region"
                name="region"
                type="select"
                value={values.region}
                onChange={handleRegionChange}
                onBlur={handleBlur}
                options={regions || []}
                required
                error={errors.region}
                touched={touched.region}
                loading={regionsLoading}
              />

              <FormField
                label="Assigned To"
                name="assigned_to"
                type="select"
                required={false}
                value={values.assigned_to}
                onChange={handleChange}
                onBlur={handleBlur}
                options={filteredUsers}
                error={errors.assigned_to}
                touched={touched.assigned_to}
                loading={usersLoading}
                disabled={!values.region}
                placeholder={
                  !values.region
                    ? "Select a region first"
                    : "Select user (optional)"
                }
              />

              {values.region && (
                <p className="text-sm text-gray-500 mt-1">
                  {filteredUsers.length === 0
                    ? "No users available in this region"
                    : ""}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="submit"
              disabled={submitState.loading || isLoading}
              variant="primary"
            >
              {submitState.loading ? "Saving..." : "Save Asset"}
            </Button>
            <Button type="button" onClick={onClose} variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssetForm;
