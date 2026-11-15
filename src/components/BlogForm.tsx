"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";

type FieldErrors = {
  title?: string;
  content?: string;
};

type FormValues = {
  title: string;
  content: string;
};

type BlogApiBody = {
  error?: unknown;
  errors?: FieldErrors;
  slug?: unknown;
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

const initialValues: FormValues = { title: "", content: "" };

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
          rows={10}
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

export default function BlogForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
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
    setCreatedSlug(null);
    setFailureMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const parsed = (await response
        .json()
        .catch(() => null)) as BlogApiBody | null;

      if (response.ok) {
        setCreatedSlug(typeof parsed?.slug === "string" ? parsed.slug : null);
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
      {createdSlug && (
        <p
          role="status"
          className="banner-success"
        >
          Post published!{" "}
          <Link
            href={`/blogs/${createdSlug}`}
            className="underline hover:opacity-80"
          >
            View it at /blogs/{createdSlug}
          </Link>
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

      <Field
        id="title"
        label="Title"
        value={values.title}
        error={fieldErrors.title}
        disabled={submitting}
        onChange={handleFieldChange("title")}
      />

      <Field
        id="content"
        label="Content"
        multiline
        value={values.content}
        error={fieldErrors.content}
        disabled={submitting}
        onChange={handleFieldChange("content")}
      />

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary self-start"
      >
        {submitting ? "Publishing…" : "Publish Post"}
      </button>
    </form>
  );
}
