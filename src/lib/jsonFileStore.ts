import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export async function readJsonArrayFile<T>(filePath: string): Promise<T[]> {
  let raw: string;

  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (isMissingFileError(error)) {
      return [];
    }
    throw error;
  }

  if (raw.trim().length === 0) {
    return [];
  }

  const parsed: unknown = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error(`${filePath} must contain a JSON array.`);
  }

  return parsed as T[];
}

export async function writeJsonArrayFile<T>(
  filePath: string,
  items: T[],
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });

  const tempFile = `${filePath}.tmp`;

  await writeFile(tempFile, `${JSON.stringify(items, null, 2)}\n`, "utf8");
  await rename(tempFile, filePath);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
