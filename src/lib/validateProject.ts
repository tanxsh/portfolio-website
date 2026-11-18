export type ProjectFields = {
  title: string;
  summary: string;
  description: string;
  tech: string[];
  link: string;
};

export type ProjectInput = {
  title?: unknown;
  summary?: unknown;
  description?: unknown;
  tech?: unknown;
  link?: unknown;
};

export type ProjectErrors = {
  title?: string;
  summary?: string;
  description?: string;
  tech?: string;
  link?: string;
};

export type ProjectValidation = {
  valid: boolean;
  errors: ProjectErrors;
  data: ProjectFields;
};

export function validateProject(input: ProjectInput): ProjectValidation {
  const data: ProjectFields = {
    title: typeof input.title === "string" ? input.title.trim() : "",
    summary: typeof input.summary === "string" ? input.summary.trim() : "",
    description:
      typeof input.description === "string" ? input.description.trim() : "",
    tech: Array.isArray(input.tech)
      ? input.tech.map((item) => (typeof item === "string" ? item.trim() : ""))
      : [],
    link: typeof input.link === "string" ? input.link.trim() : "",
  };

  const errors: ProjectErrors = {};

  if (data.title.length === 0) {
    errors.title = "Title is required.";
  }

  if (data.summary.length === 0) {
    errors.summary = "Summary is required.";
  }

  if (data.description.length === 0) {
    errors.description = "Description is required.";
  }

  if (data.tech.length === 0 || data.tech.some((item) => item.length === 0)) {
    errors.tech = "Tech must be a non-empty array of non-blank strings.";
  }

  const linkError = validateLink(data.link);
  if (linkError !== undefined) {
    errors.link = linkError;
  }

  return { valid: Object.keys(errors).length === 0, errors, data };
}

function validateLink(link: string): string | undefined {
  if (link.length === 0) {
    return "Link is required.";
  }

  let url: URL;

  try {
    url = new URL(link);
  } catch {
    return "Link must be a valid URL.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Link must use http or https.";
  }

  return undefined;
}
