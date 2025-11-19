import axios from "axios";
import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Custom hook for managing async data fetching with error handling
 * Provides loading, error, and data states automatically
 */
export function useFetch(url, options = {}) {
  const [state, setState] = useState({
    data: null,
    loading: true,
    error: null,
  });

  const optionsRef = useRef(options);
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    optionsRef.current = options;
  }, [optionsKey]);

  const fetchData = useCallback(
    async (shouldThrow = false) => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const response = await axios.get(url, optionsRef.current);
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error?.details ||
          err.response?.data?.message ||
          err.message ||
          "An error occurred while fetching data";
        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        if (shouldThrow) {
          throw err;
        }
        return null;
      }
    },
    [url, optionsKey]
  );

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    ...state,
    refetch: fetchData,
    retry,
  };
}

/**
 * Custom hook for managing async operations with error handling
 * Use for POST, PUT, DELETE operations
 */
export function useAsync(asyncFunction, immediate = true) {
  const [state, setState] = useState({
    loading: immediate,
    error: null,
    data: null,
  });

  const execute = useCallback(
    async (...args) => {
      setState({ loading: true, error: null, data: null });
      try {
        const response = await asyncFunction(...args);
        setState({ loading: false, error: null, data: response });
        return response;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error?.details ||
          err.response?.data?.message ||
          err.message ||
          "An error occurred";
        setState({
          loading: false,
          error: errorMessage,
          data: null,
        });
        throw err;
      }
    },
    [asyncFunction]
  );

  return {
    ...state,
    execute,
  };
}

/**
 * Custom hook for form state management with validation
 */
export function useForm(initialValues, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setValues((prev) => ({
        ...prev,
        [name]: value,
      }));
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        console.error("Form submission error:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const setFormError = useCallback((fieldName, errorMessage) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessage,
    }));
  }, []);

  return {
    values,
    setValues,
    errors,
    setErrors,
    touched,
    setTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormError,
    isSubmitting,
  };
}
