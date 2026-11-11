import path from "node:path";
import { readJsonArrayFile, writeJsonArrayFile } from "./jsonFileStore";

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
  const contactsFile = path.join(dataDir, "contacts.json");
  const contacts = await readJsonArrayFile<StoredContact>(contactsFile);

  const stored: StoredContact = {
    id: crypto.randomUUID(),
    ...contact,
    submittedAt: new Date().toISOString(),
  };

  contacts.push(stored);
  await writeJsonArrayFile(contactsFile, contacts);

  return stored;
}
