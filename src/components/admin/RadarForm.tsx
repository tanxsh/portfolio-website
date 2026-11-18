"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  RADAR_CATEGORIES,
  RADAR_RINGS,
  type RadarCategory,
  type RadarErrors,
  type RadarRing,
} from "@/lib/validateRadarItem";
import type { RadarItem } from "@/lib/radarStore";

type FormValues = {
  name: string;
  category: RadarCategory;
  ring: RadarRing;
  note: string;
};

type RadarApiBody = {
  error?: unknown;
  errors?: RadarErrors;
};

type RadarFormProps = {
  item?: RadarItem | null;
  onSaved?: (item: RadarItem) => void;
  onReset?: () => void;
};

const NOTE_MAX_LENGTH = 200;

const initialValues: FormValues = {
  name: "",
  category: "Languages",
  ring: "Adopt",
  note: "",
};

export default function RadarForm({ item, onSaved, onReset }: RadarFormProps) {
  const [values, setValues] = useState<FormValues>(
    item
      ? {
          name: item.name,
          category: item.category as RadarCategory,
          ring: item.ring as RadarRing,
          note: item.note,
        }
      : initialValues,
  );
  const [fieldErrors, setFieldErrors] = useState<RadarErrors>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFieldChange(
    field: keyof FormValues,
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { value } = event.target;
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setSuccessMessage(null);
    setFailureMessage(null);
    setFieldErrors({});

    try {
      const response = await fetch(item ? `/api/radar/${item.id}` : "/api/radar", {
        method: item ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const parsed = (await response
        .json()
        .catch(() => null)) as RadarApiBody | null;

      if (response.ok) {
        const saved = parsed as unknown as RadarItem | null;

        if (item) {
          setSuccessMessage("Radar item updated.");
        } else {
          setSuccessMessage("Radar item created.");
          setValues(initialValues);
        }

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

      <div>
        <label htmlFor="name" className="field-label">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={values.name}
          onChange={(event) => handleFieldChange("name", event)}
          disabled={submitting}
          aria-invalid={fieldErrors.name ? true : undefined}
          aria-describedby={fieldErrors.name ? "name-error" : undefined}
          className={`field-input mt-1.5 ${fieldErrors.name ? "field-input-error" : ""}`}
        />
        {fieldErrors.name && (
          <p id="name-error" className="field-error">
            {fieldErrors.name}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="category" className="field-label">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={values.category}
          onChange={(event) => handleFieldChange("category", event)}
          disabled={submitting}
          aria-invalid={fieldErrors.category ? true : undefined}
          aria-describedby={fieldErrors.category ? "category-error" : undefined}
          className={`field-input mt-1.5 ${fieldErrors.category ? "field-input-error" : ""}`}
        >
          {RADAR_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {fieldErrors.category && (
          <p id="category-error" className="field-error">
            {fieldErrors.category}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="ring" className="field-label">
          Ring
        </label>
        <select
          id="ring"
          name="ring"
          value={values.ring}
          onChange={(event) => handleFieldChange("ring", event)}
          disabled={submitting}
          aria-invalid={fieldErrors.ring ? true : undefined}
          aria-describedby={fieldErrors.ring ? "ring-error" : undefined}
          className={`field-input mt-1.5 ${fieldErrors.ring ? "field-input-error" : ""}`}
        >
          {RADAR_RINGS.map((ring) => (
            <option key={ring} value={ring}>
              {ring}
            </option>
          ))}
        </select>
        {fieldErrors.ring && (
          <p id="ring-error" className="field-error">
            {fieldErrors.ring}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="field-label">
          Note (optional)
        </label>
        <textarea
          id="note"
          name="note"
          rows={4}
          value={values.note}
          onChange={(event) => handleFieldChange("note", event)}
          disabled={submitting}
          aria-invalid={fieldErrors.note ? true : undefined}
          aria-describedby={fieldErrors.note ? "note-error" : undefined}
          className={`field-input mt-1.5 ${fieldErrors.note ? "field-input-error" : ""}`}
        />
        <p className="mt-1 text-xs text-muted">
          {values.note.length} / {NOTE_MAX_LENGTH}
        </p>
        {fieldErrors.note && (
          <p id="note-error" className="field-error">
            {fieldErrors.note}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="btn-primary self-start"
      >
        {submitting ? "Saving…" : item ? "Save Changes" : "Create Item"}
      </button>

      {item && onReset && (
        <button
          type="button"
          onClick={onReset}
          disabled={submitting}
          className="btn-secondary self-start"
        >
          New Item
        </button>
      )}
    </form>
  );
}
