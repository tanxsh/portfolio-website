export function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "post";
}

export function uniqueSlug(base: string, taken: ReadonlySet<string>): string {
  let candidate = base;
  let counter = 2;

  while (taken.has(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}
