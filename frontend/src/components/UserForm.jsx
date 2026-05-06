import React from "react";
import axios from "axios";
import ErrorAlert from "./common/ErrorAlert";
import FormField from "./common/FormField";
import Button from "./common/Button";
import { useFetch, useForm } from "../hooks";

const validateUserForm = (values) => {
  const errors = {};
  if (!values.name?.trim()) errors.name = "User name is required";
  if (!values.email?.trim()) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address";
  }
  if (!values.region) errors.region = "Region is required";
  if (!values.role) errors.role = "Role is required";
  return errors;
};

function UserForm({ user, onClose }) {
  const { data: regions, loading: regionsLoading } = useFetch("/api/regions/");
  const { data: roles, loading: rolesLoading } = useFetch("/api/user-roles/");

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
  } = useForm(
    {
      name: user?.name || "",
      email: user?.email || "",
      region: user?.region?.id || user?.region || "",
      role: user?.role?.id || user?.role || "",
    },
    async (values) => {
      const validationErrors = validateUserForm(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitState({ loading: true, error: null });
      try {
        const formData = {
          ...values,
        };

        if (user) {
          await axios.put(`/api/users/${user.id}/`, formData);
        } else {
          await axios.post("/api/users/", formData);
        }
        onClose();
      } catch (err) {
        console.error("Form submission error:", err);
        const errorMessage = getErrorMessage(err);
        setSubmitState({ loading: false, error: errorMessage });
      }
    }
  );

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
      return data.detail || data.message || "Failed to save user";
    }
    return err.message || "Failed to save user";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(e);
  };

  const isLoading = regionsLoading || rolesLoading;

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        {user ? "Edit User" : "Create New User"}
      </h2>

      {submitState.error && (
        <ErrorAlert
          message={submitState.error}
          onDismiss={() => setSubmitState({ loading: false, error: null })}
          autoDismiss={false}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-md border border-slate-200 p-6"
      >
        <div className="space-y-4">
          <FormField
            label="Full Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter user's full name"
            required
            error={errors.name}
            touched={touched.name}
          />

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter email address"
            required
            error={errors.email}
            touched={touched.email}
          />

          <FormField
            label="Region"
            name="region"
            type="select"
            value={values.region}
            onChange={handleChange}
            onBlur={handleBlur}
            options={regions || []}
            required
            error={errors.region}
            touched={touched.region}
            loading={regionsLoading}
          />

          <FormField
            label="Role"
            name="role"
            type="select"
            value={values.role}
            onChange={handleChange}
            onBlur={handleBlur}
            options={roles || []}
            required
            error={errors.role}
            touched={touched.role}
            loading={rolesLoading}
          />
        </div>

        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <Button
            type="submit"
            disabled={submitState.loading || isLoading}
            variant="primary"
          >
            {submitState.loading ? "Saving..." : "Save User"}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UserForm;
