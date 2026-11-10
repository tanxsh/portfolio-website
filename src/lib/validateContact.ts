export type ContactFields = {
  name: string;
  email: string;
  message: string;
};

export type ContactErrors = {
  name?: string;
  email?: string;
  message?: string;
};

export type ContactValidation = {
  valid: boolean;
  errors: ContactErrors;
  data: ContactFields;
};

export function validateContact(input: ContactFields): ContactValidation {
  const data: ContactFields = {
    name: input.name.trim(),
    email: input.email.trim(),
    message: input.message.trim(),
  };

  const errors: ContactErrors = {};

  if (data.name.length === 0) {
    errors.name = "Name is required.";
  }

  if (data.message.length === 0) {
    errors.message = "Message is required.";
  }

  const emailError = validateEmail(data.email);
  if (emailError !== undefined) {
    errors.email = emailError;
  }

  return { valid: Object.keys(errors).length === 0, errors, data };
}

function validateEmail(email: string): string | undefined {
  if (email.length === 0) {
    return "Email is required.";
  }

  if (/\s/.test(email)) {
    return "Email must not contain whitespace.";
  }

  if (email.split("@").length - 1 !== 1) {
    return "Email must contain exactly one @.";
  }

  const atIndex = email.indexOf("@");
  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (localPart.length === 0) {
    return "Email must have text before the @.";
  }

  if (!domain.includes(".")) {
    return "Email domain must contain a dot.";
  }

  for (const label of domain.split(".")) {
    if (label.length === 0) {
      return "Email domain must not contain empty labels.";
    }
  }

  return undefined;
}
