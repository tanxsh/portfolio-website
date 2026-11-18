"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import type { Project } from "@/lib/projectStore";

type FieldErrors = {
  title?: string;
  summary?: string;
  description?: string;
  tech?: string;
  link?: string;
};

type FormValues = {
  title: string;
  summary: string;
  description: string;
  tech: string;
  link: string;
};

type ProjectApiBody = {
  error?: unknown;
  errors?: FieldErrors;
};

type FieldProps = {
  id: keyof FormValues;
  label: string;
  type?: "text" | "url";
  multiline?: boolean;
  value: string;
  error: string | undefined;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

type ProjectFormProps = {
  project: Project | null;
  onSaved: (project: Project) => void;
  onReset?: () => void;
};

function Field({
  id,
  label,
  type = "text",
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
          type={type}
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

export default function ProjectForm({
  project,
  onSaved,
  onReset,
}: ProjectFormProps) {
  const [values, setValues] = useState<FormValues>({
    title: project?.title ?? "",
    summary: project?.summary ?? "",
    description: project?.description ?? "",
    tech: project?.tech.join(", ") ?? "",
    link: project?.link ?? "",
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

    const tech = values.tech
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    try {
      const response = await fetch(
        project ? `/api/projects/${project.id}` : "/api/projects",
        {
          method: project ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: values.title,
            summary: values.summary,
            description: values.description,
            tech,
            link: values.link,
          }),
        },
      );
      const parsed = (await response
        .json()
        .catch(() => null)) as ProjectApiBody | null;

      if (response.ok) {
        setSuccessMessage(project ? "Project updated." : "Project created.");
        const saved = parsed as unknown as Project | null;

        if (project) {
          if (saved) {
            setValues({
              title: saved.title,
              summary: saved.summary,
              description: saved.description,
              tech: saved.tech.join(", "),
              link: saved.link,
            });
          }
        } else {
          setValues({ title: "", summary: "", description: "", tech: "", link: "" });
        }

        if (saved) {
          onSaved(saved);
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
      className="flex flex-col gap-5"
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
        id="title"
        label="Title"
        value={values.title}
        error={fieldErrors.title}
        disabled={submitting}
        onChange={handleFieldChange("title")}
      />

      <Field
        id="summary"
        label="Summary"
        value={values.summary}
        error={fieldErrors.summary}
        disabled={submitting}
        onChange={handleFieldChange("summary")}
      />

      <Field
        id="description"
        label="Description"
        multiline
        value={values.description}
        error={fieldErrors.description}
        disabled={submitting}
        onChange={handleFieldChange("description")}
      />

      <Field
        id="tech"
        label="Tech (comma-separated)"
        value={values.tech}
        error={fieldErrors.tech}
        disabled={submitting}
        onChange={handleFieldChange("tech")}
      />

      <Field
        id="link"
        label="Link"
        type="url"
        value={values.link}
        error={fieldErrors.link}
        disabled={submitting}
        onChange={handleFieldChange("link")}
      />

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary self-start"
      >
        {submitting ? "Saving…" : project ? "Save Changes" : "Create Project"}
      </button>

      {project && onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={submitting}
          className="btn-secondary self-start"
        >
          New Project
        </button>
      )}
    </form>
  );
}
