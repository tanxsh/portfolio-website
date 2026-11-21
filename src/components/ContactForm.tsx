"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";

type FieldErrors = {
  name?: string;
  email?: string;
  message?: string;
};

type FormValues = {
  name: string;
  email: string;
  message: string;
};

type ContactResponseBody = {
  message?: unknown;
  error?: unknown;
  errors?: FieldErrors;
};

type FieldProps = {
  id: keyof FormValues;
  label: string;
  type?: "text" | "email";
  multiline?: boolean;
  autoComplete?: string;
  value: string;
  error: string | undefined;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const initialValues: FormValues = { name: "", email: "", message: "" };

const OFFLINE_MESSAGE =
  "Couldn't reach the server. Your message is saved on this device and will be sent when you retry.";

function Field({
  id,
  label,
  type = "text",
  multiline = false,
  autoComplete,
  value,
  error,
  disabled,
  onChange,
}: FieldProps) {
  const describedBy = error ? `${id}-error` : undefined;

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`field-input mt-1.5 ${error ? "field-input-error" : ""}`}
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`field-input mt-1.5 ${error ? "field-input-error" : ""}`}
        />
      )}
      {error && (
        <p
          id={`${id}-error`}
            className="field-error"
        >
          {error}
        </p>
      )}
    </div>
  );
}

type ContactFormProps = {
  endpoint?: string;
  onQueue?: (fields: FormValues) => void;
};

export default function ContactForm({
  endpoint = "/api/contact-server-form",
  onQueue,
}: ContactFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFieldChange(field: keyof FormValues) {
    return (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((previous) => ({ ...previous, [field]: value }));
      setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setFailureMessage(null);
    setWarningMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const parsed = (await response
        .json()
        .catch(() => null)) as ContactResponseBody | null;

      if (response.ok) {
        setSuccessMessage(
          typeof parsed?.message === "string"
            ? parsed.message
            : "Thanks! Your message has been received.",
        );
        setValues(initialValues);
      } else if (response.status === 400 && parsed?.errors) {
        setFieldErrors(parsed.errors);
      } else if (response.status >= 500 && onQueue) {
        onQueue(values);
        setValues(initialValues);
        setWarningMessage(OFFLINE_MESSAGE);
      } else {
        setFailureMessage(
          typeof parsed?.error === "string"
            ? parsed.error
            : "Something went wrong. Please try again later.",
        );
      }
    } catch {
      if (onQueue) {
        onQueue(values);
        setValues(initialValues);
        setWarningMessage(OFFLINE_MESSAGE);
      } else {
        setFailureMessage(
          "Network error. Please check your connection and try again.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-8 flex max-w-xl flex-col gap-5"
    >
      {successMessage && (
        <p
          role="status"
          className="banner-success"
        >
          {successMessage}
        </p>
      )}

      {failureMessage && (
        <p
          role="alert"
          className="banner-error"
        >
          {failureMessage}
        </p>
      )}

      {warningMessage && (
        <p
          role="status"
          className="banner-warning"
        >
          {warningMessage}
        </p>
      )}

      <Field
        id="name"
        label="Name"
        autoComplete="name"
        value={values.name}
        error={fieldErrors.name}
        disabled={submitting}
        onChange={handleFieldChange("name")}
      />

      <Field
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        error={fieldErrors.email}
        disabled={submitting}
        onChange={handleFieldChange("email")}
      />

      <Field
        id="message"
        label="Message"
        multiline
        value={values.message}
        error={fieldErrors.message}
        disabled={submitting}
        onChange={handleFieldChange("message")}
      />

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary self-start"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
