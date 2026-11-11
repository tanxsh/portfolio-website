export type BlogFields = {
  title: string;
  content: string;
};

export type BlogErrors = {
  title?: string;
  content?: string;
};

export type BlogValidation = {
  valid: boolean;
  errors: BlogErrors;
  data: BlogFields;
};

export function validateBlog(input: BlogFields): BlogValidation {
  const data: BlogFields = {
    title: input.title.trim(),
    content: input.content.trim(),
  };

  const errors: BlogErrors = {};

  if (data.title.length === 0) {
    errors.title = "Title is required.";
  }

  if (data.content.length === 0) {
    errors.content = "Content is required.";
  }

  return { valid: Object.keys(errors).length === 0, errors, data };
}
