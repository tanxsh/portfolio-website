"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { StoredContact } from "@/lib/contactStore";

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

type ContactApiBody = {
  error?: unknown;
  errors?: FieldErrors;
};

type FieldProps = {
  id: keyof FormValues;
  label: string;
  multiline?: boolean;
  value: string;
  error: string | undefined;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

type ContactEditFormProps = {
  contact: StoredContact;
  onSaved?: (contact: StoredContact) => void;
};

function Field({
  id,
  label,
  multiline = false,
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
          rows={6}
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
          type="text"
          value={value}
          onChange={onChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`field-input mt-1.5 ${error ? "field-input-error" : ""}`}
        />
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactEditForm({
  contact,
  onSaved,
}: ContactEditFormProps) {
  const [values, setValues] = useState<FormValues>({
    name: contact.name,
    email: contact.email,
    message: contact.message,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
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
    setFieldErrors({});

    try {
      const response = await fetch(`/api/contact/${contact.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const parsed = (await response
        .json()
        .catch(() => null)) as ContactApiBody | null;

      if (response.ok) {
        setSuccessMessage("Submission updated.");
        const saved = parsed as unknown as StoredContact | null;
        if (saved) {
          onSaved?.(saved);
        }
      } else if (response.status === 400 && parsed?.errors) {
        setFieldErrors(parsed.errors);
      } else {
        setFailureMessage(
          typeof parsed?.error === "string"
            ? parsed.error
            : "Something went wrong. Please try again later.",
        );
      }
    } catch {
      setFailureMessage(
        "Network error. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-5"
    >
      {successMessage && (
        <p role="status" className="banner-success">
          {successMessage}
        </p>
      )}

      {failureMessage && (
        <p role="alert" className="banner-error">
          {failureMessage}
        </p>
      )}

      <Field
        id="name"
        label="Name"
        value={values.name}
        error={fieldErrors.name}
        disabled={submitting}
        onChange={handleFieldChange("name")}
      />

      <Field
        id="email"
        label="Email"
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
        {submitting ? "Saving…" : "Save Changes"}
      </button>
    </form>
  );
}
