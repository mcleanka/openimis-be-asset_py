import React from "react";
import axios from "axios";
import ErrorAlert from "./common/ErrorAlert";
import FormField from "./common/FormField";
import Button from "./common/Button";
import { useForm } from "../hooks";

const validateRegionForm = (values) => {
  const errors = {};
  if (!values.name?.trim()) errors.name = "Region name is required";
  else if (values.name.trim().length < 2) {
    errors.name = "Region name must be at least 2 characters long";
  }
  return errors;
};

function RegionForm({ region, onClose }) {
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
      name: region?.name || "",
    },
    async (values) => {
      const validationErrors = validateRegionForm(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setSubmitState({ loading: true, error: null });
      try {
        const formData = {
          name: values.name.trim(),
        };

        if (region) {
          await axios.put(`/api/regions/${region.id}/`, formData);
        } else {
          await axios.post("/api/regions/", formData);
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

        if (data.name && data.name.includes("already exists")) {
          return "A region with this name already exists";
        }
      }
      return data.detail || data.message || "Failed to save region";
    }
    return err.message || "Failed to save region";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleFormSubmit(e);
  };

  return (
    <div className="max-w-md">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">
        {region ? "Edit Region" : "Create New Region"}
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
        className="bg-white rounded-lg shadow-sm border border-slate-200 p-6"
      >
        <div className="space-y-6">
          <FormField
            label="Region Name"
            name="name"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter region name"
            required
            error={errors.name}
            touched={touched.name}
          />
        </div>

        <div className="flex gap-3 mt-8">
          <Button
            type="submit"
            disabled={submitState.loading}
            variant="primary"
          >
            {submitState.loading ? "Saving..." : "Save Region"}
          </Button>
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

export default RegionForm;
