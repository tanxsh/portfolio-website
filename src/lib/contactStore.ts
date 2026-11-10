import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

export type StoredContact = {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
};

const defaultDataDir = path.join(process.cwd(), "data");

export async function appendContact(
  contact: Omit<StoredContact, "id" | "submittedAt">,
  dataDir: string = defaultDataDir,
): Promise<StoredContact> {
  const contacts = await readContacts(dataDir);
  const stored: StoredContact = {
    id: crypto.randomUUID(),
    ...contact,
    submittedAt: new Date().toISOString(),
  };

  contacts.push(stored);
  await writeContacts(contacts, dataDir);

  return stored;
}

async function readContacts(dataDir: string): Promise<StoredContact[]> {
  const contactsFile = path.join(dataDir, "contacts.json");
  let raw: string;

  try {
    raw = await readFile(contactsFile, "utf8");
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
    throw new Error(`${contactsFile} must contain a JSON array of contacts.`);
  }

  return parsed as StoredContact[];
}

async function writeContacts(
  contacts: StoredContact[],
  dataDir: string,
): Promise<void> {
  await mkdir(dataDir, { recursive: true });

  const contactsFile = path.join(dataDir, "contacts.json");
  const tempFile = `${contactsFile}.tmp`;

  await writeFile(tempFile, `${JSON.stringify(contacts, null, 2)}\n`, "utf8");
  await rename(tempFile, contactsFile);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}
