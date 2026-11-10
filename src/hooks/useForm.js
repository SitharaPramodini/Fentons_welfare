import { useCallback, useRef, useState } from "react";
import { ApiError } from "@/lib/api";

/**
 * Form state for the two application forms: values, per-field errors, and the
 * submit lifecycle.
 *
 * Field errors come from the backend - it already validates every field of
 * both forms, so duplicating those rules in the browser would mean two sets
 * of wording to keep in step. Required fields still carry the native
 * `required` attribute, so the browser catches the empty-field case before a
 * request is ever made.
 *
 *   const form = useForm(initialValues, (values) => api.registerMember(values));
 *   <input {...form.field("full_name")} />
 *
 * `mapErrors` renames the server's field keys to this form's own input names.
 * It matters more than it looks: an error whose key does not match an input
 * can never be cleared by editing that input, and cannot be scrolled to -
 * it simply sticks on screen for good.
 */
export function useForm(initialValues, submitFn, { mapErrors } = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);

  const formRef = useRef(null);

  const setValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    /* Clear the field's error as soon as the person starts correcting it. */
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  /** Spreads onto an input/select/textarea: value, onChange, name, invalid. */
  const field = useCallback(
    (name, { type = "text" } = {}) => ({
      name,
      value: type === "checkbox" ? undefined : (values[name] ?? ""),
      checked: type === "checkbox" ? Boolean(values[name]) : undefined,
      invalid: Boolean(errors[name]),
      onChange: (event) => {
        const target = event.target;
        setValue(name, target.type === "checkbox" ? target.checked : target.value);
      },
    }),
    [values, errors, setValue],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setStatus("idle");
    setMessage("");
    setResult(null);
  }, [initialValues]);

  const submit = useCallback(
    async (event) => {
      event?.preventDefault();
      if (status === "submitting") return;

      setStatus("submitting");
      setErrors({});
      setMessage("");

      try {
        const response = await submitFn(values);
        setResult(response?.data ?? null);
        setMessage(response?.message ?? "Submitted.");
        setStatus("success");
      } catch (err) {
        const raw = err instanceof ApiError ? (err.fieldErrors ?? {}) : {};
        const fieldErrors = mapErrors ? mapErrors(raw) : raw;
        setErrors(fieldErrors);
        setMessage(err?.message ?? "Something went wrong. Please try again.");
        setStatus("error");

        /* Put the first bad field on screen and in focus. */
        const firstField = Object.keys(fieldErrors)[0];
        const node = firstField
          ? formRef.current?.querySelector(`[name="${CSS.escape(firstField)}"]`)
          : null;
        const target = node ?? formRef.current;
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        node?.focus?.({ preventScroll: true });
      }
    },
    [status, submitFn, values, mapErrors],
  );

  return {
    formRef,
    values,
    setValue,
    setValues,
    errors,
    setErrors,
    field,
    status,
    message,
    result,
    submit,
    reset,
    submitting: status === "submitting",
    succeeded: status === "success",
  };
}
