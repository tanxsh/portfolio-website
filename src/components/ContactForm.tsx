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

function inputClassName(hasError: boolean) {
  return hasError
    ? "w-full rounded-lg border border-red-500 bg-transparent px-3 py-2 text-sm focus:border-red-500 focus:outline-none"
    : "w-full rounded-lg border border-zinc-300 bg-transparent px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none dark:border-zinc-700 dark:focus:border-zinc-400";
}

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
      <label htmlFor={id} className="block text-sm font-medium">
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
          className={`mt-1.5 ${inputClassName(Boolean(error))}`}
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
          className={`mt-1.5 ${inputClassName(Boolean(error))}`}
        />
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default function ContactForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
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
      const response = await fetch("/api/contact-server-form", {
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
      className="mt-8 flex max-w-xl flex-col gap-5"
    >
      {successMessage && (
        <p
          role="status"
          className="rounded-lg border border-green-600 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-300"
        >
          {successMessage}
        </p>
      )}

      {failureMessage && (
        <p
          role="alert"
          className="rounded-lg border border-red-600 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
        >
          {failureMessage}
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
        className="self-start rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}
