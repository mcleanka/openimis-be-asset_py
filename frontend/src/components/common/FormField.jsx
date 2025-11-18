import React from "react";
import FieldError from "./FieldError";

function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  options = [],
  error,
  touched,
}) {
  const baseInputStyles =
    "w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white text-gray-900";

  const inputClasses =
    error && touched
      ? `${baseInputStyles} border-red-300 focus:ring-red-500`
      : `${baseInputStyles} border-gray-200`;

  if (type === "select") {
    return (
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-600">*</span>}
        </label>
        <select
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          className={inputClasses}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        <FieldError error={error} show={touched} />
      </div>
    );
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        className={inputClasses}
      />
      <FieldError error={error} show={touched} />
    </div>
  );
}

export default FormField;
